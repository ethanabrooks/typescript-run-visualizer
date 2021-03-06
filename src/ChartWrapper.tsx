import React, { FC } from "react";
import { VisualizationSpec } from "react-vega";
import { Chart, DataPoint } from "./Chart";
import { CopyToClipboard } from "react-copy-to-clipboard";


type State =
  | { editing: true; text: string }
  | { editing: false; spec: VisualizationSpec };
export const ChartWrapper: FC<{
  spec?: VisualizationSpec;
  data: DataPoint[];
  onButtonClick?: (spec: VisualizationSpec) => void;
}> = ({ spec, data, onButtonClick }) => {
  const initialState: State =
    spec === undefined
      ? { editing: true, text: "{}" }
      : { editing: false, spec: spec };
  const [state, setState] = React.useState<State>(initialState);

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
          <label className="label">Edit Vega Spec</label>
          <textarea
            onChange={({ target }) =>
              setState({ ...state, text: target.value })
            }
            className={`textarea ${error == null ? "" : "is-danger"}`}
            placeholder={"Enter new vega spec"}
            value={state.text}
          />
        </div>
        {error == null ? null : <span>{error.message}</span>}
        <div className="field is-grouped">
          <button
            className="button is-link"
            onClick={() => {
              if (textSpec != null) {
                setState({
                  editing: false,
                  spec: textSpec
                });
                if (onButtonClick != null) onButtonClick(textSpec);
              }
            }}
          >
            Submit
          </button>
        </div>
      </React.Fragment>
    );
  } else {
    const text = JSON.stringify(spec);
    const copy = JSON.parse(text);
    if (copy.data !== undefined) copy.data.values = data.slice(0, 20);

    return (
      <React.Fragment>
        <div className="field">
          <Chart dataPoints={data} spec={state.spec} />
        </div>
        <div className="field is-grouped">
          <button
            className="button"
            onClick={() => {
              setState({
                editing: true,
                text
              });
            }}
          >
            Edit
          </button>
          <CopyToClipboard text={JSON.stringify(spec, null, 2)}>
            <button className={"button"}>Copy Vega spec</button>
          </CopyToClipboard>{" "}
          <CopyToClipboard text={JSON.stringify(copy, null, 2)}>
            <button className={"button"}>Copy Vega spec with data</button>
          </CopyToClipboard>{" "}
        </div>
      </React.Fragment>
    );
  }
};
