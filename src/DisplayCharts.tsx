import React, { FC } from "react";
import { Data } from "./Chart";
import { ChartWrapper } from "./ChartWrapper";

type Props = { data: Data };
export const DisplayCharts: FC<Props> = ({ data }: Props) => {
  return (
    <React.Fragment>
      {data.charts.map((chart, i) => (
        <ChartWrapper key={i} spec={chart} data={data.dataPoints} />
      ))}
    </React.Fragment>
  );
};
