import Header from "./Header";

import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  useSubscription,
  useApolloClient,
  gql
} from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { useAuth0 } from "./Auth/react-auth0-spa";
import React, { useState, useEffect } from "react";

const RunLogs = ({ newLogs }) => {
  const [{ logs }, setState] = useState({
    error: false,
    logs: []
  });

  if (!newLogs) {
    throw new Error("No new logs");
  }
  const oldestLogId = newLogs
    .map(({ id }) => id)
    .reduce((acc, x) => Math.min(acc, x));

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
      variables: { oldestLogId: oldestLogId }
    });

    if (data.run_log.length) {
      setState(prevState => {
        return { ...prevState, logs: [...prevState.logs, ...data.run_log] };
      });
      oldestLogId = data.run_log[data.run_log.length - 1].id;
    }
    if (error) {
      console.error(error);
      setState(prevState => {
        return { ...prevState, error: true };
      });
    }
  };
  logs &&
    logs.forEach(log => {
      console.log(log.id);
    });
  return <div className="todoListWrapper" />;
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
  return <RunLogs newLogs={data.run_log.length ? data.run_log[0] : null} />;
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
