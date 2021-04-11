import React from "react";
import { PlainObject, Vega, View, VisualizationSpec } from "react-vega";
import spec from "./Spec.json";

export type Data = { runId: string };

export function Chart({ data, newData }: { data: Data[]; newData: Data }) {
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
      spec={spec as VisualizationSpec}
      renderer={"svg"}
      data={{ data } as PlainObject}
      onNewView={setView}
    />
  );
}
