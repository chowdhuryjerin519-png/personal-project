import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home/Home";
import ErrorPage from "../pages/ErrorPage";
import Login from "../pages/Login/Login";
import SignUp from "../pages/SignUp/SignUp";
import PrivateRoute from "./PrivateRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import Profile from "../pages/Dashboard/Common/Profile";
import MainLayout from "../layouts/MainLayout";
import MyInventory from "../pages/Dashboard/Seller/MyInventory";
import MyOrders from "../pages/Dashboard/Customer/MyOrders";
import AddProduct from "../pages/Dashboard/Seller/AddProduct";
import ProductDetails from "../pages/ProductDetails/ProductDetails";
import CheckOut from "../components/CheckOut/CheckOut";
import AllOrders from "../pages/Dashboard/Seller/AllOrders";
import ManageCategories from "../pages/Dashboard/ManageCategories/ManageCategories";
import CategoryProducts from "../pages/Dashboard/CategoryProducts/CategoryProducts";
import ManageBanners from "../pages/Dashboard/ManageBanners/ManageBanners";
import UpdateProduct from "../pages/Dashboard/Admin/UpdateProduct/UpdateProduct";
import EditProduct from "../pages/Dashboard/Admin/UpdateProduct/EditProduct";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/product/:id",
        element: <ProductDetails />,
      },
      {
        path: "/checkout/:id",
        element: <CheckOut />,
      },
      {
        path: "/checkout",
        element: <CheckOut />,
      },
      {
        path: "/products/category/:mainCategory",
        element: <CategoryProducts />,
      },
      {
        path: "/products/category/:mainCategory/:category",
        element: <CategoryProducts />,
      },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <SignUp /> },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      {
        path: "add-product",
        element: (
          <PrivateRoute>
            <AddProduct />
          </PrivateRoute>
        ),
      },
      {
        path: "/dashboard/update-products",
        element: (
          <PrivateRoute>
            <UpdateProduct />
          </PrivateRoute>
        ),
      },
      {
        path: "/dashboard/update-product/:id",
        element: (
          <PrivateRoute>
            <EditProduct />
          </PrivateRoute>
        ),
      },
      {
        path: "manage-categories",
        element: (
          <PrivateRoute>
            <ManageCategories />
          </PrivateRoute>
        ),
      },
      {
        path: "manage-banners",
        element: (
          <PrivateRoute>
            <ManageBanners />
          </PrivateRoute>
        ),
      },
      {
        path: "my-inventory",
        element: (
          <PrivateRoute>
            <MyInventory />
          </PrivateRoute>
        ),
      },

      {
        path: "profile",
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        ),
      },
      {
        path: "my-orders",
        element: (
          <PrivateRoute>
            <MyOrders />
          </PrivateRoute>
        ),
      },
      {
        path: "all-orders",
        element: (
          <PrivateRoute>
            <AllOrders></AllOrders>
          </PrivateRoute>
        ),
      },
    ],
  },
]);
