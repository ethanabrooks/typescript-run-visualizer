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
  // logs is null until populated on first call

  const [view, setView] = React.useState();
  const client = useApolloClient();

  // This is supposed to run only once (it loads all the old values
  // into the graph), but when I take out view or logs from the dependencies
  // it stops rendering correctly. I read the vega docs, but didn't get a very
  // clear sense of how functions like changeset(), change() and run() actually work
  useEffect(
    () => {
      if (logs !== null) {
        logs.forEach(({ log }) => {
          const data = { x: log.step, value: log["Episode return"] };
          const cs = vega.changeset().insert(data); // add new data
          if (view !== undefined) view.change("data", cs).run();
          // here are the docs on change(): https://vega.github.io/vega/docs/api/view/#view_change
          // here are the docs on run(): https://vega.github.io/vega/docs/api/view/#dataflow-and-rendering
        });
      }
    },
    [view, logs]
  );

  // This adds new data, whenever the subscription passes it to the component.
  // It would be nice if this were more neatly integrated with the previous hook
  useEffect(
    () => {
      const data = { x: newLog.log.step, value: newLog.log["Episode return"] };
      const cs = vega.changeset().insert(data);
      if (view !== undefined) view.change("data", cs).run();
    },
    [newLog]
  );

  // This actually issues the graphQL query for old logs. I tried integrating
  // The first useEffect into this one but it did not work, presumably because they
  // have different deps.
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
