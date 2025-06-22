import React, { useState } from "react";
import { AiOutlineHome } from "react-icons/ai";
import { Outlet, useNavigate } from "react-router-dom";

// icons libraries
import { CgBell } from "react-icons/cg";
import {
  FaGear,
  FaUserGear,
  FaClipboard,
  FaLemon,
  FaFileInvoice,
  FaCubes,
} from "react-icons/fa6";
import { FaHockeyPuck, FaShoppingCart } from "react-icons/fa";
import { SlArrowLeft, SlArrowRight } from "react-icons/sl";
import { MdDashboardCustomize } from "react-icons/md";

import LanguageSwitcher from "../TranslateComponent/LanguageSwitcher";
import Sidebar from "./Sidebar";

import "./Admin.scss";
import "react-pro-sidebar/dist/css/styles.css";

import { useEffect } from "react";

const Admin = (props) => {
  const [collapsed, setCollapsed] = useState(true);
  const navigate = useNavigate();
  const [toggleIcons, setToggleIcons] = useState("dashboard");

  const navigationsData = [
    {
      icon: <MdDashboardCustomize className="text-2xl" />,
      label: "dashboard",
      text: "Dashboard",
      href: "/system/admin",
    },
    {
      icon: <FaUserGear className="text-2xl" />,
      label: "users",
      text: "Người dùng",
      href: "feature_users",
    },
    {
      icon: <FaClipboard className="text-2xl" />,
      label: "purchased_orders",
      text: "Đơn thu nguyên liệu",
      href: "/system/admin/feature_purchase_orders",
    },
    {
      icon: <FaShoppingCart className="text-2xl" />,
      label: "management_orders",
      text: "Q.lý đơn hàng",
      href: "feature_request_suppplier",
    },
    {
      icon: <FaHockeyPuck className="text-2xl" />,
      label: "management_warehouse",
      text: "Q.lý kho",
      href: "feature_warehouse",
    },
    {
      icon: <FaLemon className="text-2xl" />,
      label: "management_materials",
      text: "Q.lý nguyên liệu",
      href: "feature_material_category",
    },
    {
      icon: <FaGear className="text-2xl" />,
      label: "management_processing",
      text: "Q.lý sản xuất",
      href: "feature_production_process",
    },
    {
      icon: <FaFileInvoice className="text-2xl" />,
      label: "manaement_product_orders",
      text: "Q.lý đơn đặt hàng",
      href: "feature_product_orders",
    },
    {
      icon: <FaCubes className="text-2xl" />,
      label: "finished_product",
      text: "Quản lý thành phẩm",
      href: "feature_finished_product",
    },
    {
      icon: <CgBell className="text-2xl" />,
      label: "notifications",
      text: "Thông báo",
    },
  ];

  const handleToggle = (label, href) => {
    setToggleIcons(label);
    if (href) {
      navigate(href);
    }
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setCollapsed(true); // reset về trạng thái mặc định khi không mobile
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderNavigations = () => {
    return navigationsData.map(({ icon, label, href, text }, index) => (
      <div
        key={index}
        className={`relative group flex flex-col justify-center items-center gap-4 cursor-pointer rounded-[50%] p-2 transition-all duration-200 ${
          toggleIcons === label
            ? "bg-gray-100 text-blue-500"
            : "bg-black hover:bg-gray-100"
        }`}
        onClick={() => handleToggle(label, href)}
      >
        <button className="flex justify-center items-center">{icon}</button>
        <span className="absolute bottom-[-30px] left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-all duration-200 bg-gray-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap z-10">
          {text}
        </span>
      </div>
    ));
  };

  return (
    <div className="admin-container min-h-screen overflow-y-auto">
      {/* Admin-Sidebar */}
      <div
        className={`admin-sidebar min-h-screen ${
          !collapsed && isMobile ? "mobile-visible" : ""
        }`}
      >
        <Sidebar
          collapsed={collapsed}
          toggled={!collapsed && isMobile}
          handleToggleSidebar={() => setCollapsed(!collapsed)}
          extraHeader={{
            type: "utility",
            content: isMobile ? (
              <div className="flex items-center gap-3">
                {/* Language Switcher: chỉ icon */}
                <LanguageSwitcher onlyIcon />

                {/* Home Icon */}
                <div
                  className="cursor-pointer hover:text-blue-500"
                  onClick={() => navigate("/home")}
                  title="Home"
                >
                  <AiOutlineHome size={22} className="text-white" />
                </div>
              </div>
            ) : null,
          }}
        />
      </div>

      <div className="admin-content w-full overflow-x-hidden">
        {/* Top Navigation Bar */}
        <div className="flex items-center bg-gray-400 px-6 py-2 rounded-b-[50px] space-x-4 relative">
          {/* Toggle Sidebar */}
          <div className="flex-shrink-0 z-10">
            <div className="flex flex-col justify-center items-center gap-2 cursor-pointer hover:bg-gray-200 hover:text-black p-2 transition-all duration-200 group rounded-[50%]">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="flex justify-center items-center"
              >
                {!collapsed ? (
                  <SlArrowLeft className="text-xl" />
                ) : (
                  <SlArrowRight className="text-xl" />
                )}
              </button>
            </div>
          </div>

          {/* Navigation Icons */}
          <div className="flex-1 overflow-x-auto px-0 md:px-4 scrollbar-hide">
            <div className="flex items-center gap-[30px] min-w-max justify-center">
              {renderNavigations()}
            </div>
          </div>

          {/* Language Switcher + Home */}
          {!isMobile && (
            <div className="flex items-center gap-2 w-[120px] flex-shrink-0 z-10">
              <LanguageSwitcher />
              <div
                className="flex justify-center items-center text-black gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-all duration-200"
                onClick={() => navigate("/home")}
              >
                <AiOutlineHome className="text-2xl" />
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="admin-main px-3 py-2 mt-2">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Admin;
