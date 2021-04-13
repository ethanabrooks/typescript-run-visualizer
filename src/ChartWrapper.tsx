import React, { FC } from "react";
import { VisualizationSpec } from "react-vega";
import { Chart, DataPoint } from "./Chart";

type State =
  | { editing: true; text: string }
  | { editing: false; spec: VisualizationSpec };
export const ChartWrapper: FC<{
  spec: VisualizationSpec | null;
  data: DataPoint[];
}> = ({ spec, data }) => {
  const [state, setState] = React.useState<State>(
    spec == null ? { editing: true, text: "" } : { editing: false, spec }
  );

  if (state.editing) {
    let textSpec: null | VisualizationSpec = null;
    let error = null;
    try {
      textSpec = JSON.parse(state.text) as VisualizationSpec;
    } catch (e) {
      error = e;
    }
    return (
      <React.Fragment>
        <div className="field">
          <label className="label">Message</label>
          <textarea
            onChange={({ target }) =>
              setState({ ...state, text: target.value })
            }
            className="textarea"
            placeholder="Enter new vega spec"
          />
        </div>
        <div className="field is-grouped">
          <button
            className="button is-link"
            onClick={() => {
              if (textSpec != null) {
                setState({
                  editing: false,
                  spec: textSpec
                });
              }
            }}
          >
            Submit
          </button>
        </div>
        {error == null ? null : <span>error</span>}
      </React.Fragment>
    );
  } else {
    return (
      <React.Fragment>
        <div className="field">
          <Chart dataPoints={data} spec={state.spec} />;
        </div>
        <div className="field is-grouped">
          <button
            className="button is-link"
            onClick={() => {
              setState({
                editing: true,
                text: JSON.stringify(spec)
              });
            }}
          >
            Edit
          </button>
        </div>
      </React.Fragment>
    );
  }
};
