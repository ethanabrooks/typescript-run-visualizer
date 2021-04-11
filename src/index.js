import ReactDOM from "react-dom";
import React from "react";
import { Link, Route, Router } from "react-router-dom";

import App from "./App";
import { Switch } from "react-bootstrap";
import { createBrowserHistory } from "history";

const router = (
  <Router history={createBrowserHistory()}>
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
        </ul>
      </nav>

      <Switch>
        <Route path="/">
          <App />
        </Route>
      </Switch>
    </div>
  </Router>
);

ReactDOM.render(router, document.getElementById("root"));
