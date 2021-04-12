import React, { FC } from "react";
import { Chart, Data } from "./Chart";
import Spec from "./Spec.json";
import { VisualizationSpec } from "react-vega";

type Props = { data: Data[] };
export const ComposeCharts: FC<Props> = ({ data }: Props) => {
  return data == null ? (
    <span>{"Waiting for data..."}</span>
  ) : (
    <React.Fragment>
      <Chart data={data} spec={Spec as VisualizationSpec} />
      <Chart data={data} spec={Spec as VisualizationSpec} />
    </React.Fragment>
  );
};
