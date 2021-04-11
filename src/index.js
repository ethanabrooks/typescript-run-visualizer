import ReactDOM from "react-dom";
import React from "react";
import { Route, Router } from "react-router-dom";
import { createBrowserHistory } from "history";

import App from "./App";

const mainRoutes = (
  <Router history={createBrowserHistory()}>
    <Route path="/" render={_ => <App />} />
  </Router>
);

ReactDOM.render(mainRoutes, document.getElementById("root"));
