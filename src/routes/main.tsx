import { createHashRouter } from "react-router-dom";
import Home from "../pages/Home";
import Redeem from "../pages/Redeem";
import NotFoundPage from "../pages/NotFoundPage";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Items from "../pages/Items";
import ItemDetail from "../pages/ItemDetail";
import SearchResults from "../pages/SearchResults";
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
      {
        path: "/items/:categoryId",
        element: <Items />,
      },
      {
        path: "/detail/:productId",
        element: <ItemDetail />,
      },
      {
        path: "/search",
        element: <SearchResults />,
      },
    ],
  },
]);
