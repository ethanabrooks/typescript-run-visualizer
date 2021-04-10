import React from "react";

import Header from "./Header";
// import TodoPrivateWrapper from "./Todo/TodoPrivateWrapper";
import SweepWrapper from "./Todo/SweepWrapper";
// import OnlineUsersWrapper from "./OnlineUsers/OnlineUsersWrapper";

import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { useAuth0 } from "./Auth/react-auth0-spa";

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
// eslint-disable-next-line react/prop-types
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
        <div className="row container-fluid p-left-right-0 m-left-right-0">
          <div className="row col-md-9 p-left-right-0 m-left-right-0">
            {/*<div className="col-md-6 sliderMenu p-30">*/}
            {/*  <TodoPrivateWrapper />*/}
            {/*</div>*/}
            <div className="col-md-6 sliderMenu p-30 bg-gray border-right">
              <SweepWrapper />
            </div>
          </div>
          <div className="col-md-3 p-left-right-0">
            {/*<div className="col-md-12 sliderMenu p-30 bg-gray">*/}
            {/*  <OnlineUsersWrapper />*/}
            {/*</div>*/}
          </div>
        </div>
      </div>
    </ApolloProvider>
  );
};

export default App;
