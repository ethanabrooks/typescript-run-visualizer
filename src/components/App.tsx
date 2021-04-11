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
import React, { useEffect, useState } from "react";
import { Vega } from "react-vega";
import * as vega from "vega";
import { spec } from "./Spec.tsx";

const RunLogs = ({ newLog }) => {
  const [{ logs }, setState] = useState({
    error: false,
    logs: null
  });
  const [view, setView] = React.useState();
  const client = useApolloClient();

  useEffect(
    () => {
      if (logs !== null) {
        logs.forEach(log => {
          const data = { x: log.log.step, value: log.log["Episode return"] };
          const cs = vega.changeset().insert(data);
          if (view !== undefined) view.change("data", cs).run();
        });
      }
    },
    [view, logs]
  );

  useEffect(() => {
    (async () => {
      const GET_OLD_LOGS = gql`
        query getOldLogs($oldestLogId: Int) {
          run_log(where: { id: { _lt: $oldestLogId } }, order_by: { id: asc }) {
            id
            log
            runid
          }
        }
      `;

      const {
        error,
        data: { run_log }
      } = await client.query({
        query: GET_OLD_LOGS,
        variables: { oldestLogId: newLog.id }
      });

      if (run_log.length) {
        setState(prevState => {
          return { ...prevState, logs: run_log };
        });
      }
      if (error) {
        console.error(error);
        setState(prevState => {
          return { ...prevState, error: true };
        });
      }
    })();
  }, []);

  return (
    <>
      <h3>React Vega Streaming Data</h3>
      <div>
        <Vega
          spec={spec}
          actions={false}
          renderer={"svg"}
          onNewView={view => setView(view)}
        />
      </div>
    </>
  );
};

// Run a subscription to get the latest public todo
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

const RunLogSubscription = ({ sweepId }) => {
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
  return <RunLogs newLog={data.run_log.length ? data.run_log[0] : null} />;
};

const createApolloClient = authToken => {
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
const App = ({ idToken }) => {
  const { loading, logout } = useAuth0();
  if (loading) {
    return <div>Loading...</div>;
  }
  const client = createApolloClient(idToken);
  return (
    <ApolloProvider client={client}>
      <div>
        <Header logoutHandler={logout} />
        <RunLogSubscription sweepId={1} />
      </div>
    </ApolloProvider>
  );
};

export default App;
