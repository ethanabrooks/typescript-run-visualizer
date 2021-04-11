import { useSubscription } from "@apollo/client";
import { RunLogs } from "./RunLogs";
import React, { FC } from "react";
import { loader } from "graphql.macro";

const notifyNewLog = loader("./notifyNewLog.graphql");
type Props = {
  sweepId: number;
};
export const RunLogSubscription: FC<Props> = ({ sweepId }: Props) => {
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
