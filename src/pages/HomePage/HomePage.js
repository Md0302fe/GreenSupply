import FeatureButtons from "../../components/BodyHomePage/FeatureButtons/FeatureButtons.js";
import ImportProductList from "../../components/BodyHomePage/ImportProductList/ImportProductList.js";
import "./HomPage.scss";

import LogoOrange from "../../assets/NewProject/Logo/logo-orange.png";
import Carousel from "../../components/BodyHomePage/CarouselComponent/Carousel.js";
import Farmer from "../../../src/assets/NewProject/Carousel/farmer.png";
import MangoOrange from "../../../src/assets/NewProject/Carousel/mango-orange.png";
import MangoBackground from "../../assets/NewProject/ProductList/background-1.png";
import StoreProduct from "../../components/BodyHomePage/StoreProduct/StoreProduct.js";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Info1 from "../../assets/NewProject/Carousel/info-1.png";
import Info2 from "../../assets/NewProject/Carousel/info-2.png";
import Info3 from "../../assets/NewProject/Carousel/info-3.png";
import { useTranslation } from "react-i18next";

const HomePage = () => {
  return (
    <div>
      <div className="relative mb-35 lg:mb-40">
        <Carousel />
        <div className="absolute -bottom-[4rem] md:-bottom-[4.5rem] lg:-bottom-[9rem] right-1/2 translate-x-1/2">
          <FeatureButtons />
        </div>
      </div>
      <ImportProductList />
      <MangoDescription />
      <AboutSupplyChain />
      <VisionOverview />
      {/* <StoreProduct /> */}
      <InfoKnowledge />
    </div>
  );
};

const MangoDescription = () => {
  const { t } = useTranslation();

  return (
    <div className="relative flex flex-col md:flex-row max-w-[1450px] mx-auto mt-10 mb-2 items-start ">
      {/* Wrapper cho hình ảnh */}
      <div className="relative z-20 flex flex-col items-start">
        {/* Hình ảnh lớn (Farmer) */}
        <div className="w-[180px] h-auto relative -top-[20px] left-[30px] md:w-[200px] md:left-[100px] lg:w-[400px] lg:left-[300px]">
          <img
            src={Farmer}
            alt="Farmer"
            className="w-[400px] h-auto shadow-lg"
          />
        </div>

        {/* Hình ảnh nhỏ (MangoOrange) */}
        <div className="absolute w-[120px] h-auto top-[100px] left-[120px] md:w-[150px] md:left-[200px] lg:w-[300px] lg:top-[300px] lg:left-[500px]">
          <img
            src={MangoOrange}
            alt="Mango"
            className="w-[300px] h-auto shadow-lg"
          />
        </div>
      </div>

      {/* Nội dung màu vàng */}
      <div className="bg-[#FFD412] rounded-[3rem] p-3 lg:p-4 sm:p-6 shadow-lg md:mt-1 mt-6 lg:mt-12 ml-0 lg:ml-4 w-full lg:max-w-[840px]">
        <p className="font-instrument text-black text-[10px] lg:text-sm leading-5 lg:leading-6 text-justify md:ml-[6rem] lg:ml-[18.5rem] ml-0">
          {t("homepage.mango_desc_1")}
        </p>
        <p className="font-instrument text-black text-[10px] lg:text-sm leading-5 lg:leading-6 text-justify mt-2 lg:mt-4 md:ml-[9rem] lg:ml-[25rem] ml-0">
          {t("homepage.mango_desc_2")}
        </p>
      </div>
    </div>
  );
};

const AboutSupplyChain = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-[1450px] mx-auto mt-28 mb-4 p-2 lg:p-4 sm:p-6 rounded-lg">
      {/* Phần logo và mô tả */}
      <div className="mx-4 md:mx-10 lg:mx-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-center lg:text-left">
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <img src={LogoOrange} alt="Logo" className="w-[140px] lg:w-[200px] h-auto mx-auto lg:mx-0" />
            <div className="text-[#FF8B00] font-semibold text-base lg:text-lg lg:mt-0">
              {t("slogan")}
            </div>
          </div>
        </div>

        {/* Responsive border line */}
        <div className="border-t-4 border-[#FF8B00] mb-1 mt-4 lg:-mt-[1rem] w-2/3 mx-auto lg:ml-[15rem] lg:mx-0"></div>
      </div>

      {/* Nội dung */}
      <div className=" mx-auto px-1 sm:px-6 lg:px-0">
        <div className="border-4 border-[#FF8B00] border-t-0 p-4 sm:p-6 lg:p-10">
          <h2 className="font-bold text-[12px] lg:text-base sm:text-lg mb-4 text-black text-left">
            {t("homepage.supply_chain_title")}
          </h2>
          <p className="text-black text-[10px] sm:text-sm md:text-base leading-5 sm:leading-6 mb-4 w-full text-left">
            {t("homepage.supply_chain_desc_1")}
          </p>
          <p className="text-black text-[10px] sm:text-sm md:text-base leading-5 sm:leading-6 w-full text-left">
            {t("homepage.supply_chain_desc_2")}
          </p>
        </div>
      </div>
    </div>
  );
};

