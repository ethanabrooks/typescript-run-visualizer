import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { GetSweepData } from "./GetSweepData";
import { GetSweeps } from "./GetSweeps";

export const RoutePath: React.FC = () => (
  <Router>
    <Switch>
      <Route path="/:sweepId(\d+)">
        <GetSweepData />
      </Route>
      <Route path="/">
        <GetSweeps />
      </Route>
    </Switch>
  </Router>
);
