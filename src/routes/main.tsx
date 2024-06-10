import { createHashRouter } from "react-router-dom";
import Home from "../pages/Home";
import Redeem from "../pages/Redeem";
import NotFoundPage from "../pages/NotFoundPage";

export const router = createHashRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <NotFoundPage />,
  },
  {
    path: "/redeem",
    element: <Redeem />,
  },
]);
