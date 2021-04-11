import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  useApolloClient,
  useSubscription
} from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import React from "react";
import { PlainObject, Vega, View, VisualizationSpec } from "react-vega";
import spec from "./Spec";
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

const queryOldLogs = loader("./queryOldLogs.graphql");
const RunLogs = ({ newLog, sweepId }: { newLog: Log; sweepId: number }) => {
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

const notifyNewLog = loader("./notifyNewLog.graphql");
const RunLogSubscription = ({ sweepId }: { sweepId: number }) => {
  const { loading, error, data } = useSubscription(notifyNewLog, {
    variables: { sweepId: sweepId }
  });
  if (loading) {
    return <span>Loading...</span>;
  }
  if (error) {
    console.log(error);
    return <span>Error</span>;
  }
  return (
    <RunLogs
      newLog={data.run_log.length ? data.run_log[0] : null}
      sweepId={sweepId}
    />
  );
};

const App = () => {
  const uri = process.env.REACT_APP_HASURA_URI;
  if (uri == null) {
    return <span>Environment variable `REACT_APP_HASURA_URI` is unset.</span>;
  }
  let client = new ApolloClient({
    link: new WebSocketLink({
      uri: uri,
      options: {
        reconnect: true,
        connectionParams: {
          headers: {}
        }
      }
    }),
    cache: new InMemoryCache()
  });
  return (
    <ApolloProvider client={client}>
      <RunLogSubscription sweepId={6} />
    </ApolloProvider>
  );
};

export default App;
