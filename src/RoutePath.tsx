import React from "react";
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";
import { SubscribeToRunLog } from "./SubscribeToRunLog";
import { SubscribeToSweep } from "./SubscribeToSweep";

export const RoutePath: React.FC = () => (
  <Router>
    <Switch>
      <Route path="/:sweepId(\d+)">
        <SubscribeToRunLog sweepId={6} />
      </Route>
      <Route path="/">
        <SubscribeToSweep />
      </Route>
    </Switch>
  </Router>
);
