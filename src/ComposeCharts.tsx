import React, { FC } from "react";
import { useApolloClient } from "@apollo/client";
import { loader } from "graphql.macro";
import { Chart, Data } from "./Chart";
import Spec from "./Spec.json";
import { VisualizationSpec } from "react-vega";

type Log = {
  log: Record<string, unknown>;
  runid: number;
  id: number;
};
const logToData = ({ log, runid: c }: Log): Data => ({
  runId: `run ${c}`,
  ...log
});

const queryOldLogs = loader("./queryOldLogs.graphql");
type Props = {
  newLog: Log;
  sweepId: number;
};
export const ComposeCharts: FC<Props> = ({ newLog, sweepId }: Props) => {
  const [data, setData] = React.useState<null | Data[]>(null);
  const client = useApolloClient();

  React.useEffect(() => {
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
      setData(run_log.map(logToData));
      if (error) {
        console.error(error);
      }
    })();
  }, []);

  return data == null ? (
    <span>{"Waiting for data..."}</span>
  ) : (
    <React.Fragment>
      <Chart
        data={data}
        newData={logToData(newLog)}
        spec={Spec as VisualizationSpec}
      />
      <Chart
        data={data}
        newData={logToData(newLog)}
        spec={Spec as VisualizationSpec}
      />
    </React.Fragment>
  );
};
