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
import { Vega, VisualizationSpec } from "react-vega";
import * as vega from "vega";
import { spec } from "./Spec";

const RunLogs = ({ newLog, sweepId }: { newLog: any; sweepId: number }) => {
  const [view, setView] = React.useState();
  const client = useApolloClient();

  type Log = {
    step: number;
    "Episode return": number;
  };

  const addData = (newLog: null | Log) => {
    if (newLog === null) {
      return;
    }
    const { step: x, "Episode return": value } = newLog;
    const cs = vega.changeset().insert({ x, value });
    // @ts-ignore
    if (view !== undefined) view.change("data", cs).run();
  };

  // This adds new data, whenever the subscription passes it to the component.
  // It would be nice if this were more neatly integrated with the previous hook
  React.useEffect(() => addData(newLog), [newLog]);

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
        run_log.forEach(({ log }: { log: Log }) => addData(log));
        if (error) {
          console.error(error);
        }
      })();
    },
    [view]
  );

  let plot = (
    <Vega
      spec={spec as VisualizationSpec}
      actions={false}
      renderer={"svg"}
      // @ts-ignore
      onNewView={view => setView(view)}
    />
  );
  return (
    <>
      <h3>React Vega Streaming Data</h3>
      <div>{plot}</div>
    </>
  );
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
