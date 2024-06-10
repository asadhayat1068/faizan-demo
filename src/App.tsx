import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/main";

function App() {
  return (
    <div>
      <div id="header">
        <h1>Header</h1>
      </div>
      <div id="main">
        <RouterProvider router={router} />
      </div>
    </div>
  );
}

export default App;
