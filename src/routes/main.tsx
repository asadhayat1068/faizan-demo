import { createHashRouter } from "react-router-dom";
import Home from "../pages/Home";
import Redeem from "../pages/Redeem";
import NotFoundPage from "../pages/NotFoundPage";
import About from "../pages/About";
import Contact from "../pages/Contact";
import App from "../App";

export const hashRouter = createHashRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/redeem",
        element: <Redeem />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
    ],
  },
]);
