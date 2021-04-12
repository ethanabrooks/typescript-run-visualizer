import { ApolloError, useApolloClient, useSubscription } from "@apollo/client";
import { ComposeCharts } from "./ComposeCharts";
import React, { FC, useState } from "react";
import { loader } from "graphql.macro";
import { useParams } from "react-router-dom";
import { Data } from "./Chart";

const unpackData = ({
  log,
  runid,
  id
}: {
  log: Record<string, unknown>;
  runid: number;
  id: number;
}): Data => {
  return {
    logId: id,
    runId: runid,
    ...log
  };
};

const notifyNewLog = loader("./logSubscription.graphql");
function useData(
  sweepId: number
): {
  loading: boolean;
  error: ApolloError | undefined;
  data: undefined | Data[];
} {
  const [data, setData] = useState<undefined | Data[]>(undefined);
  const [error, setError] = useState<undefined | ApolloError>(undefined);
  const {
    loading,
    error: subscriptionError,
    data: subscriptionData
  } = useSubscription(notifyNewLog, {
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
          setData([...data, newData]);
        } else {
          // get old data
          (async () => {
            const {
              error,
              data: { run_log }
            } = await client.query({
              query: loader("./oldLogsQuery.graphql"),
              variables: {
                sweepId,
                upTo: newData.logId
              }
            });
            if (error) {
              setError(error);
            } else {
              const oldData = run_log.map(unpackData);
              setData([...oldData, newData]);
            }
          })();
        }
      }
    },
    [subscriptionData]
  );

  return { loading, error, data };
}

export const GetRunLogs: FC = () => {
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
  return <ComposeCharts data={data} />;
};
