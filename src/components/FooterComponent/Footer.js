import React from "react";
import { useTranslation } from "react-i18next";
import logoWhite from "../../assets/NewProject/Logo/logo-white.png";
import FacebookIcon from "../../assets/NewProject/Icon-GreenSupply/Facebook.png";
import YoutubeIcon from "../../assets/NewProject/Icon-GreenSupply/YouTube.png";
import TiktokIcon from "../../assets/NewProject/Icon-GreenSupply/TikTok.png";
import BackgroundFooter from "../../assets/NewProject/ProductList/background-footer.png";

import MangovateLogo from "../../assets/Logo_Mangovate/Logo_Rmb.png";


const Footer = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full bg-[#053B22] text-white">
      <div className="relative w-full">
        {/* Background Image */}
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <img
          src={BackgroundFooter}
          alt="Background Footer"
          className="w-full h-[250px] md:h-[350px] object-cover"
        />

        {/* Overlay Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
          <img
            src={MangovateLogo}
            alt="Mangovate Logo"
            className="w-36 md:w-48 mb-2"
          />
          <h1 className="text-xl md:text-3xl font-bold mb-4">
            {t("slogan")}
          </h1>

          {/* Intro Button */}
          <div className="mt-4 -md:mt-[32px]">
            <button className="flex items-center bg-[#FFE814] text-[#F14A00] px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#FBC02D] hover:scale-105 transition duration-300">
              {t("footer.intro")}
              <span className="flex items-center justify-center ml-3 w-6 h-6 bg-[#F14A00] text-white rounded-full hover:bg-[#D84315]">
                <i className="fa-solid fa-chevron-right text-xs"></i>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-16">
        {/* Logo & Description */}
        <div>
          <img
            src={logoWhite}
            alt="Green Supply"
            className="w-28 md:w-36 mb-4"
          />
          <h4 className="text-sm leading-6">{t("slogan")}</h4>
          <p className="text-sm leading-6 mt-4 text-white">
            {t("footer.description")}
          </p>
        </div>

        {/* Office Info */}
        <div>
          <h3 className="font-bold text-lg mb-4">{t("footer.office")}</h3>
          <p className="text-sm text-white">{t("footer.company_name")}</p>
          <p className="text-sm mt-2 text-white">{t("footer.address")}</p>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="font-bold text-lg mb-4">{t("footer.contact")}</h3>
          <p className="text-sm text-white">{t("footer.email")}</p>
          <p className="text-sm mt-2 text-white">{t("footer.phone")}</p>
          <div className="flex gap-4 mt-6">
            <img src={FacebookIcon} alt="Facebook" className="w-6 h-6" />
            <img src={YoutubeIcon} alt="YouTube" className="w-6 h-6" />
            <img src={TiktokIcon} alt="TikTok" className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="w-full h-16 bg-white flex justify-center items-center">
        <p className="font-bold text-black">{t("footer.copyright")}</p>
      </div>
    </div>
  );
};

export default Footer;
