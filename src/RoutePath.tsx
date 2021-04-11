import React from "react";
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";
import MakeApolloClient from "./MakeApolloClient";
import { SubscribeToRunLogs } from "./SubscribeToRunLogs";
import { ApolloProvider } from "@apollo/client";

export const RoutePath: React.FC = () => (
  <Router>
    <Switch>
      <Route path="/:sweepId(\d+)">
        <SubscribeToRunLogs sweepId={6} />
      </Route>
      <Route path="/">
        <div>TODO</div>
      </Route>
    </Switch>
  </Router>
);
