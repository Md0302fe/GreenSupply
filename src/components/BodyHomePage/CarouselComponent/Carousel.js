import Slider from "react-slick"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { useTranslation } from "react-i18next"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"

import MangovateLogo from "../../../assets/Logo_Mangovate/Logo_Rmb.png"

import Slider1 from "../../../assets/NewProject/Carousel/slider-1.png"
import Slider2 from "../../../assets/NewProject/Carousel/slider-2.png"
import Slider3 from "../../../assets/NewProject/Carousel/slider-3.png"
import Slider4 from "../../../assets/NewProject/Carousel/slider-4.png"

const ImageList = [
  {
    id: 1,
    img: Slider1,
    titleKey: "carousel.slide1_title",
    descriptionKey: "carousel.slide1_description",
    showLogo: true,
  },
  {
    id: 2,
    img: Slider2,
    titleKey: "carousel.slide2_title",
    descriptionKey: "carousel.slide2_description",
    showLogo: false,
  },
  {
    id: 3,
    img: Slider3,
    titleKey: "carousel.slide3_title",
    descriptionKey: "carousel.slide3_description",
    showLogo: false,
  },
  {
    id: 4,
    img: Slider4,
    titleKey: "carousel.slide4_title",
    descriptionKey: "carousel.slide4_description",
    showLogo: true,
  },
]

const CustomPrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 group"
  >
    <ChevronLeft className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
  </button>
)

const CustomNextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 group"
  >
    <ChevronRight className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
  </button>
)

const ImprovedCarousel = () => {
  const { t } = useTranslation()

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    dotsClass: "slick-dots custom-dots",
  }

  const renderSlideContent = (item) => {
    switch (item.id) {
      case 3:
        return (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 text-center max-w-lg mx-4">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 text-white">{t(item.titleKey)}</h2>
              <p className="text-sm sm:text-base text-white/90 mb-6 leading-relaxed">{t(item.descriptionKey)}</p>
              <div className="w-20 h-0.5 bg-orange-400 mx-auto mb-6"></div>
              <button className="group bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 hover:scale-105 flex items-center mx-auto">
                {t("carousel.view_more")}
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-10">
            {/* {item.showLogo && (
              <img src={MangovateLogo || "/placeholder.svg"} alt="Logo" className="w-32 sm:w-40 h-auto mb-4" />
            )} */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <h2 className="text-lg sm:text-xl text-white font-medium max-w-md">{t(item.descriptionKey)}</h2>
              <button className="group bg-yellow-400 hover:bg-yellow-500 text-orange-600 px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 hover:scale-105 flex items-center w-fit">
                {t("carousel.view_more")}
                <div className="w-6 h-6 bg-orange-600 rounded-full ml-3 flex items-center justify-center group-hover:bg-orange-700 transition-colors">
                  <ChevronRight className="w-3 h-3 text-white" />
                </div>
              </button>
            </div>
          </div>
        )

      default:
        return (
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex items-center">
            <div className="p-6 sm:p-10 max-w-lg">
              {/* {item.showLogo && (
                <img src={MangovateLogo || "/placeholder.svg"} alt="Logo" className="w-28 sm:w-36 h-auto mb-4" />
              )} */}
              <h2 className="text-xl sm:text-2xl font-bold mb-3 text-white">{t(item.titleKey)}</h2>
              <p className="text-sm sm:text-base text-white/90 mb-6 leading-relaxed">{t(item.descriptionKey)}</p>
              <div className="w-16 h-0.5 bg-yellow-400 mb-6"></div>
              <button className="group bg-yellow-400 hover:bg-yellow-500 text-orange-600 px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 hover:scale-105 flex items-center">
                {t("carousel.view_more")}
                <div className="w-6 h-6 bg-orange-600 rounded-full ml-3 flex items-center justify-center group-hover:bg-orange-700 transition-colors">
                  <ChevronRight className="w-3 h-3 text-white" />
                </div>
              </button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto mt-6 px-4">
      <div className="relative rounded-2xl overflow-hidden shadow-2xl">
        <Slider {...settings}>
          {ImageList.map((item) => (
            <div key={item.id} className="relative">
              <div className="relative h-[300px] sm:h-[400px] lg:h-[450px]">
                <img
                  src={item.img || "/placeholder.svg"}
                  alt={t(item.titleKey)}
                  className="w-full h-full object-cover"
                />
                {renderSlideContent(item)}
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  )
}

export default ImprovedCarousel
