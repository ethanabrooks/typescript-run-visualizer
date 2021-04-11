import ReactDOM from "react-dom";
import React from "react";
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";

import App from "./App";

const router = (
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
        <Route path="/">
          <App />
        </Route>
      </Switch>
    </div>
  </Router>
);

ReactDOM.render(router, document.getElementById("root"));
