import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HeaderSupplier from "../Header/HeaderSupplier";
import SideBar from "../SideBar/SideBar";
import "../../../styles/css/HeaderSupplier.css";


import OrderProductionPage from "../ContentWrapper/OrderProductionPage";
import OrderPurchaseList from "../ContentWrapper/OrderPurchaseList";
import { ToastContainer } from "react-toastify";


const CustomerDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <section className="main relative font-nunito">
      <ToastContainer />
      <div
        className={`
          fixed top-0 left-0 z-50
          h-screen
          w-[18%]
          bg-white
          transition-transform duration-500 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <SideBar />
      </div>

      <div
        className={`
          transition-all duration-500 ease-in-out
          ${isSidebarOpen ? "ml-[18%]" : "ml-0"}
        `}
      >
        <HeaderSupplier
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />

        <div className="contentMain flex relative overflow-hidden">
          {/* Content Wrapper*/}
          <div className="contentRight py-4 px-8 w-full">
            <Routes>
              <Route
                index
                element={<Navigate to="/customer/orders-production" />}
              />
            
              <Route path="orders-production/:id?" element={<OrderProductionPage />} />
              <Route path="orders-management" element={<OrderPurchaseList />} />
              
            </Routes>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerDashboard;
