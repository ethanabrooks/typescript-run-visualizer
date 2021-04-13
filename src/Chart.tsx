import React, { FC } from "react";
import { Vega, View, VisualizationSpec } from "react-vega";

export type DataPoint = { runId: number; logId: number };
export type Data = {
  charts: VisualizationSpec[] | undefined;
  dataPoints: DataPoint[];
  metadata: unknown;
};

type Props = { dataPoints: DataPoint[]; spec: VisualizationSpec };
export const Chart: FC<Props> = ({ dataPoints, spec }: Props) => {
  const [view, setView] = React.useState<null | View>(null);
  const [initialData, setInitialData] = React.useState<null | DataPoint[]>(
    null
  );
  React.useEffect(
    () => {
      if (initialData === null) {
        setInitialData(dataPoints);
      } else if (dataPoints.length && view != null) {
        const cs = view.changeset().insert(dataPoints[dataPoints.length - 1]);
        view.change("data", cs).run();
      }
    },
    [dataPoints, view]
  );
  return <Vega spec={spec} data={{ data: dataPoints }} onNewView={setView} />;
};
