import { useSubscription } from "@apollo/client";
import { ComposeCharts } from "./ComposeCharts";
import React, { FC } from "react";
import { loader } from "graphql.macro";
import { useParams } from "react-router-dom";

const notifyNewLog = loader("./notifyNewLog.graphql");
export const GetRunLogs: FC = () => {
  const { sweepId: stringSweepId } = useParams<{ sweepId: string }>();
  const sweepId = +stringSweepId;
  console.log(stringSweepId);
  console.log(sweepId);
  const { loading, error, data } = useSubscription(notifyNewLog, {
    variables: { sweepId: sweepId }
  });
  if (loading) {
    return <span>Loading...</span>;
  }
  if (error) {
    console.log(error);
    return <span>Error</span>;
  }
  return (
    <ComposeCharts
      newLog={data.run_log.length ? data.run_log[0] : null}
      sweepId={sweepId}
    />
  );
};