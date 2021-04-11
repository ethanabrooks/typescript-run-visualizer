// From https://vega.github.io/vega/examples/bar-chart/

import { VisualizationSpec } from "react-vega";

export default {
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  description: "A basic line chart example.",
  width: 500,
  height: 200,

  encoding: {
    x: {
      field: "x",
      type: "quantitative",
      axis: {
        title: "x axis"
      }
    },
    y: {
      field: "y",
      type: "quantitative",
      axis: {
        title: "values"
      }
    },
    color: {
      field: "c",
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
          { field: "x", title: "step ", type: "quantitative" },
          { field: "y", title: "value ", type: "quantitative" },
          { field: "c", title: "run ", type: "nominal" }
        ]
      },
      mark: { type: "rule", opacity: 0 }
    }
  ],
  data: { name: "data" }
} as VisualizationSpec;
