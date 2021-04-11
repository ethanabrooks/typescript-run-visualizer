// From https://vega.github.io/vega/examples/bar-chart/

import { VisualizationSpec } from "react-vega";

export default {
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  description: "A basic line chart example.",
  width: 500,
  height: 200,

  encoding: {
    x: {
      field: "step",
      type: "quantitative",
      axis: {
        title: "x axis"
      }
    },
    y: {
      field: "Episode return",
      type: "quantitative",
      axis: {
        title: "values"
      }
    },
    color: {
      field: "runId",
      type: "nominal"
    }
  },
  layer: [
    { mark: "line" },
    {
      selection: {
        label: {
          type: "single",
          nearest: true,
          on: "mouseover"
        }
      },
      encoding: {
        tooltip: [
          { field: "step", title: "step ", type: "quantitative" },
          { field: "Episode return", title: "value ", type: "quantitative" },
          { field: "runId", title: "run ", type: "nominal" }
        ]
      },
      mark: { type: "rule", opacity: 0 }
    }
  ],
  data: { name: "data" }
} as VisualizationSpec;
