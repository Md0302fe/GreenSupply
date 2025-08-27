import { useEffect, useRef, useState } from "react";
import { Popover } from "antd";
import {
  Search,
  Menu,
  X,
  Bell,
  User,
  ChevronDown,
  Settings,
  LogOut,
} from "lucide-react";
import { AiOutlineUser } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetUser } from "../../redux/slides/userSlides";
import { persistor } from "../../redux/store";
import { useTranslation } from "react-i18next";
import * as UserServices from "../../services/UserServices";
import { FaBell } from "react-icons/fa";
import socket from "../../socket";
import * as Notifications from "../../services/NotificationsServices";
import { useQuery } from "@tanstack/react-query";
import ClickAwayListener from "react-click-away-listener";

// Import components
import LanguageSwitcher from "../TranslateComponent/LanguageSwitcher";
import Loading from "../LoadingComponent/Loading";
import Breadcrumb from "./Breadcrum_nav";

// Import logo
import MangovateLogo from "../../assets/Logo_Mangovate/Logo_Rmb.png";

const ImprovedHeader = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const userRedux = useSelector((state) => state.user);
  const [userAvatar, setUserAvatar] = useState("");
  const dispatch = useDispatch();
  const [dropdownOpenIndex, setDropdownOpenIndex] = useState(null);
  const notificationRef = useRef(null);

  const [showNotiList, setShowNotiList] = useState(false);

  // Navigation items for authenticated users
  const navigationItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/production", label: t("production") || "Sản xuất" },
    { href: "/orders", label: t("orders") || "Đơn hàng" },
    { href: "/warehouse", label: t("warehouse") || "Kho bãi" },
    { href: "/reports", label: t("reports") || "Báo cáo" },
  ];

  const fetchNotifications = async () => {
    const dataRequest = {
      access_token: user?.access_token,
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

  // CLICK BTN LOG-OUT
  const handleClickBtnLogout = async () => {
    setLoading(true);
    await UserServices.logoutUser();
    dispatch(resetUser());
    persistor.purge();
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setOpen(false);
    setLoading(false);
    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  // OPEN CHANGE
  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
  };

  useEffect(() => {
    setUserAvatar(userRedux?.avatar);
  }, [userRedux?.avatar]);

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

  const handleDropdownToggle = (index) => {
    setDropdownOpenIndex(dropdownOpenIndex === index ? null : index);
  };

  // Cập nhật notifications với is_read = true cho item
  const handleMarkAsRead = async (notification_id) => {
    const dataRequest = {
      access_token: user?.access_token,
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
      access_token: user?.access_token,
      notification_id,
    };
    const res = await Notifications.delete_Notification(dataRequest);

    setDropdownOpenIndex(null);
    refetch();
    return res;
  };

  const handleOpenAdminCore = () => {
    const roleName = userRedux?.role_name;
    const mapping_role_page = [
      {
        role_name: "Admin",
        page_link: "/system/admin",
      },
      {
        role_name: "Material Manager",
        page_link: "/system/admin/feature_purchase_orders",
      },
      {
        role_name: "Warehouse Manager",
        page_link: "/system/admin/feature_warehouse",
      },
      {
        role_name: "Process Manager",
        page_link: "/system/admin/feature_production_process",
      },
    ];

    const matchedRole = mapping_role_page.find(
      (account) => account?.role_name === roleName
    );

    console.log("roleName ==> ", roleName);
    console.log("matchedRole ==> ", matchedRole?.page_link);

    if (matchedRole) {
      navigate(matchedRole?.page_link);
    } else {
      navigate("*");
    }
  };

  // Check if user is logged in
  const isLoggedIn =
    userRedux?.full_name !== "" && userRedux?.full_name !== undefined;

  return (
    <div className="Header">
      <header className="shadow-sm sticky top-0 z-50 bg-gradient-to-r from-yellow-200 to-orange-300">
        <div className="max-w-7xl mx-auto">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 ">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Link to="/home" className="flex items-center">
                <div className="max-sm:hidden flex flex-col items-center ">
                  <img
                    src={MangovateLogo}
                    className="h-[100px] md:h-[120px] w-auto object-contain cursor-pointer"
                    alt="Mangovate logo"
                  />
                </div>
                {/* Fallback logo */}
              </Link>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Desktop Search */}
              <div className="relative">
                {!isSearchOpen ? (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2.5 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-md transition-colors border border-gray-300 hover:border-orange-500"
                    title={t("search") || "Tìm kiếm"}
                  >
                    <Search className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder={t("landingPage.navbar.search_placeholder")}
                        className="w-64 pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        autoFocus
                        onBlur={() => setIsSearchOpen(false)}
                      />
                    </div>
                    <button
                      onClick={() => setIsSearchOpen(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Notifications */}
              {isLoggedIn && (
                <div className="relative">
                  {/* Chuông Thông Báo */}
                  <div
                    ref={notificationRef}
                    className={`relative border border-grey group flex flex-col justify-center items-center gap-2 cursor-pointer rounded-md p-2 transition-all duration-200 hover:bg-gray-100 ${
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
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-md">
                        {unreadCount}
                      </span>
                    )}
                    <span className="absolute bottom-[-25px] left-1/2 transform -translate-x-1/2 scale-0 group-hover:scale-100 transition-all duration-200 bg-gray-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap z-10">
                      Thông báo
                    </span>
                  </div>
                </div>
              )}
              {showNotiList && (
                <ClickAwayListener onClickAway={() => setShowNotiList(false)}>
                  <div
                    className="absolute bg-white border shadow-md rounded-md p-4 w-[400px] z-50 max-h-[600px]"
                    style={{
                      top:
                        (notificationRef.current?.getBoundingClientRect()
                          ?.bottom || 250) +
                        10 +
                        window.scrollY,
                      left:
                        (notificationRef.current?.getBoundingClientRect()
                          ?.left || 0) -
                        370 +
                        window.scrollX,
                    }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xl font-bold text-black">
                        Thông báo
                      </h4>
                      <button
                        onClick={() => setShowNotiList(false)}
                        className="text-gray-700 hover:text-red-500 text-xl"
                      >
                        ✕
                      </button>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="text-gray-500 text-sm">
                        Không có thông báo nào
                      </p>
                    ) : (
                      <ul className="space-y-2 max-h-[450px] overflow-y-auto">
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

              {/* User Section */}
              <Loading isPending={loading}>
                <div className="Wrapper-Account">
                  {isLoggedIn ? (
                    <div className="user-login">
                      <Popover
                        content={
                          <ul
                            className="user-nav"
                            style={{ padding: "0", minWidth: "160px" }}
                          >
                            {userRedux?.isAdmin === "Admin" && (
                              <li>
                                <div
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                                  onClick={() => handleOpenAdminCore()}
                                >
                                  <Settings className="w-4 h-4 mr-3" />
                                  {t("system_management") ||
                                    "Quản trị hệ thống"}
                                </div>
                              </li>
                            )}
                            <li>
                              <div
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                                onClick={() => navigate("/Profile")}
                              >
                                <User className="w-4 h-4 mr-3" />
                                {t("personal_info") || "Thông tin cá nhân"}
                              </div>
                            </li>
                            <li>
                              <div
                                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                                onClick={() => handleClickBtnLogout()}
                              >
                                <LogOut className="w-4 h-4 mr-3" />
                                {t("logout") || "Đăng xuất"}
                              </div>
                            </li>
                          </ul>
                        }
                        trigger="click"
                        open={open}
                        onOpenChange={handleOpenChange}
                        className="flex-center-center Popover"
                      >
                        <button className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md transition-colors">
                          {userAvatar ? (
                            <img
                              className="w-8 h-8 rounded-full object-cover"
                              src={userAvatar || "/placeholder.svg"}
                              alt="avatar"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextElementSibling.style.display =
                                  "flex";
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                          )}
                          <span className="hidden lg:block text-sm font-medium text-gray-700 max-w-24 truncate">
                            {userRedux.full_name}
                          </span>
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </button>
                      </Popover>
                    </div>
                  ) : (
                    <div className="None-account flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer">
                      <AiOutlineUser className="text-xl" />
                      <span className="text-sm font-medium">
                        {t("account") || "Tài khoản"}
                      </span>
                    </div>
                  )}
                </div>
              </Loading>
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-2 rounded-md transition-colors ${
                  isSearchOpen
                    ? "text-orange-500 bg-orange-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Search className="w-5 h-5" />
              </button>

              {isLoggedIn && (
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.filter((n) => n.unread).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.filter((n) => n.unread).length}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          {isSearchOpen && (
            <div className="md:hidden px-4 pb-4 border-t border-gray-100">
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={t("search_placeholder") || "Tìm kiếm..."}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200">
              <div className="px-4 py-4 space-y-4">
                {/* Mobile Navigation - Only show if logged in */}
                {isLoggedIn && (
                  <div className="space-y-2">
                    {navigationItems.map((item, index) => (
                      <a
                        key={index}
                        href={item.href}
                        className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md font-medium"
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                )}

                {/* Mobile User Actions */}
                {isLoggedIn && (
                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    <div className="flex items-center space-x-3 px-3 py-2">
                      {userAvatar ? (
                        <img
                          src={userAvatar || "/placeholder.svg"}
                          alt="Avatar"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {userRedux.full_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {userRedux?.isAdmin === "Admin"
                            ? "Quản trị viên"
                            : "Người dùng"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {userRedux?.isAdmin === "Admin" && (
                        <button
                          onClick={() => navigate("/system/admin")}
                          className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                          {t("system_management") || "Quản trị hệ thống"}
                        </button>
                      )}
                      <button
                        onClick={() => navigate("/Profile")}
                        className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        {t("personal_info") || "Thông tin cá nhân"}
                      </button>
                      <button
                        onClick={handleClickBtnLogout}
                        className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        {t("logout") || "Đăng xuất"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Language Switcher */}
                <div className="pt-4 border-t border-gray-200">
                  <LanguageSwitcher />
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
    </div>
  );
};

export default ImprovedHeader;
