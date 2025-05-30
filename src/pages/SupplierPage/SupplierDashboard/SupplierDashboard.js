import React, { useState } from "react";
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HeaderSupplier from "../Header/HeaderSupplier";
import SideBar from "../SideBar/SideBar";
import "../../../styles/css/HeaderSupplier.css";
import HarvestRequestPage from "../ContentWrapper/HarvestRequestPage";
import HarvestRequestManagement from "../ContentWrapper/HarvestRequestManagement";
import HistoryHarvestRequestOrder from "../ContentWrapper/HistoryHarvestRequestOrder";
import HistoryProvideOrder from "../ContentWrapper/HistoryProvideOrder";
import ProvideRequestPage from "../ContentWrapper/ProvideRequestPage";
import ProvideRequestManagement from "../ContentWrapper/ProvideRequestManagement";
import { ToastContainer } from "react-toastify";

const SupplierDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // Tự động ẩn/hiện sidebar khi thay đổi kích thước cửa sổ
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Chạy ngay khi component mount
    handleResize();

    // Lắng nghe resize
    window.addEventListener("resize", handleResize);

    // Dọn dẹp khi unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className="main relative font-nunito">
      <ToastContainer />
      <div
        className={`
    fixed top-0 left-0 z-40 h-screen bg-white
    transition-transform duration-500 ease-in-out
 ${windowWidth < 768
            ? "w-[100w]"
            : windowWidth < 1024
              ? "w-[30vw]"
              : "w-[18vw]"
          }    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
  `}
      >
        <SideBar
          onItemClick={() => {
            if (windowWidth <= 768) setIsSidebarOpen(false);
          }}
          windowWidth={windowWidth}
        />
      </div>
      {isSidebarOpen && windowWidth <= 768 && (
        <div
          className="fixed inset-0 bg-black opacity-10 z-30"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      <div
        className={`
    transition-all duration-500 ease-in-out
    ${isSidebarOpen && windowWidth > 768 ? "ml-[18%]" : "ml-0"}
  `}
      >
        <HeaderSupplier
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          windowWidth={windowWidth}
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
              <Route path="history-request-order" element={<HistoryHarvestRequestOrder />} />
              <Route path="history-provide-order" element={<HistoryProvideOrder />} />
              <Route path="provide-request/:id?" element={<ProvideRequestPage />} />
              <Route path="provide-request-management" element={<ProvideRequestManagement />} />
            </Routes>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupplierDashboard;
