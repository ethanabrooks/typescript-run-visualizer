import Header from "./Header";

import {
  ApolloClient,
  ApolloProvider,
  gql,
  InMemoryCache,
  useApolloClient,
  useSubscription
} from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { useAuth0 } from "./Auth/react-auth0-spa";
import React from "react";
import { PlainObject, Vega, View, VisualizationSpec } from "react-vega";
import * as vega from "vega";
import spec from "./Spec";
import { loader } from "graphql.macro";
const notifyNewLog = loader("./notifyNewLog.graphql");
const queryOldLogs = loader("./queryOldLogs.graphql");

type Log = {
  log: {
    step: number;
    "Episode return": number;
  };
  runid: number;
  id: number;
};
type Data = { x: number; y: number; c: number };

const logToData = ({
  log: { step: x, "Episode return": y },
  runid: c
}: Log): Data => ({
  x,
  y,
  c
});

const RunLogs = ({ newLog, sweepId }: { newLog: Log; sweepId: number }) => {
  const [data, setData] = React.useState(null);
  const [view, setView] = React.useState<null | View>(null);
  const x = React.useRef(0);
  const client = useApolloClient();

  React.useEffect(
    () => {
      setInterval(() => {
        if (view != null) {
          const data = {
            x: x.current,
            y: Math.random(),
            c: Math.round(Math.random() * 4)
          };
          console.log(x);
          x.current++;
          const cs = vega.changeset().insert(data);
          view.change("data", cs).run();
        }
      }, 500);
      // if (view != null && newLog != null) {
      //   const cs = vega.changeset().insert(logToData(newLog));
      //   view.change("data", cs).run();
      // }
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
            oldestLogId: newLog === null ? 0 : newLog.id
          }
        });
        let data = run_log
          .map(logToData)
          .reduce(
            (acc: Data[], data: Data) =>
              data.y == null ? acc : acc.concat(data),
            []
          );
        x.current = data.reduce(
          (acc: number, { x }: Data) => Math.max(acc, x),
          0
        );
        setData(data);
        if (error) {
          console.error(error);
        }
      })();
    },
    [view, setData]
  );

  if (data == null) {
    return <div>{"Loading..."}</div>;
  } else {
    console.log(data);
    return (
      <div>
        {
          <Vega
            spec={spec as VisualizationSpec}
            renderer={"svg"}
            data={{ data: data } as PlainObject}
            onNewView={setView}
          />
        }
      </div>
    );
  }
};

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
  let newLog = data.run_log.length ? data.run_log[0] : null;
  return <RunLogs newLog={newLog} sweepId={sweepId} />;
};

const createApolloClient = (authToken: any) => {
  return new ApolloClient({
    link: new WebSocketLink({
      uri: "ws://rldl12.eecs.umich.edu:8080/v1/graphql",
      options: {
        reconnect: true,
        connectionParams: {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      }
    }),
    cache: new InMemoryCache()
  });
};
const App = ({ idToken }: { idToken: string }) => {
  const { loading, logout } = useAuth0();
  if (loading) {
    return <div>Loading...</div>;
  }
  const client = createApolloClient(idToken);
  return (
    <ApolloProvider client={client}>
      <div>
        <Header logoutHandler={logout} />
        <RunLogSubscription sweepId={6} />
      </div>
    </ApolloProvider>
  );
};

export default App;
