import { React, useState } from "react";
import { FaBars } from "react-icons/fa6";
import { AiOutlineHome } from "react-icons/ai";
import { Outlet, useNavigate } from "react-router-dom";

import Sidebar from "./Sidebar";

import "./Admin.scss";
import "react-pro-sidebar/dist/css/styles.css";

const Admin = (props) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="admin-container">
      {/* Admin-Sidebar - [AS] */}
      <div className="admin-sidebar">
        <Sidebar collapsed={collapsed}></Sidebar>
      </div>
      <div className="admin-content w-full">
        {/* admin-header-content */}
        <div className="w-full flex justify-between items-center bg-white shadow-md px-4 h-16 transition-all duration-300">
          <div className="flex items-center cursor-pointer">
            <FaBars
              onClick={() => {
                setCollapsed(!collapsed);
              }}
              className="text-2xl text-gray-700 hover:text-blue-500 transition-colors duration-200"
            />
          </div>
          <div
            className="flex justify-center items-center text-black gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-all duration-200"
            onClick={() => navigate("/home")}
          >
            <AiOutlineHome className="text-2xl" />
            <span className="border-b-2 border-transparent hover:border-black transition-all duration-200">
              Quay về trang chủ
            </span>
          </div>
        </div>
        {/* admin-main-content */}
        <div className="admin-main px-3 py-2">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Admin;
