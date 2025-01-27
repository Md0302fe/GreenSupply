import Search from "antd/es/transfer/search";
import React, { useEffect, useState } from "react";
import { Badge, Button, Col, Popover, Row } from "antd";
import { CiSquareQuestion } from "react-icons/ci";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { AiOutlineUser } from "react-icons/ai";
import { LuUser } from "react-icons/lu";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { resetUser } from "../../redux/slides/userSlides";

import { WrapperContentPopup } from "./styles";
import { persistor } from "../../redux/store";

import "./Header.scss";
import * as UserServices from "../../services/UserServices";
import Loading from "../LoadingComponent/Loading";
import logoBraintots from "../../assets/logo.png";

import logo from "../../assets/NewProject/Logo/GreenSupply.png";

const Header = ({ setActive, setIsLoginActive, setIsRegisterActive }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userAvatar, setUserAvatar] = useState("");
  const [search, setSearch] = useState("");
  // get Data from redux => JSON data
  const userRedux = useSelector((state) => state.user);
  const orderRedux = useSelector((state) => state.order);

  // framework
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    setUserAvatar(userRedux?.avatar);
  }, [userRedux?.avatar]);

  // HIDE POP OVER
  const hide = () => {
    setOpen(false);
  };
  // OPEN CHANGE
  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
  };
  // Click Icons User
  const handleClickLogin = () => {
    setActive(true);
    setIsLoginActive(true);
  };
  // Click Icons User
  const handleClickRegister = () => {
    setActive(true);
    setIsRegisterActive(true);
  };
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

  return (
    <div className="Header">
      <header className="bg-customOrange px-6 py-2 rounded-bl-2xl rounded-br-2xl max-w-full">
        <div className="container mx-auto flex justify-end items-center space-x-4 max-w-full">
          <button className="text-sm font-medium text-white flex items-center space-x-2">
            <i className="fa-solid fa-bell"></i>
            <span>Thông báo</span>
          </button>
          <button className="text-sm font-medium text-white flex items-center space-x-2">
            <i className="fa-solid fa-globe"></i>
            <span>Tiếng Việt</span>
            <i className="fa-solid fa-chevron-down"></i>
          </button>
        </div>

        <div className="container mx-auto grid grid-cols-12 items-center gap-4 max-w-full">
          <div className="col-span-2 flex items-center">
            <img
              src={logo}
              alt="Green Supply Logo"
              className="h-16 max-w-full"
            />
          </div>
          <div className="col-span-7 relative max-w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <button className="h-[36px] w-[36px] flex items-center justify-center bg-[#FF8B00] text-white rounded-md">
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full h-[46px] pl-14 pr-4 py-2 rounded border font-bold border-gray-300 focus:outline-none text-[#FF8B00] focus:border-[#FF8B00] placeholder:text-[#FF8B00]"
            />
          </div>
          <div className="col-span-3 flex justify-end space-x-4 max-w-full">
            <button onClick={() => handleClickRegister()} className="w-[140px] h-[42px] text-sm font-bold bg-white text-black rounded-md">
              Đăng ký
            </button>
            <button onClick={() => handleClickLogin()} className="w-[140px] h-[42px] text-sm font-bold bg-yellow-300 text-black rounded-md">
              Đăng nhập
            </button>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
