import React, { FC } from "react";
import { Chart, Data } from "./Chart";
import { VisualizationSpec } from "react-vega";
import Spec from "./Spec.json";

type Props = { data: Data };
export const ComposeCharts: FC<Props> = ({ data }: Props) => {
  const [text, setText] = React.useState("");
  let initialCharts;

  const [specs, setSpecs] = React.useState<
    {
      editing: boolean;
      spec: VisualizationSpec;
    }[]
  >(
    data.charts == undefined
      ? [{ editing: false, spec: Spec as VisualizationSpec }]
      : data.charts.map(spec => ({
          editing: false,
          spec: spec as VisualizationSpec
        }))
  );
  console.log(specs);
  return (
    <div className="container">
      {specs.map(
        (
          { editing, spec }: { editing: boolean; spec: VisualizationSpec },
          i
        ) => {
          console.log(spec);
          return <Chart key={i} dataPoints={data.dataPoints} spec={spec} />;
        }
      )}
      <div className="field">
        <label className="label">Message</label>
        <div className="control">
          <textarea
            onChange={({ target }) => setText(target.value)}
            className="textarea"
            placeholder="Enter new vega spec"
          />
        </div>
      </div>
      <div className="field is-grouped">
        <div className="control">
          <button
            className="button is-link"
            onClick={() => {
              //   if (text != "")
              //     setSpecs([
              //       ...specs,
              //       { editing: false, spec: text as VisualizationSpec }
              //     ]);
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};
