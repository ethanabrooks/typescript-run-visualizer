import React, { FC } from "react";
import { PlainObject, Vega, View, VisualizationSpec } from "react-vega";

export type Data = { runId: string };

type Props = { data: Data[]; newData: Data; spec: VisualizationSpec };
export const Chart: FC<Props> = ({ data, newData, spec }: Props) => {
  const [view, setView] = React.useState<null | View>(null);
  React.useEffect(
    () => {
      if (view != null) {
        const cs = view.changeset().insert(newData);
        view.change("data", cs).run();
      }
    },
    [newData, view]
  );
  return (
    <Vega
      spec={spec}
      renderer={"svg"}
      data={{ data } as PlainObject}
      onNewView={setView}
    />
  );
};
