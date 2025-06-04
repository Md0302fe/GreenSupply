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
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    // Set initial state correctly based on current screen width
    if (typeof window !== "undefined") {
      return window.innerWidth > 768;
    }
    return true;
  });

  const [windowWidth, setWindowWidth] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth;
    }
    return 1024;
  });

  // Lắng nghe thay đổi kích thước để cập nhật windowWidth
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsSidebarOpen(width > 768); // Cập nhật trạng thái sidebar mỗi lần resize
    };

    // Gọi lần đầu khi component mount
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

const toggleSidebar = () => {
  setIsSidebarOpen((prev) => !prev);
};

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
            if (windowWidth < 1024) setIsSidebarOpen(false);
          }}
          windowWidth={windowWidth}
        />
      </div>
      {isSidebarOpen && windowWidth < 1024 && (
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

        <div className="contentMain flex relative overflow-hidden pt-16">
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
