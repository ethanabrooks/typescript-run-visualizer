import { ApolloError, useSubscription } from "@apollo/client";
import React, { FC } from "react";
import { loader } from "graphql.macro";
import { DisplaySweeps, Sweep } from "./DisplaySweeps";

const unpackSweep = ({
  id,
  metadata,
  sweep_parameters
}: {
  id: number;
  metadata: Record<string, unknown>;
  sweep_parameters: { key: string; values: unknown[] }[];
}): Sweep => {
  return {
    id,
    metadata,
    params: new Map(sweep_parameters.map(({ key, values }) => [key, values]))
  };
};

const notifyNewSweep = loader("./notifyNewSweep.graphql");
function useSweeps(): {
  loading: boolean;
  error: ApolloError | undefined;
  data: Sweep[] | undefined;
} {
  const { loading, error, data: subscriptionData } = useSubscription(
    notifyNewSweep
  );

  const data =
    error || loading || !subscriptionData.sweep.length
      ? undefined
      : subscriptionData.map(unpackSweep);

  return { loading, error, data };
}
export const GetSweeps: FC = () => {
  const { loading, error, data } = useSweeps();
  if (loading) {
    return <span>Loading...</span>;
  }
  if (error) {
    console.log(error);
    return <span>Error</span>;
  }
  if (data === undefined) return <span>Waiting for sweep data...</span>;
  return <DisplaySweeps sweeps={data} />;
};
