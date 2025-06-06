import React from "react";
import Slider from "react-slick";
import { ImageList, logoSrc } from "./Data";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useTranslation } from "react-i18next";

const Carousel = () => {
  const { t } = useTranslation();

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div className="w-full max-w-[1450px] mx-auto mt-4 md:mt-8 lg:mt-10 mb-2">
      <Slider {...settings} className="overflow-hidden">
        {ImageList.map((item) => (
          <div
            key={item.id}
            className="relative h-[300px] sm:h-[400px] md:h-[500px] rounded-lg overflow-hidden"
          >
            {/* Hình ảnh */}
            <img
              src={item.img}
              alt={item.title}
              className="w-full h-full object-cover object-center"
            />

            {/* Overlay nội dung */}
            {item.id === 4 ? (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end pb-10 sm:pb-16 pl-4 sm:pl-10">
                {item.showLogo && (
                  <img
                    src={logoSrc}
                    alt="Logo"
                    className="max-w-[150px] sm:max-w-[200px] h-auto mb-2"
                  />
                )}
                <div className="flex items-center">
                  <h2 className={`text-sm sm:text-lg md:text-xl text-white`}>
                    {t(item.descriptionKey)}
                  </h2>
                  <button className="flex items-center bg-[#FFE814] text-[#F14A00] px-3 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm ml-6 sm:ml-10 hover:bg-[#FBC02D] hover:scale-105 transition duration-300">
                    Xem thêm
                    <span className="flex items-center justify-center ml-2 sm:ml-3 w-5 sm:w-6 h-5 sm:h-6 bg-[#F14A00] text-white rounded-full hover:bg-[#D84315]">
                      <i className="fa-solid fa-chevron-right text-xs"></i>
                    </span>
                  </button>
                </div>
              </div>
            ) : item.id === 3 ? (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="relative border-2 sm:border-4 border-white rounded-lg p-6 sm:p-8 text-center w-[80%] sm:w-[70%] h-auto sm:h-[54%]">
                  <h2 className={`text-base sm:text-lg md:text-xl mb-2 text-white`}>
                    {t(item.titleKey)}
                  </h2>
                  <div className="max-w-[300px] sm:max-w-[540px] mx-auto mb-4">
                    <h2 className={`text-sm sm:text-lg text-white`}>{t(item.descriptionKey)}</h2>
                  </div>
                  <div className="w-[200px] sm:w-[350px] h-[2px] sm:h-[3px] bg-white mx-auto mb-4"></div>
                  <div className="flex justify-center mt-4">
                    <button className="flex items-center bg-[#FFE814] text-[#F14A00] px-3 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm hover:bg-[#FBC02D] hover:scale-105 transition duration-300">
                      Xem thêm
                      <span className="flex items-center justify-center ml-2 sm:ml-3 w-5 sm:w-6 h-5 sm:h-6 bg-[#F14A00] text-white rounded-full hover:bg-[#D84315]">
                        <i className="fa-solid fa-chevron-right text-xs"></i>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-start justify-start pl-4 sm:pl-10 text-white">
                <div className="max-w-sm sm:max-w-md relative top-10 sm:top-20">
                  {item.showLogo && (
                    <img
                      src={logoSrc}
                      alt="Logo"
                      className="max-w-[100px] sm:max-w-[150px] mb-2"
                    />
                  )}
                  {item.title && (
                    <h2 className="text-sm sm:text-lg md:text-xl mb-3">
                      {t(item.titleKey)}
                    </h2>
                  )}
                  <h5 className="text-xs sm:text-sm md:text-lg mb-4">
                    {t(item.descriptionKey)}
                  </h5>
                  <div className="w-full h-[1px] sm:h-[2px] bg-[#FFE814] mb-4"></div>
                  <button className="flex items-center bg-[#FFE814] text-[#F14A00] px-3 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm hover:bg-[#FBC02D] hover:scale-105 transition duration-300">
                    {t("carousel.view_more")}
                    <span className="flex items-center justify-center ml-2 sm:ml-3 w-5 sm:w-6 h-5 sm:h-6 bg-[#F14A00] text-white rounded-full hover:bg-[#D84315]">
                      <i className="fa-solid fa-chevron-right text-xs"></i>
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Carousel;
