import React, { FC } from "react";
import { Chart, Data } from "./Chart";
import { VisualizationSpec } from "react-vega";
import Spec from "./Spec.json";

type Props = { data: Data };
export const ComposeCharts: FC<Props> = ({ data }: Props) => {
  let specs = data.charts;
  if (specs == undefined) {
    specs = [Spec as VisualizationSpec];
  }
  return (
    <React.Fragment>
      {specs.map((spec: VisualizationSpec, i: number) => (
        <Chart key={i} dataPoints={data.dataPoints} spec={spec} />
      ))}
    </React.Fragment>
  );
};
