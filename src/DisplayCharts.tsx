import React, { FC } from "react";
import { Data } from "./Chart";
import { ChartWrapper } from "./ChartWrapper";
import Spec from "./Spec.json";
import { VisualizationSpec } from "react-vega";

type Props = { data: Data };
export const DisplayCharts: FC<Props> = ({ data }: Props) => {
  let charts = data.charts;
  if (charts === undefined) {
    charts = [Spec as VisualizationSpec];
  }
  return (
    <React.Fragment>
      {charts.map((chart, i) => (
        <ChartWrapper key={i} spec={chart} data={data.dataPoints} />
      ))}
    </React.Fragment>
  );
};
