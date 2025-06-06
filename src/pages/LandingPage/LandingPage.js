import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../../components/TranslateComponent/LanguageSwitcher";
const Navbar = () => {
  const { t } = useTranslation();

  return (
    <nav className="bg-white">
      <div className="flex justify-between">
        <div className="max-sm:hidden w-5/12 flex flex-col items-center">
          <img src="/image/logo-orange.png" alt="" />
          <p className="text-supply-primary text-sm">
            {t('navbar.slogan')}
          </p>
        </div>
        <div className="sm:w-7/12 w-full flex flex-col">
          <div className="flex sm:flex-row flex-col gap-4 justify-center sm:justify-start items-center py-4">
            <input
              type="text"
              placeholder={t('navbar.search_placeholder')}
              className="border px-4 py-2 rounded-full w-1/2 max-sm:hidden"
            />
            
            <div className="flex gap-4">
              <Link
                to="/login"
                className="border border-orange-500 text-orange-500 px-4 py-2 rounded-md"
              >
                {t('navbar.login')}
              </Link>
              <Link
                to="/register"
                className="bg-orange-500 text-white px-4 py-2 rounded-md"
              >
                {t('navbar.register')}
              </Link>
            </div>
            <LanguageSwitcher/>

          </div>
          <div className="bg-orange-500 text-white flex justify-center sm:justify-start gap-6 md:gap-8 py-3 sm:pl-6 sm:rounded-s-lg">
            <a href="/" className="hover:underline text-sm sm:text-base">
              {t('navbar.home')}
            </a>
            <a href="/" className="hover:underline text-sm sm:text-base">
              {t('navbar.about')}
            </a>
            <a href="/" className="hover:underline text-sm sm:text-base">
              {t('navbar.services')}
            </a>
            <a href="/" className="hover:underline text-sm sm:text-base">
              Blogs
            </a>
            <a href="/" className="hover:underline text-sm sm:text-base">
              {t('navbar.contact')}
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
    <div
      className="h-[600px] bg-cover bg-no-repeat mt-8 flex flex-col justify-center items-start md:pl-12 pl-3 pr-3"
      style={{ backgroundImage: "url(/image/truck-1.png)" }}
    >
      <img src="/image/logo-green.png" alt="" className="w-48" />
      <p className="text-white max-w-[360px] text-xl ">
        {t('banner.description')}
      </p>
      <div className="sm:w-[350px] w-[250px] h-[2px] border-b-4 border-supply-primary py-2"></div>
      <button className="bg-supply-primary rounded-b-xl rounded-tr-xl mt-4 flex gap-2 text-white px-3 py-2">
        <span>{t('banner.see_more')}</span>
        <img src="/image/icon/right.png" alt="" />
      </button>
    </div>
  );
};

const Card = () => {
  const { t } = useTranslation();
  return (
    <div className="grid md:grid-cols-4 sm:grid-cols-2 max-lg:px-4 lg:px-28 justify-center mt-10 gap-4">
      <div className="flex flex-col items-center text-center bg-[#006838] py-12 px-3 gap-2 rounded-2xl">
        <img src="/image/landing/group-1.png" alt="" className="w-16" />
        <p className=" text-white">{t("cards.cost_satisfaction")}</p>
        <p className="self-start text-justify text-white">
          {t("cards.cost_satisfaction_desc")}
        </p>
      </div>
      <div className="flex flex-col items-center text-center bg-[#006838] py-12 px-3 gap-2 rounded-2xl">
        <img src="/image/landing/group-2.png" alt="" className="w-16" />
        <p className=" text-white">{t("cards.support_24_7")}</p>
        <p className="self-start text-justify text-white">
          {t("cards.support_24_7_desc")}
        </p>
      </div>
      <div className="flex flex-col items-center text-center bg-[#006838] py-12 px-3 gap-2 rounded-2xl">
        <img src="/image/landing/group-3.png" alt="" className="w-16" />
        <p className=" text-white">{t("cards.seamless_integration")}</p>
        <p className="self-start text-justify text-white">
          {t("cards.seamless_integration_desc")}
        </p>
      </div>
      <div className="flex flex-col items-center text-center bg-[#006838] py-12 px-3 gap-2 rounded-2xl">
        <img src="/image/landing/group-4.png" alt="" className="w-16" />
        <p className=" text-white">{t("cards.real_time_tracking")}</p>
        <p className="self-start text-justify text-white">
          {t("cards.real_time_tracking_desc")}
        </p>
      </div>
    </div>
  );
};

const About = () => {
  const { t } = useTranslation();
  return (
    <div
      className="h-[600px] bg-cover bg-no-repeat mt-8 flex justify-end md:pr-12 pr-3 pl-3"
      style={{ backgroundImage: "url(/image/landing/about-bg.png)" }}
    >
      <div className="flex flex-col justify-center items-start">
        <img src="/image/landing/about.png" alt="" className="w-56" />
        <p className="text-white max-w-[420px] text-xl text-justify mt-4">
          {t("about.description")}
        </p>
        <div className="sm:w-[400px] w-[300px] h-[2px] border-b-4 border-supply-primary py-2"></div>
        <button className="bg-supply-primary rounded-b-xl rounded-tr-xl mt-4 flex gap-2 text-white px-3 py-2">
          <span>{t("about.see_more")}</span>
          <img src="/image/icon/right.png" alt="" />
        </button>
      </div>
    </div>
  );
};

const LandingPage = () => {
  return (
    <div>
      <Navbar />
      <Banner />
      <Card />
      <About />
    </div>
  );
};

export default LandingPage;
