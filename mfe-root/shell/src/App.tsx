import React from "react";
import {
  BrowserRouter,
} from "react-router-dom";
import { ShellRoutes } from "./components/Routes";

const App: React.FC = () => (
  <BrowserRouter>
    <ShellRoutes />
  </BrowserRouter>
);

export default App;
