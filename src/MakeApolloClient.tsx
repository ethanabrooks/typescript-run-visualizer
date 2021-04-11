import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import React, { FC } from "react";
import { SubscribeToRunLogs } from "./SubscribeToRunLogs";
import { useParams } from "react-router-dom";

const MakeApolloClient: FC = () => {
  const { sweepId } = useParams<{ sweepId: string }>();

  const uri = process.env.REACT_APP_HASURA_URI;
  if (uri == null) {
    return <span>Environment variable `REACT_APP_HASURA_URI` is unset.</span>;
  }
  const client = new ApolloClient({
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
      <SubscribeToRunLogs sweepId={+sweepId} />
    </ApolloProvider>
  );
};

export default MakeApolloClient;