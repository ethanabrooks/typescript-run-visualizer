export const spec = {
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  description: "Streaming Data",
  height: 200,
  width: 600,
  data: { name: "data" },
  layer: [
    {
      encoding: {
        x: {
          field: "x",
          type: "quantitative",
          axis: {
            title: "x axis"
          }
        },
        y: {
          field: "value",
          type: "quantitative",
          axis: {
            title: "values"
          }
        }
      },
      layer: [
        {
          mark: {
            type: "area",
            line: {
              color: "darkslategray"
            },
            color: {
              x1: 1,
              y1: 1,
              x2: 1,
              y2: 0,
              gradient: "linear",
              stops: [
                {
                  offset: 0,
                  color: "white"
                },
                {
                  offset: 1,
                  color: "darkslategray"
                }
              ]
            }
          }
        },
        {
          // @ts-ignore
          selection: {
            label: {
              type: "single",
              nearest: true,
              on: "mouseover",
              encodings: ["x"],
              empty: "none"
            }
          },
          mark: { type: "rule", color: "gray" },
          encoding: {
            tooltip: [{ field: "value", title: "value ", type: "ordinal" }],
            opacity: {
              condition: { selection: "label", value: 1 },
              value: 0
            }
          }
        }
      ]
    }
  ]
};
