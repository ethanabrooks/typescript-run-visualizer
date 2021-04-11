// From https://vega.github.io/vega/examples/bar-chart/

import { VisualizationSpec } from "react-vega";

export default {
  $schema: "https://vega.github.io/schema/vega/v5.json",
  description: "A basic line chart example.",
  width: 500,
  height: 200,
  padding: 5,

  signals: [
    {
      name: "interpolate",
      value: "linear",
      bind: {
        input: "select",
        options: [
          "basis",
          "cardinal",
          "catmull-rom",
          "linear",
          "monotone",
          "natural",
          "step",
          "step-after",
          "step-before"
        ]
      }
    }
  ],

  data: [
    {
      name: "values",
      values: []
    }
  ],

  scales: [
    {
      name: "x",
      type: "linear",
      range: "width",
      domain: { data: "values", field: "x" }
    },
    {
      name: "y",
      type: "linear",
      range: "height",
      nice: true,
      zero: true,
      domain: { data: "values", field: "y" }
    },
    {
      name: "color",
      type: "ordinal",
      range: "category",
      domain: { data: "values", field: "c" }
    }
  ],

  axes: [{ orient: "bottom", scale: "x" }, { orient: "left", scale: "y" }],

  marks: [
    {
      type: "group",
      from: {
        facet: {
          name: "series",
          data: "values",
          groupby: "c"
        }
      },
      marks: [
        {
          type: "line",
          from: { data: "series" },
          encode: {
            enter: {
              x: { scale: "x", field: "x" },
              y: { scale: "y", field: "y" },
              stroke: { scale: "color", field: "c" },
              strokeWidth: { value: 2 }
            },
            update: {
              interpolate: { signal: "interpolate" },
              strokeOpacity: { value: 1 }
            },
            hover: {
              strokeOpacity: { value: 0.5 }
            }
          }
        }
      ]
    }
  ]
} as VisualizationSpec;
