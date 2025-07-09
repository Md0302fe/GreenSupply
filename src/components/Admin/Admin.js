import React, { useState, useEffect, useRef } from "react";
import { FaBell } from "react-icons/fa";
import { GrStorage } from "react-icons/gr";
import { AiOutlineHome } from "react-icons/ai";
import { FaShoppingCart } from "react-icons/fa";
import { MdDashboardCustomize } from "react-icons/md";
import { Outlet, useNavigate } from "react-router-dom";
import { SlArrowLeft, SlArrowRight } from "react-icons/sl";
import { useQuery } from "@tanstack/react-query";

import ClickAwayListener from "react-click-away-listener";
import * as Notifications from "../../services/NotificationsServices";
import LanguageSwitcher from "../TranslateComponent/LanguageSwitcher";

import "./Admin.scss";
import socket from "../../socket";
import "react-pro-sidebar/dist/css/styles.css";

// icons libraries
import { CgBell } from "react-icons/cg";
import {
  FaGear,
  FaUserGear,
  FaClipboard,
  FaLemon,
  FaCubes,
} from "react-icons/fa6";

import { useSelector } from "react-redux";

const Admin = (props) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const [collapsed, setCollapsed] = useState(true);

  const [dropdownOpenIndex, setDropdownOpenIndex] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotiList, setShowNotiList] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);

  const [toggleIcons, setToggleIcons] = useState(() => {
    return localStorage.getItem("activeMenu" || "dashboard");
  });

  const fetchNotifications = async () => {
    const dataRequest = {
      access_token: user?._id,
    };
    const res = await Notifications?.getAllNotification(dataRequest);
    return res?.data;
  };

  const {
    data: dataNotifications,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

  useEffect(() => {
    if (dataNotifications && Array.isArray(dataNotifications)) {
      setNotifications(dataNotifications);
      const unread = dataNotifications.filter((item) => !item.is_read).length;
      setUnreadCount(unread);
    }
  }, [dataNotifications]);

  useEffect(() => {
    const handleNewNotification = (data) => {
      const newNoti = { ...data };
      setNotifications((prev) => [newNoti, ...prev]);
      setUnreadCount((count) => count + 1);
    };

    socket.on("pushNotification", handleNewNotification);
    return () => {
      socket.off("pushNotification", handleNewNotification);
    };
  }, []);

  const handleNotificationClick = (index) => {
    setNotifications((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, unread: false } : item
      )
    );

    setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
  };

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
      icon: <GrStorage className="text-2xl" />,
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
      icon: <FaCubes className="text-2xl" />,
      label: "finished_product",
      text: "Quản lý thành phẩm",
      href: "feature_finished_product",
    },
  ];

  const handleToggle = (label, href) => {
    setToggleIcons(label);
    localStorage?.setItem("activeMenu", label);
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

  const handleDropdownToggle = (index) => {
    setDropdownOpenIndex(dropdownOpenIndex === index ? null : index);
  };

  // Cập nhật notifications với is_read = true cho item
  const handleMarkAsRead = async (notification_id) => {
    const dataRequest = {
      access_token: user?._id,
      notification_id,
    };
    const res = await Notifications.read_Notification(dataRequest);

    setDropdownOpenIndex(null);
    refetch();
    return res;
  };

  // Xóa thông báo by notification_id
  const handleDeleteNotification = async (notification_id) => {
    const dataRequest = {
      access_token: user?._id,
      notification_id,
    };
    const res = await Notifications.delete_Notification(dataRequest);

    setDropdownOpenIndex(null);
    refetch();
    return res;
  };

  const renderNavigations = () => {
    return navigationsData.map(({ icon, label, href, text }, index) => {
      return (
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
      );
    });
  };

  return (
    <div className="admin-container min-h-screen overflow-y-auto">
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

          {/* Notification + Home */}
          {!isMobile && (
            <div className="flex items-center gap-2 w-[160px] flex-shrink-0 z-10">
              <LanguageSwitcher />

              {/* Chuông Thông Báo */}
              <div
                ref={notificationRef}
                className={`relative group flex flex-col justify-center items-center gap-2 cursor-pointer rounded-full p-2 transition-all duration-200 hover:bg-gray-100 ${
                  showNotiList ? "bg-blue-50" : "text-black"
                }`}
                onClick={() => setShowNotiList((prev) => !prev)}
              >
                <FaBell
                  className={`text-xl ${
                    showNotiList ? "text-blue-500" : "text-black"
                  }`}
                />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {unreadCount}
                  </span>
                )}
                <span className="absolute bottom-[-25px] left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-all duration-200 bg-gray-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap z-10">
                  Thông báo
                </span>
              </div>

              {/* Icon Home */}
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

      {/* Notification Dropdown */}
      {showNotiList && (
        <ClickAwayListener onClickAway={() => setShowNotiList(false)}>
          <div
            className="absolute bg-white border shadow-md rounded-md p-4 w-[400px] z-50"
            style={{
              top:
                (notificationRef.current?.getBoundingClientRect()?.bottom ||
                  250) +
                10 +
                window.scrollY,
              left:
                (notificationRef.current?.getBoundingClientRect()?.left || 0) -
                370 +
                window.scrollX,
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xl font-bold text-black">Thông báo</h4>
              <button
                onClick={() => setShowNotiList(false)}
                className="text-gray-700 hover:text-red-500 text-xl"
              >
                ✕
              </button>
            </div>
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-sm">Không có thông báo nào</p>
            ) : (
              <ul className="space-y-2 max-h-[1000px] overflow-y-auto">
                {notifications.map((item, idx) => (
                  <li
                    key={idx}
                    className={`text-sm text-gray-800 border-b pb-2 cursor-pointer p-2 rounded hover:bg-gray-100 relative ${
                      item.is_read ? "text-gray-400" : "font-semibold"
                    }`}
                    onClick={() => handleNotificationClick(idx)}
                  >
                    {/* Dấu chấm xanh cho thông báo chưa đọc */}
                    {!item.is_read && (
                      <div className="absolute bottom-2 right-2 w-2 h-2 bg-blue-800 rounded-full"></div>
                    )}

                    {/* Button ... và dropdown menu */}
                    <div className="absolute right-2 top-2">
                      <button
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-white bg-opacity-50 text-gray-500 hover:bg-opacity-100 hover:text-gray-700 border border-gray-300 shadow-sm transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDropdownToggle(idx);
                        }}
                      >
                        ⋯
                      </button>

                      {/* Dropdown menu - Sửa ở đây */}
                      {dropdownOpenIndex === idx && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-md shadow-lg z-10 border">
                          <div className="py-1">
                            <button
                              className="block w-full text-left px-4 py-1 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(item?._id);
                              }}
                            >
                              Đánh dấu đã đọc
                            </button>
                            <button
                              className="block w-full text-left px-4 py-1 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(item?._id);
                              }}
                            >
                              Xóa thông báo
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Phần nội dung thông báo */}
                    <p className="text-base font-medium text-blue-600 pr-8">
                      {" "}
                      {/* Thêm pr-8 để tránh đè lên nút ⋯ */}
                      {item.title}
                    </p>
                    {item.text_message && (
                      <p className="text-sm text-gray-700">
                        {item.text_message}
                      </p>
                    )}
                    <div className="flex justify-between mt-1 text-xs text-gray-400">
                      <span>
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString()
                          : item.timestamp
                          ? new Date(item.timestamp).toLocaleString()
                          : ""}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </ClickAwayListener>
      )}
    </div>
  );
};

export default Admin;
