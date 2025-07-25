import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../../components/TranslateComponent/LanguageSwitcher";
import { Factory, BarChart3, Package } from "lucide-react";
import MangovateLogo from "../../assets/Logo_Mangovate/Logo_Rmb.png";

import MangoVateSlider from "./MangovateSlider";
import ServicesSection from "./LandingServices";
import Header from "./LandingPageHeader";
import Footer from "./LandingPageFooter";

const Navbar = () => {
  const { t } = useTranslation();

  return (
    <nav className="bg-white">
      <div className="flex justify-between max-h-[190px]">
        <div className="max-sm:hidden flex flex-col items-center ">
          <img
            src={MangovateLogo}
            className="relative top-[-50px] w-[255px] scale-125"
            alt=""
          />
        </div>
        <div className="sm:w-9/12 w-full flex flex-col ">
          <div className="flex sm:flex-row flex-col gap-4 justify-between sm:justify-between items-center py-4 pr-4">
            <input
              id="search"
              type="text"
              placeholder={t("landingPage.navbar.search_placeholder")}
              className="border px-4 py-2 rounded-full w-[60%] max-sm:hidden"
            />

            <div className="flex gap-4">
              <Link
                to="/login"
                className="border border-orange-500 text-orange-500 px-4 py-2 rounded-md"
              >
                {t("landingPage.navbar.login")}
              </Link>
              <Link
                to="/register"
                className="bg-orange-500 text-white px-4 py-2 rounded-md"
              >
                {t("landingPage.navbar.register")}
              </Link>
              <LanguageSwitcher />
            </div>
          </div>
          <div className="bg-orange-500 text-white flex justify-center sm:justify-start gap-6 md:gap-8 py-3 sm:pl-6 sm:rounded-s-lg">
            <a href="/" className="hover:underline text-sm sm:text-base">
              {t("landingPage.navbar.home")}
            </a>
            <a href="/" className="hover:underline text-sm sm:text-base">
              {t("landingPage.navbar.about")}
            </a>
            <a href="/" className="hover:underline text-sm sm:text-base">
              {t("landingPage.navbar.services")}
            </a>
            <a href="/" className="hover:underline text-sm sm:text-base">
              Blogs
            </a>
            <a href="/" className="hover:underline text-sm sm:text-base">
              {t("landingPage.navbar.contact")}
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Banner = () => {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto px-4 bg-slate-50">
      <div className="container mx-auto px-4 py-4">
        <div className="text-center mb-4">
          <div className="py-4 font-serif">
            <span className="text-4xl md:text-6xl font-bold text-black mb-4">
              Man
            </span>
            <span className="text-4xl md:text-6xl font-bold text-[#923522] mb-4">
              g
            </span>
            <span className="text-4xl md:text-6xl font-bold text-[#f09d2b] mb-4">
              ovate
            </span>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t("landingPage.banner.subtitle")}
          </p>
        </div>
        <MangoVateSlider />
      </div>
    </div>
  );
};

const Card = () => {
  const { t } = useTranslation();
  return (
    <div className="grid md:grid-cols-4 sm:grid-cols-2 max-lg:px-4 lg:px-28 justify-center mt-10 gap-4 mb-4">
      <div className="flex flex-col items-center text-center bg-[#006838] py-12 px-3 gap-2 rounded-2xl">
        <img src="/image/landing/group-1.png" alt="" className="w-16" />
        <p className=" text-white">
          {t("landingPage.cards.cost_satisfaction")}
        </p>
        <p className="self-start text-justify text-white">
          {t("landingPage.cards.cost_satisfaction_desc")}
        </p>
      </div>
      <div className="flex flex-col items-center text-center bg-[#006838] py-12 px-3 gap-2 rounded-2xl">
        <img src="/image/landing/group-2.png" alt="" className="w-16" />
        <p className=" text-white">{t("landingPage.cards.support_24_7")}</p>
        <p className="self-start text-justify text-white">
          {t("landingPage.cards.support_24_7_desc")}
        </p>
      </div>
      <div className="flex flex-col items-center text-center bg-[#006838] py-12 px-3 gap-2 rounded-2xl">
        <img src="/image/landing/group-3.png" alt="" className="w-16" />
        <p className=" text-white">
          {t("landingPage.cards.seamless_integration")}
        </p>
        <p className="self-start text-justify text-white">
          {t("landingPage.cards.seamless_integration_desc")}
        </p>
      </div>
      <div className="flex flex-col items-center text-center bg-[#006838] py-12 px-3 gap-2 rounded-2xl">
        <img src="/image/landing/group-4.png" alt="" className="w-16" />
        <p className=" text-white">
          {t("landingPage.cards.real_time_tracking")}
        </p>
        <p className="self-start text-justify text-white">
          {t("landingPage.cards.real_time_tracking_desc")}
        </p>
      </div>
    </div>
  );
};

const LandingPage = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      <Header />
      <Banner />
      <ServicesSection />
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            {t("landingPage.why_choose.title")}
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Factory className="w-8 h-8 text-orange-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">
                {t("landingPage.why_choose.advanced_tech")}
              </h4>
              <p className="text-gray-600">
                {t("landingPage.why_choose.advanced_tech_desc")}
              </p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">
                {t("landingPage.why_choose.effective_mgmt")}
              </h4>
              <p className="text-gray-600">
                {t("landingPage.why_choose.effective_mgmt_desc")}
              </p>
            </div>
            <div className="p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">
                {t("landingPage.why_choose.quality_assurance")}
              </h4>
              <p className="text-gray-600">
                {t("landingPage.why_choose.quality_assurance_desc")}
              </p>
            </div>
          </div>
        </div>
      </section>
      <Card />
      <Footer />
    </div>
  );
};

export default LandingPage;
