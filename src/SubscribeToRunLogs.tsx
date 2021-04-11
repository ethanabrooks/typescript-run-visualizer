import { useSubscription } from "@apollo/client";
import { GetOldData } from "./GetOldData";
import React, { FC } from "react";
import { loader } from "graphql.macro";

const notifyNewLog = loader("./notifyNewLog.graphql");
type Props = {
  sweepId: number;
};
export const SubscribeToRunLogs: FC<Props> = ({ sweepId }: Props) => {
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
    <GetOldData
      newLog={data.run_log.length ? data.run_log[0] : null}
      sweepId={sweepId}
    />
  );
};
