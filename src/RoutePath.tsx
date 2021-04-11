import React from "react";
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";
import MakeApolloClient from "./MakeApolloClient";
import { SubscribeToRunLogs } from "./SubscribeToRunLogs";
import { ApolloProvider } from "@apollo/client";

export const RoutePath: React.FC = () => (
  <Router>
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
        </ul>
      </nav>

      <Switch>
        <Route path="/:sweepId(\d+)">
          <SubscribeToRunLogs sweepId={6} />
        </Route>
        <Route path="/">
          <div>TODO</div>
        </Route>
      </Switch>
    </div>
  </Router>
);
