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
import React, { useEffect, useRef, useState } from "react";
import { Vega } from "react-vega";
import * as vega from "vega";
import { spec } from "./Spec.tsx";

const sineDataSupplier = x => {
  const y = 100 / 2 + 40 * Math.sin(x / 2);
  return { x: x, value: Math.floor(y) };
};

const RunLogs = ({ newLog }) => {
  const [{ logs }, setState] = useState({
    error: false,
    logs: []
  });
  const [view, setView] = React.useState();
  const z = -20;
  const x = 0;

  const ref = useRef({
    x,
    z
  });

  useEffect(
    () => {
      // function updateGraph() {
      ref.current.x++;
      ref.current.z++;

      logs.forEach(log => {
        const data = { x: log.log.step, value: log.log["Episode return"] };
        const cs = vega.changeset().insert(data);
        // .remove((t: { x: number; value: number }) => {
        //   return t.x < ref.current.z;
        // });

        if (view !== undefined) view.change("data", cs).run();
        // }

        // updateGraph();
        // const interval = setInterval(updateGraph, 110);
        // return () => clearInterval(interval);
      });
    },
    [view, logs]
  );

  if (!newLog) {
    throw new Error("No new logs");
  }

  const client = useApolloClient();

  useEffect(() => {
    loadOlder();
  }, []);

  const loadOlder = async () => {
    const GET_OLD_LOGS = gql`
      query getOldLogs($oldestLogId: Int) {
        run_log(where: { id: { _lt: $oldestLogId } }, order_by: { id: asc }) {
          id
          log
          runid
        }
      }
    `;

    const { error, data } = await client.query({
      query: GET_OLD_LOGS,
      variables: { oldestLogId: newLog.id }
    });

    if (data.run_log.length) {
      setState(prevState => {
        return { ...prevState, logs: [...prevState.logs, ...data.run_log] };
      });
    }
    if (error) {
      console.error(error);
      setState(prevState => {
        return { ...prevState, error: true };
      });
    }
  };
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
