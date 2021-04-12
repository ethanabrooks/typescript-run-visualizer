import React, { FC } from "react";
import { Vega, View, VisualizationSpec } from "react-vega";

export type Data = { runId: number; logId: number };

type Props = { data: Data[]; spec: VisualizationSpec };
export const Chart: FC<Props> = ({ data, spec }: Props) => {
  const [view, setView] = React.useState<null | View>(null);
  const [initialData, setInitialData] = React.useState<null | Data[]>(null);
  React.useEffect(
    () => {
      if (initialData === null) {
        setInitialData(data);
      } else if (data.length && view != null) {
        const cs = view.changeset().insert(data[data.length - 1]);
        view.change("data", cs).run();
      }
    },
    [data, view]
  );
  return <Vega spec={spec} data={{ data }} onNewView={setView} />;
};
