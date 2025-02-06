import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { resetUser } from "../../redux/slides/userSlides";
import { persistor } from "../../redux/store";
import * as UserServices from "../../services/UserServices";
import logo from "../../assets/NewProject/Logo/GreenSupply.png";

const Header = ({ setActive, setIsLoginActive, setIsRegisterActive }) => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleClickLogin = () => {
    setActive(true);
    setIsLoginActive(true);
  };

  const handleClickRegister = () => {
    setActive(true);
    setIsRegisterActive(true);
  };

  return (
    <div className="Header">
      <header className="bg-customOrange px-4 md:px-6 py-2 rounded-bl-2xl rounded-br-2xl w-full">
        {/* Thanh trên cùng */}
        <div className="container mx-auto flex flex-wrap w-full justify-center md:justify-end items-center gap-4 md:gap-4 px-2 md:px-6 py-2">
          <button className="text-sm font-medium text-white flex items-center space-x-2 hover:text-[#FFD700] transition-all duration-300">
            <i className="fa-solid fa-bell"></i>
            <span>Thông báo</span>
          </button>
          <button className="text-sm font-medium text-white flex items-center space-x-2 hover:text-[#FFD700] transition-all duration-300">
            <i className="fa-solid fa-globe"></i>
            <span>Tiếng Việt</span>
            <i className="fa-solid fa-chevron-down"></i>
          </button>
        </div>

        {/* Nội dung chính */}
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-12 items-center gap-2 px-2 md:px-6">
          {/* Logo */}
          <div className="md:col-span-2 flex justify-center md:justify-center">
            <img
              src={logo}
              alt="Green Supply Logo"
              className="h-12 md:h-16 max-w-full cursor-pointer"
              onClick={() => navigate("/")}
            />
          </div>

          {/* Thanh tìm kiếm */}
          <div className="md:col-span-7 relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <button className="h-[36px] w-[36px] flex items-center justify-center bg-[#FF8B00] text-white rounded-md hover:bg-[#D84315] transition-all duration-300">
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full h-[42px] md:h-[46px] pl-14 pr-4 py-2 rounded border font-bold border-gray-300 focus:outline-none text-[#FF8B00] focus:border-[#FF8B00] placeholder:text-[#FF8B00]"
            />
          </div>

          {/* Đăng ký & Đăng nhập */}
          <div className="md:col-span-3 flex justify-center md:justify-end flex-wrap gap-3 md:gap-4">
            <button
              onClick={handleClickRegister}
              className="w-[120px] md:w-[140px] h-[40px] md:h-[42px] text-sm font-bold bg-white text-black rounded-md transition-all duration-300 hover:brightness-110"
            >
              Đăng ký
            </button>

            <button
              onClick={handleClickLogin}
              className="w-[120px] md:w-[140px] h-[40px] md:h-[42px] text-sm font-bold bg-yellow-300 text-black rounded-md hover:bg-yellow-400 transition-all duration-300"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
