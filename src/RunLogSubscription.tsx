import { useSubscription } from "@apollo/client";
import { RunLogs } from "./RunLogs";
import React from "react";
import { loader } from "graphql.macro";

const notifyNewLog = loader("./notifyNewLog.graphql");
export const RunLogSubscription = ({ sweepId }: { sweepId: number }) => {
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
    <RunLogs
      newLog={data.run_log.length ? data.run_log[0] : null}
      sweepId={sweepId}
    />
  );
};
