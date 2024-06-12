import { Outlet } from "react-router-dom";

import Header from "./components/Header/Header";
import "./App.css";
import "./styles/tailwind.css";

function App() {
  return (
    <div className="page-wrapper">
      <div id="header">
        <Header />
      </div>
      <div id="main">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
