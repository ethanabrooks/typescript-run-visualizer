import React from "react";
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";
import { GetRunLogs } from "./GetRunLogs";
import { GetSweeps } from "./GetSweeps";

export const RoutePath: React.FC = () => (
  <Router>
    <Switch>
      <Route path="/:sweepId(\d+)">
        <GetRunLogs />
      </Route>
      <Route path="/">
        <GetSweeps />
      </Route>
    </Switch>
  </Router>
);
