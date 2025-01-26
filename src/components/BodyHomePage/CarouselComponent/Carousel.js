import React from "react";
import Slider from "react-slick";
import { ImageList, logoSrc } from "./Data";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Carousel = () => {
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
    <div className="w-full max-w-[1450px] mx-auto mt-10">
      <Slider {...settings} className="overflow-hidden">
        {ImageList.map((item) => (
          <div
            key={item.id}
            className="relative h-[500px] rounded-lg overflow-hidden"
          >
            {/* Hình ảnh */}
            <img
              src={item.img}
              alt={item.title}
              className="w-full h-full object-cover object-center"
            />

            {/* Overlay nội dung */}
            {item.id === 4 ? (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end pb-16 pl-10">
                {item.showLogo && (
                  <img
                    src={logoSrc}
                    alt="Logo"
                    className="max-w-[200px] h-auto mb-2"
                  />
                )}
                <div className="flex items-center">
                  <h2 className={`${item.descriptionSize}`}>
                    {item.description}
                  </h2>
                  <button className="flex items-center bg-[#FFE814] text-[#F14A00] px-4 py-2 rounded-lg font-bold text-sm ml-10 hover:bg-[#FBC02D] hover:scale-105 transition duration-300">
                    Xem thêm
                    <span className="flex items-center justify-center ml-3 w-6 h-6 bg-[#F14A00] text-white rounded-full hover:bg-[#D84315]">
                      <i className="fa-solid fa-chevron-right text-xs"></i>
                    </span>
                  </button>
                </div>
              </div>
            ) : item.id === 3 ? (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div
                  className="relative border-4 border-white rounded-lg p-8 text-center"
                  style={{ margin: "auto", width: "70%", height: "54%" }}
                >
                  <h2 className={`${item.titleSize} mb-4`}>{item.title}</h2>
                  <div className="max-w-[540px] mx-auto mb-4">
                    <p className={`${item.descriptionSize}`}>
                      {item.description}
                    </p>
                  </div>
                  <div className="w-[350px] h-[3px] bg-white mx-auto mb-4"></div>
                  <div className="flex justify-center mt-4">
                    <button className="flex items-center bg-[#FFE814] text-[#F14A00] px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#FBC02D] hover:scale-105 transition duration-300">
                      Xem thêm
                      <span className="flex items-center justify-center ml-3 w-6 h-6 bg-[#F14A00] text-white rounded-full hover:bg-[#D84315]">
                        <i className="fa-solid fa-chevron-right text-xs"></i>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`absolute inset-0 bg-black bg-opacity-50 flex items-start justify-start pl-10 text-white`}
              >
                <div
                  className={`max-w-md relative ${
                    item.contentPosition || "top-20"
                  }`}
                >
                  {item.showLogo && (
                    <img
                      src={logoSrc}
                      alt="Logo"
                      className={`${item.logoSize} mb-2`}
                    />
                  )}
                  {item.title && (
                    <h2 className={`${item.titleSize} mb-3`}>{item.title}</h2>
                  )}
                  <h5 className={`${item.descriptionSize} mb-4`}>
                    {item.description}
                  </h5>
                  <div className="w-full h-[2px] bg-[#FFE814] mb-4"></div>
                  <button className="flex items-center bg-[#FFE814] text-[#F14A00] px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#FBC02D] hover:scale-105 transition duration-300">
                    Xem thêm
                    <span className="flex items-center justify-center ml-3 w-6 h-6 bg-[#F14A00] text-white rounded-full hover:bg-[#D84315]">
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
