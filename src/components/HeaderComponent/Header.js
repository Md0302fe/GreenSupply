import { useEffect, useState } from "react";
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

  const navigate = useNavigate();
  const userRedux = useSelector((state) => state.user);
  const [userAvatar, setUserAvatar] = useState("");
  const dispatch = useDispatch();

  // Navigation items for authenticated users
  const navigationItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/production", label: t("production") || "Sản xuất" },
    { href: "/orders", label: t("orders") || "Đơn hàng" },
    { href: "/warehouse", label: t("warehouse") || "Kho bãi" },
    { href: "/reports", label: t("reports") || "Báo cáo" },
  ];

  // Mock notifications - replace with your actual notifications
  const notifications = [
    {
      id: 1,
      title: t("new_order") || "Đơn hàng mới",
      message: "Có 3 đơn hàng mới cần xử lý",
      time: "5 phút trước",
      unread: true,
    },
    {
      id: 2,
      title: t("warehouse_alert") || "Cảnh báo kho",
      message: "Nguyên liệu A sắp hết",
      time: "1 giờ trước",
      unread: true,
    },
    {
      id: 3,
      title: t("production_complete") || "Hoàn thành sản xuất",
      message: "Lô hàng #123 đã hoàn thành",
      time: "2 giờ trước",
      unread: false,
    },
  ];

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

    console.log("roleName ==> ", roleName)
    console.log("matchedRole ==> ", matchedRole?.page_link)

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

              {/* Notifications */}
              {isLoggedIn && (
                <div className="relative">
                  <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="relative p-2.5 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-md transition-colors border border-gray-300 hover:border-orange-500"
                    title={t("notifications") || "Thông báo"}
                  >
                    <Bell className="w-5 h-5" />
                    {notifications.filter((n) => n.unread).length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {notifications.filter((n) => n.unread).length}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {isNotificationOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsNotificationOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                        <div className="p-4 border-b border-gray-100">
                          <h3 className="font-semibold text-gray-900">
                            {t("notifications") || "Thông báo"}
                          </h3>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${
                                notification.unread ? "bg-blue-50" : ""
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 text-sm">
                                    {notification.title}
                                  </h4>
                                  <p className="text-gray-600 text-sm mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-gray-400 text-xs mt-2">
                                    {notification.time}
                                  </p>
                                </div>
                                {notification.unread && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="p-3 border-t border-gray-100">
                          <button className="w-full text-center text-orange-500 hover:text-orange-600 text-sm font-medium">
                            {t("view_all_notifications") ||
                              "Xem tất cả thông báo"}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Language Switcher */}
              <LanguageSwitcher />

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
