import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HeaderSupplier from "../Header/HeaderSupplier";
import SideBar from "../SideBar/SideBar";
import "../../../styles/css/HeaderSupplier.css";
import HarvestRequestPage from "../ContentWrapper/HarvestRequestPage";
import HarvestRequestManagement from "../ContentWrapper/HarvestRequestManagement";
import HistoryRequestOrder from "../ContentWrapper/HistoryRequestOrder";
import HistoryProvideOrder from "../ContentWrapper/HistoryProvideOrder";
import SupplyRequestPage from "../ContentWrapper/SupplyRequestPage";
import SupplyRequestHistory from "../ContentWrapper/SupplyRequestHistory";
import { ToastContainer } from "react-toastify";

const SupplierDashboard = () => {
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
                element={<Navigate to="/supplier/harvest-request" />}
              />
              <Route path="harvest-request" element={<HarvestRequestPage />} />
              <Route path="harvest-request-management" element={<HarvestRequestManagement />} />
              <Route path="history-request-order" element={<HistoryRequestOrder />} />
              <Route path="history-provide-order" element={<HistoryProvideOrder />} />
              <Route path="supply-request" element={<SupplyRequestPage />} />
              <Route path="supply-request-history" element={<SupplyRequestHistory />} />
            </Routes>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupplierDashboard;
