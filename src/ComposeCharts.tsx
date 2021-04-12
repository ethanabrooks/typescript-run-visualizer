import React, { FC } from "react";
import { Chart, Data } from "./Chart";
import { VisualizationSpec } from "react-vega";

type Props = { data: Data };
export const ComposeCharts: FC<Props> = ({ data }: Props) =>
  data.charts == undefined ? (
    <span>No chart specs found in sweep logs.</span>
  ) : (
    <React.Fragment>
      {data.charts.map((spec: VisualizationSpec, i: number) => (
        <Chart key={i} dataPoints={data.dataPoints} spec={spec} />
      ))}
    </React.Fragment>
  );
