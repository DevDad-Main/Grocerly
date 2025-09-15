import React, { useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";
import { useAppContext } from "./context/AppContext";
import Login from "./components/Login";
import AllProducts from "./pages/AllProducts";
import ProductCategory from "./pages/ProductCategory";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import AddAddress from "./pages/AddAddress";
import MyOrders from "./pages/MyOrders";
import AdminLogin from "./components/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AddProduct from "./pages/admin/AddProduct";
import ProductList from "./pages/admin/ProductList";
import Orders from "./pages/admin/Orders";
import NotFound from "./pages/NotFound";
import DeliverySlotTable from "./components/DeliverySlotTable";
import Loading from "./components/Loading";
import OrderDetails from "./pages/OrderDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import UpdateProduct from "./pages/admin/UpdateProduct";
import AdminDashboard from "./components/admin/AdminDashboard";
const App = () => {
  const isSellerPath = useLocation().pathname.includes("admin");

  const { showUserLogin, isAdmin, user } = useAppContext();

  useEffect(() => {}, [isAdmin]);
  return (
    <div className="text-default min-h-screen text-gray-700 bg-white">
      {isSellerPath ? null : <Navbar />}
      {showUserLogin ? <Login /> : null}

      <Toaster />
      <div
        className={`${isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}`}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<AllProducts />} />
          <Route path="/products/:category" element={<ProductCategory />} />
          <Route path="/products/:category/:id" element={<ProductDetails />} />
          <Route
            path="/cart"
            element={
              <Cart />
              // <ProtectedRoute user={user}>
              // </ProtectedRoute>
            }
          />
          <Route path="/add-address" element={<AddAddress />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/order/:orderId" element={<OrderDetails />} />
          <Route path="/delivery-slot" element={<DeliverySlotTable />} />
          <Route path="/loading" element={<Loading />} />
          <Route
            path="/admin"
            element={isAdmin ? <AdminLayout /> : <AdminLogin />}
          >
            <Route index element={isAdmin ? <AdminDashboard /> : null} />
            <Route
              path="/admin/product-list"
              element={isAdmin ? <ProductList /> : null}
            />

            <Route
              index
              path="/admin/add-product"
              element={isAdmin ? <AddProduct /> : null}
            />
            <Route
              path="/admin/product/:id"
              element={isAdmin ? <UpdateProduct /> : null}
            />
            <Route path="/admin/orders" element={isAdmin ? <Orders /> : null} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {!isSellerPath && <Footer />}
    </div>
  );
};

export default App;
