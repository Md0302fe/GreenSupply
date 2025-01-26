import React from "react";
import LogoYellow from "../../assets/NewProject/Logo/logo-yellow.png";
import logoWhite from "../../assets/NewProject/Logo/logo-white.png";
import FacebookIcon from "../../assets/NewProject/Icon-GreenSupply/Facebook.png";
import YoutubeIcon from "../../assets/NewProject/Icon-GreenSupply/YouTube.png";
import TiktokIcon from "../../assets/NewProject/Icon-GreenSupply/TikTok.png";
import BackgroundFooter from "../../assets/NewProject/ProductList/background-footer.png";

const Footer = () => {
  return (
    <div className="max-w-full bg-[#053B22] text-white">
      <div className="relative">
        {/* Background Image */}
        <img
          src={BackgroundFooter}
          alt="Background Footer"
          className="w-full h-auto"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black opacity-50"></div>

        {/* Nội dung */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
          <img src={LogoYellow} alt="Green Supply Logo" className="w-48 mb-4" />
          <h1 className="text-3xl font-bold mb-4">
            Giải pháp hiệu quả dành cho nông sản của bạn
          </h1>
          <div className="w-[60rem] h-[3px] bg-[#FFD412] mb-4 rounded-full"></div>

          {/* Nút Giới thiệu */}
          <div className="flex justify-center mt-6">
            <button className="flex items-center bg-[#FFE814] text-[#F14A00] px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#FBC02D] hover:scale-105 transition duration-300">
              Giới thiệu
              <span className="flex items-center justify-center ml-3 w-6 h-6 bg-[#F14A00] text-white rounded-full hover:bg-[#D84315]">
                <i className="fa-solid fa-chevron-right text-xs"></i>
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-2 py-12 grid grid-cols-1 md:grid-cols-3 gap-x-16">
        {/* Logo và mô tả */}
        <div className="">
          <img src={logoWhite} alt="Green Supply" className="w-36 mb-4" />
          <h4 className="text-sm leading-6">
            Giải pháp hiệu quả dành cho nông sản của bạn
          </h4>
          <h4 className="text-sm leading-6 mt-4 mr-[2rem]">
            Nền tảng quản lý chuỗi cung ứng xoài thông minh, minh bạch và bền
            vững, giúp kết nối từ nông trại đến tay người tiêu dùng một cách
            hiệu quả.
          </h4>
        </div>

        {/* Văn phòng */}
        <div className="">
          <h3 className="font-bold text-lg mb-4">Văn phòng</h3>
          <h4 className="text-sm">Công ty TNHH Green Supply</h4>
          <h4 className="text-sm mt-2">
            Địa chỉ: 120 đường Nguyễn Văn Cừ, phường Long Tuyền, quận Bình Thủy
            - Cần Thơ
          </h4>
        </div>

        {/* Thông tin liên lạc */}
        <div>
          <h3 className="font-bold text-lg mb-4">Thông tin liên lạc</h3>
          <h4 className="text-sm">Email: Greensupply@gmail.com</h4>
          <h4 className="text-sm mt-2">Điện thoại: 0976 000 000</h4>
          {/* Mạng xã hội */}
          <div className="flex gap-4 mt-6">
            <img src={FacebookIcon} alt="Facebook" className="w-6 h-6" />
            <img src={YoutubeIcon} alt="YouTube" className="w-6 h-6" />
            <img src={TiktokIcon} alt="TikTok" className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="max-w-full h-20 bg-white flex justify-center items-center">
        <p className="font-bold text-black font-instrument">
          Greensupply.com.vn
        </p>
      </div>
    </div>
  );
};

export default Footer;
