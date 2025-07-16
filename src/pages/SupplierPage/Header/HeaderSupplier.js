import React, { useState, useEffect, useRef } from "react";
import { Button } from "@mui/material";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import "../../../styles/css/HeaderSupplier.css";

import { FaBell } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { FaRegUser } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RiMenuFold4Line } from "react-icons/ri";
import { persistor } from "../../../redux/store";
import { RiMenuUnfold4Line } from "react-icons/ri";
import { MdDashboardCustomize } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import ClickAwayListener from "react-click-away-listener";
import { resetUser } from "../../../redux/slides/userSlides";
import * as UserServices from "../../../services/UserServices";
import * as Notifications from "../../../services/NotificationsServices";
import LanguageSwitcher from "../../../components/TranslateComponent/LanguageSwitcher";

import socket from "../../../socket";
import { useQuery } from "@tanstack/react-query";

const HeaderSupplier = ({ toggleSidebar, isSidebarOpen, windowWidth }) => {
  const { t } = useTranslation();

  const [anchorMyAcc, setAnchorMyAcc] = React.useState(null);
  const openMyAcc = Boolean(anchorMyAcc);
  const userRedux = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [dropdownOpenIndex, setDropdownOpenIndex] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotiList, setShowNotiList] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const notificationRef = useRef(null);

  console.log("notifications => ", notifications);

  const fetchNotifications = async () => {
    const dataRequest = {
      access_token: userRedux?.access_token,
    };
    const res = await Notifications?.getAllNotificationById(dataRequest);
    return res?.data;
  };

  const {
    data: dataNotifications,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["notifiocations_by_id"],
    queryFn: fetchNotifications,
  });

  useEffect(() => {
    const handleNewNotification = (data) => {
      const newNoti = { ...data };
      setNotifications((prev) => [newNoti, ...prev]);
      setUnreadCount((count) => count + 1);
    };

    socket.on("pushNotification_Send_To_Supplier", handleNewNotification);
    return () => {
      socket.off("pushNotification_Send_To_Supplier", handleNewNotification);
    };
  }, []);

  useEffect(() => {
    if (dataNotifications && Array.isArray(dataNotifications)) {
      setNotifications(dataNotifications);
      const unread = dataNotifications.filter((item) => !item.is_read).length;
      setUnreadCount(unread);
    }
  }, [dataNotifications]);

  const handleClickMyAcc = (event) => {
    setAnchorMyAcc(event.currentTarget);
  };
  const handleCloseMyAcc = () => {
    setAnchorMyAcc(null);
  };

  const truncateText = (text, maxLength = 20) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  // Hàm xử lý đăng xuất, tương tự như Header của HomePage
  const handleLogout = async () => {
    try {
      // Gọi API đăng xuất
      await UserServices.logoutUser();
      // Reset state của user trong Redux
      dispatch(resetUser());
      // Xóa dữ liệu trong Redux Persist
      persistor.purge();
      // Xóa dữ liệu lưu trong localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      // Chuyển hướng về trang chủ (hoặc trang login)
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const [openUserInfo, setOpenUserInfo] = useState(false);
  const handleOpenUserInfo = () => {
    setOpenUserInfo(true);
  };
  const handleCloseUserInfo = () => {
    setOpenUserInfo(false);
  };

  const handleNotificationClick = (index) => {
    setNotifications((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, unread: false } : item
      )
    );

    setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleDropdownToggle = (index) => {
    setDropdownOpenIndex(dropdownOpenIndex === index ? null : index);
  };

  // Cập nhật notifications với is_read = true cho item
  const handleMarkAsRead = async (notification_id) => {
    const dataRequest = {
      access_token: userRedux?.access_token,
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
      access_token: userRedux?.access_token,
      notification_id,
    };
    const res = await Notifications.delete_Notification(dataRequest);

    setDropdownOpenIndex(null);
    refetch();
    return res;
  };
  return (
    <header
      className="
        w-full h-[auto]
        py-2 pr-5
        border-b
        flex items-center justify-between
        fixed top-0 left-0 right-0 z-20 bg-white shadow
      "
    >
      <div className="part1 transition-all duration-500 ease-in-out w-fit">
        <Button
          sx={{ color: "rgba(0,0,0,0.8)" }}
          className={`
      !w-[40px] !h-[40px] !rounded-full !min-w-[40px]
      transition-all duration-500 ease-in-out
    `}
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? (
            <RiMenuFold4Line className="text-[18px] transition-all duration-500 ease-in-out" />
          ) : (
            <RiMenuUnfold4Line className="text-[18px] transition-all duration-500 ease-in-out" />
          )}
        </Button>
      </div>

      <div className="part2 w-[40%] flex items-center justify-end gap-4">
        <LanguageSwitcher />
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

        <div className="relative">
          <div
            className="rounded-full w-[35px] h-[35px] overflow-hidden cursor-pointer"
            onClick={handleClickMyAcc}
          >
            <img
              src={
                userRedux?.avatar ||
                "https://ecme-react.themenate.net/img/avatars/thumb-1.jpg"
              }
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>

          <Menu
            anchorEl={anchorMyAcc}
            id="account-menu"
            open={openMyAcc}
            onClose={handleCloseMyAcc}
            onClick={handleCloseMyAcc}
            slotProps={{
              paper: {
                elevation: 0,
                sx: {
                  position: "absolute",
                  top: "50px",
                  right: "10px",
                  width: "250px",
                  overflow: "visible",
                  filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                  mt: 1.5,
                  "& .MuiAvatar-root": {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  "&::before": {
                    content: '""',
                    display: "block",
                    position: "absolute",
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: "background.paper",
                    transform: "translateY(-50%) rotate(45deg)",
                    zIndex: 0,
                  },
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem onClick={handleCloseMyAcc} className="!bg-white">
              <div
                className="flex items-center gap-3"
                onClick={handleOpenUserInfo}
              >
                <div className="rounded-full w-[35px] h-[35px] overflow-hidden cursor-pointer">
                  <img
                    src={
                      userRedux?.avatar ||
                      "https://ecme-react.themenate.net/img/avatars/thumb-1.jpg"
                    }
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="info">
                  <h3 className="text-[15px] font-[500] leading-5">
                    {truncateText(userRedux?.full_name, 13) || "User"}
                  </h3>
                  <p className="text-[12px] font-[400] opacity-70">
                    {truncateText(userRedux?.email, 15) || "supplier@gmail.com"}
                  </p>
                </div>
              </div>
            </MenuItem>
            <Divider sx={{ borderColor: "black" }} />
            <MenuItem
              onClick={handleCloseMyAcc}
              className="flex items-center gap-3"
            >
              <FaRegUser className="text-[16px]" />
              <a href="/profile" className="text-[14px]">
                {t("personal_info")}
              </a>
            </MenuItem>

            {/* <MenuItem
              onClick={handleCloseMyAcc}
              className="flex items-center gap-3"
            >
              <MdDashboardCustomize className="text-[16px]" />
              <a href="/system/admin" className="text-[14px]">
                {t("system_management")}
              </a>
            </MenuItem> */}

            <MenuItem
              onClick={() => {
                handleCloseMyAcc();
                handleLogout();
              }}
              className="flex items-center gap-3"
            >
              <FiLogOut className="text-[18px]" />
              <span className="text-[14px]">{t("logout")}</span>
            </MenuItem>
          </Menu>

          {/* Popup hiển thị thông tin user */}
          <Dialog open={openUserInfo} onClose={handleCloseUserInfo}>
            <DialogTitle>{t("user_info")}</DialogTitle>
            <DialogContent dividers>
              <div className="flex items-center gap-3">
                <div className="rounded-full w-[50px] h-[50px] overflow-hidden">
                  <img
                    src={
                      userRedux?.avatar ||
                      "https://ecme-react.themenate.net/img/avatars/thumb-1.jpg"
                    }
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="info">
                  <h3 className="text-[15px] font-[500] leading-5">
                    {userRedux?.full_name || "User"}
                  </h3>
                  <p className="text-[12px] font-[400] opacity-70">
                    {userRedux?.email || "supplier@gmail.com"}
                  </p>
                  {/* Bạn có thể hiển thị thêm thông tin khác nếu cần */}
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseUserInfo} color="primary">
                {t("close")}
              </Button>
            </DialogActions>
          </Dialog>
        </div>
        {showNotiList && (
          <ClickAwayListener onClickAway={() => setShowNotiList(false)}>
            <div
              className="absolute bg-white border shadow-md rounded-md p-4 w-[400px] z-50 max-h-[800px]"
              style={{
                top:
                  (notificationRef.current?.getBoundingClientRect()?.bottom ||
                    250) +
                  10 +
                  window.scrollY,
                left:
                  (notificationRef.current?.getBoundingClientRect()?.left ||
                    0) -
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
                <ul className="space-y-2 max-h-[650px] overflow-y-auto">
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
    </header>
  );
};

export default HeaderSupplier;
