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
import React, { useState, useEffect, useRef } from "react";
import { Vega, VegaLite, View, VisualizationSpec } from "react-vega";
import * as vega from "vega";

const spec = {
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  description: "Streaming Data",
  height: 200,
  width: 600,
  data: { name: "data" },
  layer: [
    {
      encoding: {
        x: {
          field: "x",
          type: "quantitative",
          axis: {
            title: "x axis"
          }
        },
        y: {
          field: "value",
          type: "quantitative",
          axis: {
            title: "values"
          }
        }
      },
      layer: [
        {
          mark: {
            type: "area",
            line: {
              color: "darkslategray"
            },
            color: {
              x1: 1,
              y1: 1,
              x2: 1,
              y2: 0,
              gradient: "linear",
              stops: [
                {
                  offset: 0,
                  color: "white"
                },
                {
                  offset: 1,
                  color: "darkslategray"
                }
              ]
            }
          }
        },
        {
          // @ts-ignore
          selection: {
            label: {
              type: "single",
              nearest: true,
              on: "mouseover",
              encodings: ["x"],
              empty: "none"
            }
          },
          mark: { type: "rule", color: "gray" },
          encoding: {
            tooltip: [{ field: "value", title: "value ", type: "ordinal" }],
            opacity: {
              condition: { selection: "label", value: 1 },
              value: 0
            }
          }
        }
      ]
    }
  ]
};

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
      function updateGraph() {
        const data = sineDataSupplier(ref.current.x);
        ref.current.x++;
        ref.current.z++;

        const cs = vega.changeset().insert(data);
        // .remove((t: { x: number; value: number }) => {
        //   return t.x < ref.current.z;
        // });

        if (view !== undefined) view.change("data", cs).run();
      }

      updateGraph();
      const interval = setInterval(updateGraph, 110);
      return () => clearInterval(interval);
    },
    [view]
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
  logs &&
    logs.forEach(log => {
      console.log(log.id);
    });
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
