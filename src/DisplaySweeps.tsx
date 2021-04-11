import React, { FC } from "react";

type Parameter = {
  key: string;
  values: unknown[];
};
type Sweep = {
  id: number;
  metadata: Record<string, unknown>;
  sweep_parameters: Parameter[];
};

export const DisplaySweeps: FC<{ sweeps: Sweep[] }> = ({ sweeps }) => {
  return <div />;
};
