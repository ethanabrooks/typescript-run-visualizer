import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { GetSweepData } from "./GetSweepData";
import { GetSweeps } from "./GetSweeps";

export const RoutePath: React.FC = () => (
  <div className={"container"}>
    <Router>
      <Switch>
        <Route path="/:sweepId(\d+)">
          <nav className="breadcrumb" aria-label="breadcrumbs">
            <ul>
              <li>
                <a href="/">All sweeps</a>
              </li>
            </ul>
          </nav>
          <GetSweepData />
        </Route>
        <Route path="/">
          <GetSweeps />
        </Route>
      </Switch>
    </Router>
  </div>
);
