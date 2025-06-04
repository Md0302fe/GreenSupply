import React, { useEffect, useState } from "react";
import logo from "../../assets/NewProject/Logo/GreenSupply.png";
import { Badge, Button, Col, Popover, Row } from "antd";
import { WrapperContentPopup } from "./styles";
import { AiOutlineUser } from "react-icons/ai";
import Loading from "../LoadingComponent/Loading";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetUser } from "../../redux/slides/userSlides";
import { persistor } from "../../redux/store";
import { LuUser } from "react-icons/lu";
import "./Header.scss";
import LanguageSwitcher from "../TranslateComponent/LanguageSwitcher";
import { useTranslation } from "react-i18next";

import * as UserServices from "../../services/UserServices";

const Header = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const userRedux = useSelector((state) => state.user);
  const [userAvatar, setUserAvatar] = useState("");

  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  // CLICK BTN LOG-OUT
  const handleClickBtnLogout = async () => {
    setLoading(true);
    await UserServices.logoutUser();
    // sau khi gọi clear Cookie chứa token / set lại state (chứa thông tin user = redux)
    dispatch(resetUser());
    // Xóa dữ liệu trong Redux Persist
    persistor.purge(); // Xóa toàn bộ dữ liệu trong Redux Persist

    // Xóa dữ liệu trong localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    // Đảm bảo Popover đóng lại sau khi đăng xuất
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
  // Click Icons User

  return (
    <div className="Header">
      <header className="bg-customOrange px-4 md:px-6 py-2 rounded-bl-2xl rounded-br-2xl w-full">
        {/* Thanh trên cùng */}
        <div className="container mx-auto flex flex-wrap w-full justify-center md:justify-end items-center gap-4 md:gap-4 px-2 md:px-6 py-2">
          <button className="text-sm font-medium text-white flex items-center space-x-2 hover:text-[#FFD700] transition-all duration-300">
            <i className="fa-solid fa-bell"></i>
            <span>{t("notifications")}</span>
          </button>
          <LanguageSwitcher />
        </div>

        {/* Nội dung chính */}
        <div className="container  flex justify-between">
          {/* Logo */}
          <div className="md:col-span-2 flex justify-center md:justify-center">
            <Link to="/home">
              <img
                src={logo}
                alt="Green Supply Logo"
                className="h-12 md:h-16 max-w-full cursor-pointer"
              />
            </Link>
          </div>
          <Col span={6} className="Shopping-cart flex-center-center">
            <Loading isPending={loading}>
              <div className="Wrapper-Account text-black">
                {userRedux?.full_name !== "" &&
                userRedux?.full_name !== undefined ? (
                  <div className="user-login flex-center-center">
                    <>
                      <Popover
                        content={
                          <ul
                            className="user-nav"
                            style={{ padding: "0", minWidth: "160px" }}
                          >
                            {userRedux?.isAdmin === "Admin" && (
                              <li>
                                <WrapperContentPopup
                                  style={{ cursor: "pointer" }}
                                  onClick={() => navigate("/system/admin")}
                                >
                                  {t("system_management")}
                                </WrapperContentPopup>
                              </li>
                            )}
                            <li>
                              <WrapperContentPopup
                                style={{ cursor: "pointer" }}
                                onClick={() => navigate("/Profile")}
                              >
                                {t("personal_info")}
                              </WrapperContentPopup>
                            </li>
                            <li>
                              <WrapperContentPopup
                                style={{ cursor: "pointer" }}
                                onClick={() => handleClickBtnLogout()}
                              >
                                {t("logout")}
                              </WrapperContentPopup>
                            </li>
                          </ul>
                        }
                        trigger="click"
                        open={open}
                        onOpenChange={handleOpenChange}
                        className="flex-center-center Popover"
                      >
                        {userAvatar ? (
                          <img
                            className="w-[40px] h-[40px] rounded-[50%] object-cover cursor-pointer mr-2"
                            src={userAvatar}
                            alt="avatar"
                          ></img>
                        ) : (
                          <LuUser
                            style={{ fontSize: "35px", padding: "0 6px" }}
                          ></LuUser>
                        )}
                        <Button>
                          <span onClick={() => setOpen(false)}>
                            {userRedux.full_name}
                          </span>
                        </Button>
                      </Popover>
                    </>
                  </div>
                ) : (
                  <div className="None-account">
                    {/* Icons User */}
                    <AiOutlineUser className="shopping-cart-icons user text-black"></AiOutlineUser>
                    <span className="text-lg text-black">{t("account")}</span>
                  </div>
                )}
              </div>
            </Loading>
          </Col>
        </div>
      </header>
    </div>
  );
};

export default Header;
