import { ApolloError, useApolloClient, useSubscription } from "@apollo/client";
import { DisplayCharts } from "./DisplayCharts";
import React, { FC, useState } from "react";
import { loader } from "graphql.macro";
import { useParams } from "react-router-dom";
import { Data, DataPoint } from "./Chart";

const unpackData = ({
  log,
  runid,
  id
}: {
  log: Record<string, unknown>;
  runid: number;
  id: number;
}): DataPoint => {
  return {
    logId: id,
    runId: runid,
    ...log
  };
};

const logSubscription = loader("./logSubscription.graphql");
const sweepQuery = loader("./sweepQuery.graphql");
function useData(
  sweepId: number
): {
  loading: boolean;
  error: ApolloError | undefined;
  data: undefined | Data;
} {
  const [data, setData] = useState<undefined | Data>(undefined);
  const [error, setError] = useState<undefined | ApolloError>(undefined);
  const {
    loading,
    error: subscriptionError,
    data: subscriptionData
  } = useSubscription(logSubscription, {
    variables: { sweepId }
  });
  const client = useApolloClient();

  React.useEffect(
    () => {
      if (subscriptionError) {
        setError(subscriptionError);
      } else if (!loading && subscriptionData.run_log.length) {
        const newData = unpackData(subscriptionData.run_log[0]);
        if (data !== undefined) {
          // append new data
          setData({ ...data, dataPoints: [...data.dataPoints, newData] });
        } else {
          // get old data
          (async () => {
            const { error, data } = await client.query({
              query: sweepQuery,
              variables: {
                sweepId,
                upTo: newData.logId
              }
            });
            if (error) {
              setError(error);
            } else if (data.sweep.length) {
              const [{ runs, metadata }] = data.sweep;
              const oldData = runs
                .map(
                  ({
                    run_logs
                  }: {
                    run_logs: {
                      id: number;
                      runid: number;
                      log: Record<string, unknown>;
                    }[];
                  }) => run_logs
                )
                .flat()
                .sort(
                  ({ id: id1 }: { id: number }, { id: id2 }: { id: number }) =>
                    id1 - id2
                )
                .map(unpackData);
              setData({ ...metadata, dataPoints: [...oldData, newData] });
            }
          })();
        }
      }
    },
    [subscriptionData]
  );

  return { loading, error, data };
}

export const GetSweepData: FC = () => {
  const { sweepId: stringSweepId } = useParams<{ sweepId: string }>();
  const sweepId = +stringSweepId;
  const { loading, error, data } = useData(sweepId);

  if (loading) {
    return <span>Loading...</span>;
  }
  if (error) {
    console.log(error);
    return <span>Error</span>;
  }

  if (data == null) return <span>Waiting for data...</span>;
  console.log(data);
  return <DisplayCharts data={data} />;
};
