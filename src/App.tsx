import { RouterProvider } from "react-router-dom";
import { router } from "./routes/main";
import Header from "./components/Header/Header";

function App() {
  return (
    <div className="container">
      <div id="header">
        <Header />
      </div>
      <div id="main">
        <RouterProvider router={router} />
      </div>
    </div>
  );
}

export default App;
