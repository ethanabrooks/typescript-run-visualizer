import React, { FC } from "react";
import { Data } from "./Chart";
import { ChartWrapper } from "./ChartWrapper";
import Spec from "./Spec.json";
import { VisualizationSpec } from "react-vega";

type Props = { data: Data };
export const DisplaySweep: FC<Props> = ({ data }: Props) => {
  let initialCharts = data.charts;
  if (initialCharts === undefined) {
    initialCharts = [Spec as VisualizationSpec];
  }
  const [charts, setCharts] = React.useState<VisualizationSpec[]>(
    initialCharts
  );
  return (
    <React.Fragment>
      <div>
        <pre>{JSON.stringify(data.metadata, null, 2)}</pre>
      </div>
      {charts.map((chart, i) => (
        <ChartWrapper key={i} spec={chart} data={data.dataPoints} />
      ))}
      {
        <ChartWrapper
          key={-1}
          data={data.dataPoints}
          onButtonClick={spec => setCharts([...charts, spec])}
        />
      }
    </React.Fragment>
  );
};
