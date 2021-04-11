import { useSubscription } from "@apollo/client";
import React, { FC } from "react";
import { loader } from "graphql.macro";

const notifyNewSweep = loader("./notifyNewSweep.graphql");
export const SubscribeToSweep: FC = () => {
  const { loading, error, data } = useSubscription(notifyNewSweep);
  if (loading) {
    return <span>Loading...</span>;
  }
  if (error) {
    console.log(error);
    return <span>Error</span>;
  }
  return <div />;
};
