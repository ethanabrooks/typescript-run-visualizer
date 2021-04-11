import ReactDOM from "react-dom";
import React from "react";
import { RoutePath } from "./RoutePath";
import MakeApolloClient from "./MakeApolloClient";
import { Route } from "react-router-dom";

ReactDOM.render(<MakeApolloClient />, document.getElementById("root"));
