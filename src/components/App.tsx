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

type Log = {
  log: {
    step: number;
    "Episode return": number;
  };
  runid: number;
  id: number;
};

const RunLogs = ({ newLog, sweepId }: { newLog: Log; sweepId: number }) => {
  const [data, setData] = React.useState(null);
  const [view, setView] = React.useState<null | View>(null);
  const client = useApolloClient();

  type Data = { x: number; y: number; c: number };

  const logToData = ({
    log: { step: x, "Episode return": y },
    runid: c
  }: Log): Data => ({
    x,
    y,
    c
  });

  const addData = (newData: null | Data) => {
    if (newData === null) {
      return;
    }
    const cs = vega.changeset().insert(newData);
    // @ts-ignore
    view.change("data", cs).run();
  };

  // This adds new data, whenever the subscription passes it to the component.
  // It would be nice if this were more neatly integrated with the previous hook
  React.useEffect(
    () => {
      // if (view !== null) addData(newLog === null ? null : logToData(newLog));
    },
    [newLog, view]
  );

  // This actually issues the graphQL query for old logs. I tried integrating
  // The first useEffect into this one but it did not work, presumably because they
  // have different deps.
  React.useEffect(
    () => {
      (async () => {
        let OLD_LOG_QUERY = {
          query: gql`
            query getOldLogs($sweepId: Int, $oldestLogId: Int) {
              run_log(
                where: {
                  run: { sweepid: { _eq: $sweepId } }
                  id: { _lt: $oldestLogId }
                }
                order_by: { id: asc }
              ) {
                id
                log
                runid
              }
            }
          `,
          variables: {
            sweepId: sweepId,
            oldestLogId: newLog === null ? 0 : newLog.id
          }
        };
        const {
          error,
          data: { run_log }
        } = await client.query(OLD_LOG_QUERY);
        setData(
          run_log
            .map(logToData)
            .reduce(
              (acc: Data[], data: Data) =>
                data.y == null ? acc : acc.concat(data),
              []
            )
        );
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
            data={{ values: data } as PlainObject}
            onNewView={setView}
          />
        }
      </div>
    );
  }
};

// Run a subscription to get the latest run_log
const NOTIFY_NEW_RUN_LOG = gql`
  subscription notifyNewRunLog($sweepId: Int!) {
    run_log(
      where: { run: { sweepid: { _eq: $sweepId } } }
      limit: 1
      order_by: { id: desc }
    ) {
      id
      log
      runid
    }
  }
`;

const RunLogSubscription = ({ sweepId }: { sweepId: number }) => {
  const { loading, error, data } = useSubscription(NOTIFY_NEW_RUN_LOG, {
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
        <RunLogSubscription sweepId={4} />
      </div>
    </ApolloProvider>
  );
};

export default App;