const VisionOverview = () => {
  const { t } = useTranslation();

  return (
    <div className="w-full overflow-x-hidden">
    <div className="relative flex flex-col md:flex-row max-w-[1000px] mx-auto md:flex-nowrap items-start justify-between gap-6 mb-6 font-instrument pb-8">
      {/* Phần nội dung */}
      <div className="md:w-[40%] text-left self-start mt-0 lg:mt-4 font-bold">
        <h3 className="text-center lg:text-left text-[#006838] text-base md:text-lg lg:text-xl font-bold mb-2 lg:mb-4 leading-snug">
          {t("homepage.mission_title")}
        </h3>
        <p className="relative - left-[10px]  mb-1 lg:mb-3 text-xs md:text-base leading-relaxed">
          {t("homepage.mission_1")}
        </p>
        <p className="relative - left-[10px] mb-1 lg:mb-3 text-xs md:text-base leading-relaxed">
          {t("homepage.mission_2")}
        </p>
        <p className="relative - left-[10px] text-xs md:text-base leading-relaxed ">
          {t("homepage.mission_3")}{" "}
          <strong className="text-[#006838]">Green</strong>{" "}
          {t("homepage.mission_3_suffix")}
        </p>
      </div>

      {/* Phần hình ảnh */}
      <div className="w-full md:w-[50%]">
        {/* Ảnh nền */}
        <img
          src={MangoBackground}
          alt="Mango Background"
          className="w-full rounded-lg shadow-md"
        />

        {/* Thẻ thông tin */}
        <div className="absolute bottom-[-60] lg:bottom-[-40px] right-6 lg:right-4 sm:right-10 lg:right-40 flex gap-2 sm:gap-4 lg:gap-6">
          {/* Nhà vườn */}
          <div className="relative - top-[-50px] md:left-[-380px] md:top-[-100px] w-[100px] sm:w-[150px] lg:w-[270px] bg-[#006838] text-white px-2 sm:px-4 lg:px-6 py-0 sm:py-6 lg:py-8 rounded-lg shadow-right-bottom flex flex-col justify-center">
            <h3 className="text-xs sm:text-sm lg:text-xl font-bold text-left">
              {t("homepage.garden_title")}
            </h3>
            <h1 className="text-lg sm:text-2xl lg:text-4xl font-bold text-center mt-2">1000+</h1>
          </div>

          {/* Hecta đất trồng */}
          <div className="relative - top-[-50px] md:left-[-380px] md:top-[-100px] w-[100px] sm:w-[150px] lg:w-[270px] bg-[#FFD412] text-white px-2 sm:px-4 lg:px-6 py-2 sm:py-6 lg:py-8 rounded-lg shadow-right-bottom flex flex-col justify-center">
            <h3 className="text-xs sm:text-sm lg:text-xl font-bold text-left">
              {t("homepage.area_title")}
            </h3>
            <h1 className="text-lg sm:text-2xl lg:text-4xl font-bold text-center mt-2">60.000+</h1>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

const InfoKnowledge = () => {
  const { t } = useTranslation();

  const articles = [
    {
      image: Info1,
      date: t("homepage.article_1_date"),
      title: t("homepage.article_1_title"),
    },
    {
      image: Info2,
      date: t("homepage.article_2_date"),
      title: t("homepage.article_2_title"),
    },
    {
      image: Info3,
      date: t("homepage.article_3_date"),
      title: t("homepage.article_3_title"),
    },
  ];

  // Cấu hình Slider
  const settings = {
    dots: true, // Hiển thị chấm điều hướng
    infinite: true, // Vòng lặp vô hạn
    speed: 500, // Thời gian chuyển đổi (ms)
    slidesToShow: 3, // Số slide hiển thị
    slidesToScroll: 1, // Số slide cuộn mỗi lần
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="w-full overflow-x-hidden">
      <div className="w-full max-w-[1450px] mx-auto mb-8">
        {/* Tiêu đề */}
        <div className="relative mb-4 mx-[3rem]">
          <h2 className="text-2x1 md:text-3xl font-bold text-[#006838] inline-block">
            {t('homepage.info_knowledge_title')}
          </h2>
          <div className="absolute bottom-0 right-0 w-[75%] h-[2px] lg:h-[3px] bg-[#006838]"></div>
        </div>

        {/* Slider */}
        <Slider {...settings} className="my-8">
          {articles.map((article, index) => (
            <div key={index} className="px-6 h-auto">
              <div className="flex flex-col items-center transition-shadow duration-300">
                <img
                  src={article.image}
                  alt={`Article ${index + 1}`}
                  className="w-full h-auto object-cover"
                />
                <div className="w-full h-full my-3">
                  <div className="flex justify-between">
                    <div className="mt-2 w-[64%] h-[4px] bg-orange-500 rounded-full"></div>
                    <p className="text-sm text-black mb-2">{article.date}</p>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700">
                    {article.title}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default HomePage;
