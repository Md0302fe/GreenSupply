import React from "react";
import { Routes, Route } from "react-router-dom";

import App from "../App";

import HomePage from "../pages/HomePage/HomePage";
import LandingPage from "../pages/LandingPage/LandingPage";
import ManageUser from "../components/Admin/Content/User/AdminUser";
import ManageBlockedUser from "../components/Admin/Content/User/BlockedUser";

import Dashboard from "../components/Admin/Content/Dashboard/Dashboard";

// Toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Admin from "../components/Admin/Admin";
import PaymentPage from "../pages/PaymentPage/PaymentPage";
import IntroductionPage from "../pages/IntroductionPage/IntroductionPage";
import ContactPage from "../pages/ContactPage/ContactPage";
import ProfilePage from "../pages/Profile.js/ProfilePage";
import ProductPage from "../pages/ProductPage/ProductPage";
import ProductDetailPage from "../pages/ProductPage/ProductDetailPage";
import AddressPage from "../pages/AddressPage/AddressPage";
import AddressCreate from "../pages/AddressPage/AddressCreate";
import AddressUpdate from "../pages/AddressPage/AddressUpdate";
import SupplierDashboard from "../pages/SupplierPage/SupplierDashboard/SupplierDashboard";

// Import các component OrderManagement và OrderDetails
import FuelRequestsManagement from "../components/Admin/Content/Order/FuelRequests";
import FuelProvideManagement from "../components/Admin/Content/Order/FuelProvideOrders";

import Login from "../components/AuthComponent/Login";
import Register from "../components/AuthComponent/Register";
import GoogleRegister from "../components/AuthComponent/GoogleRegister";
import FuelRequestsComponent from "../components/Admin/Content/Order/FuelRequests";
import OrderPage from "../components/Admin/Content/Order/FuelOrderStatus";

const Router = () => {
  return (
    <>
      <Routes>
        {/* Sử dụng nested route bao bọc các outlet cần hiển thị : LayoutHeader*/}
        <Route path="/" element={<LandingPage />}></Route>
        <Route path="/home" element={<App />}>
          {/* Sử dụng index route chỉ dẫn trang mặc định cần hiển thị*/}
          <Route index element={<HomePage />} />
          {/* New route for ContactPage */}
          <Route path="contact" element={<ContactPage />} />
          <Route path="introduction" element={<IntroductionPage />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/google-register" element={<GoogleRegister />} />
        {/* payment routes */}
        <Route path="/payment" element={<PaymentPage />} />

        {/* admin-page  : LayoutAdmin*/}
        <Route path="/system/admin" element={<Admin />}>
          <Route index element={<Dashboard />} />
          <Route path="manage-users" element={<ManageUser />} />
          <Route path="manage-blocked-users" element={<ManageBlockedUser />} />
          
        </Route>

        <Route path="/system/admin" element={<Admin />}>
          <Route path="manage-fuel-orders" element={<FuelRequestsManagement />} />
          <Route path="manage-provide-orders" element={<FuelProvideManagement />} />
          <Route path="View-Order-Success" element={<OrderPage />} />
          
        </Route>
        {/* Routes cho quản lý đơn hàng */}
      

        {/* Profile routes */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* Product routes */}
        <Route path="/product" element={<ProductPage />} />
        <Route path="/product-detail/:id" element={<ProductDetailPage />} />

        {/* Address routes */}
        <Route path="/Address" element={<AddressPage />} />
        <Route path="/Address-Create" element={<AddressCreate />} />
        <Route path="/Address-Update/:id" element={<AddressUpdate />} />

        {/* Supplier Page*/}
        <Route path="/supplier/*" element={<SupplierDashboard />} />

        
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

export default Router;