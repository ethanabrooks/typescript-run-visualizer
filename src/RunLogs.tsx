import React from "react";
import { PlainObject, Vega, View, VisualizationSpec } from "react-vega";
import { useApolloClient } from "@apollo/client";
import spec from "./Spec.json";
import { loader } from "graphql.macro";

type Log = {
  log: object;
  runid: number;
  id: number;
};
type Data = { runId: string };
const logToData = ({ log, runid: c }: Log): Data => ({
  runId: `run ${c}`,
  ...log
});

const Chart = ({}) => {};

const queryOldLogs = loader("./queryOldLogs.graphql");
export const RunLogs = ({
  newLog,
  sweepId
}: {
  newLog: Log;
  sweepId: number;
}) => {
  const [data, setData] = React.useState(null);
  const [view, setView] = React.useState<null | View>(null);
  const client = useApolloClient();

  React.useEffect(
    () => {
      if (view != null && newLog != null) {
        const cs = view.changeset().insert(logToData(newLog));
        view.change("data", cs).run();
      }
    },
    [newLog, view]
  );

  React.useEffect(
    () => {
      (async () => {
        const {
          error,
          data: { run_log }
        } = await client.query({
          query: queryOldLogs,
          variables: {
            sweepId: sweepId,
            upTo: newLog === null ? 0 : newLog.id
          }
        });
        let data = run_log.map(logToData);
        setData(data);
        if (error) {
          console.error(error);
        }
      })();
    },
    [view, setData]
  );

  return data == null ? (
    <span>{"Waiting for data..."}</span>
  ) : (
    <Vega
      spec={spec as VisualizationSpec}
      renderer={"svg"}
      data={{ data: data } as PlainObject}
      onNewView={setView}
    />
  );
};
