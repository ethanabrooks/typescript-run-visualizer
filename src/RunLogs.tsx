import React from "react";
import { useApolloClient } from "@apollo/client";
import { loader } from "graphql.macro";
import { Chart, Data } from "./Chart";

type Log = {
  log: object;
  runid: number;
  id: number;
};
const logToData = ({ log, runid: c }: Log): Data => ({
  runId: `run ${c}`,
  ...log
});

const queryOldLogs = loader("./queryOldLogs.graphql");
export const RunLogs = ({
  newLog,
  sweepId
}: {
  newLog: Log;
  sweepId: number;
}) => {
  const [data, setData] = React.useState<null | Data[]>(null);
  const client = useApolloClient();

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
    [setData]
  );

  return data == null ? (
    <span>{"Waiting for data..."}</span>
  ) : (
    <Chart data={data} newData={logToData(newLog)} />
  );
};