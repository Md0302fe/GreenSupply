import { React, useState } from "react";
import { AiOutlineHome } from "react-icons/ai";
import { Outlet, useNavigate } from "react-router-dom";

// icons libraries
import { CgBell } from "react-icons/cg";
import { FaGear } from "react-icons/fa6";
import { FaUserGear } from "react-icons/fa6";
import { FaClipboard } from "react-icons/fa6";
import { FaHockeyPuck } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import { SlArrowLeft } from "react-icons/sl";
import { SlArrowRight } from "react-icons/sl";
import { MdDashboardCustomize } from "react-icons/md";
import { FaLemon } from "react-icons/fa6";

import Sidebar from "./Sidebar";

import "./Admin.scss";
import "react-pro-sidebar/dist/css/styles.css";

const Admin = (props) => {
  const [collapsed, setCollapsed] = useState(true);
  const navigate = useNavigate();

  const [toggleIcons, setToggleIcons] = useState("dashboard");

  const navigationsData = [
    {
      icon: <FaUserGear Gear className="text-2xl" />,
      label: "users",
      text: "Người dùng",
      href: "feature_users",
    },
    {
      icon: <FaClipboard className="text-2xl" />,
      text: "Đơn thu nguyên liệu",
      label: "purchased_orders",
      href: "feature_purchase_orders",
    },
    {
      icon: <FaShoppingCart className="text-2xl" />,
      text: "Q.lý đơn hàng",
      label: "management_orders",
      href: "feature_request_suppplier",
    },
    {
      icon: <FaHockeyPuck className="text-2xl" />,
      text: "Q.lý kho",
      label: "management_warehouse",
      href: "feature_warehouse",
    },
    {
      icon: <MdDashboardCustomize className="text-2xl" />,
      label: "dashboard",
      text: "Dashboard",
      href: "/system/admin",
    },
    {
      icon: <FaLemon className="text-2xl" />,
      text: "Q.lý nguyên liệu",
      label: "management_materials",
      href: "feature_material_category",
    },

    {
      icon: <FaGear className="text-2xl" />,
      text: "Q.lý sản xuất",
      label: "management_processing",
      href: "feature_production_process",
    },
    { icon: <CgBell className="text-2xl" />, text: "Thông báo" },
  ];

  const renderNavigations = () => {
    return navigationsData.map(({ icon, label, href }, index) => (
      <div
        key={index}
        className={`flex flex-col justify-center items-center gap-4 cursor-pointer rounded-[50%] p-2 transition-all duration-200 group ${
          toggleIcons === label
            ? "bg-gray-100  text-blue-500"
            : "bg-black hover:bg-gray-100"
        }`}
        onClick={() => handleTogge(label, href)} // Cập nhật trạng thái khi nhấp
      >
        <button className="flex justify-center items-center">{icon}</button>
      </div>
    ));
  };

  const handleTogge = (label, href) => {
    setToggleIcons(label);
    navigate(href);
  };

  return (
    <div className="admin-container min-h-screen overflow-y-auto">
      {/* Admin-Sidebar - [AS] */}
      <div className="admin-sidebar min-h-screen">
        <Sidebar collapsed={collapsed}></Sidebar>
      </div>
      <div className="admin-content w-full">
        {/* New Nav */}
        <div className="flex items-center bg-gray-400 px-6 py-2 rounded-b-[50px] space-x-4">
          <div className="flex flex-col justify-center items-center gap-2 cursor-pointer hover:bg-gray-200  hover:text-black p-2 transition-all duration-200 group rounded-[50%]">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex justify-center items-center"
            >
              {!collapsed ? (
                <SlArrowLeft className="text-xl transition-colors duration-200" />
              ) : (
                <SlArrowRight className="text-xl transition-colors duration-200" />
              )}
            </button>
          </div>
          <div className="flex items-center w-full justify-center gap-[30px]">
            {renderNavigations()}
          </div>
          <div
            className="flex justify-center items-center text-black gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-all duration-200"
            onClick={() => navigate("/home")}
          >
            <AiOutlineHome className="text-2xl" />
          </div>
        </div>

        {/* admin-main-content */}
        <div className="admin-main px-3 py-2 mt-2">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Admin;
