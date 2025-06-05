// Data.js
import Slider1 from "../../../assets/NewProject/Carousel/slider-1.png";
import Slider2 from "../../../assets/NewProject/Carousel/slider-2.png";
import Slider3 from "../../../assets/NewProject/Carousel/slider-3.png";
import Slider4 from "../../../assets/NewProject/Carousel/slider-4.png";
import logo from "../../../assets/NewProject/Logo/logo-yellow.png";

export const logoSrc = logo;

export const ImageList = [
  {
    id: 1,
    img: Slider1,
    showLogo: true,
    logoSize: "h-20 w-auto",
    title: "",
    titleSize: "text-2xl md:text-2xl font-bold font-instrument",
    descriptionSize: "text-lg md:text-base font-instrument font-bold",
    description:
      "Nền tảng quản lý chuỗi cung ứng xoài thông minh, minh bạch và bền vững, giúp kết nối từ nông trại đến tay người tiêu dùng một cách hiệu quả.",
    contentPosition: "top-16 left-6",
    descriptionKey: "carousel.desc_1",
  },
  {
    id: 2,
    img: Slider2,
    showLogo: true,
    title: "TUYỂN CHỌN KỸ CÀNG",
    titleSize: "text-2xl md:text-2xl font-bold font-instrument",
    descriptionSize: "text-base md:text-base font-instrument font-bold",
    description:
      "Được lựa chọn từ những trái xoài to nhất, có độ chín đều ngon ngọt để cho ra thị trường Việt Nam và xuất khẩu.",
    contentPosition: "top-20",
    descriptionKey: "carousel.desc_2",
    titleKey: "carousel.title_2",
  },
  {
    id: 3,
    img: Slider3,
    showLogo: false,
    logoSize: "h-12 w-auto",
    title: "TIÊU CHUẨN",
    titleSize: "text-3xl font-bold font-instrument text-white",
    descriptionSize: "text-base md:text-lg text-white font-bold",
    description:
      "Những trái xoài đều được quản lý bằng QR Code dễ dàng truy xuất được thời điểm thu hoạch và vùng trồng sản phẩm.",
    contentPosition:
      "top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
    descriptionKey: "carousel.desc_3",
    titleKey: "carousel.title_3",
  },
  {
    id: 4,
    img: Slider4,
    showLogo: true,
    logoSize: "h-30 w-auto",
    title: "",
    titleSize: "text-2xl md:text-2xl font-bold font-instrument",
    descriptionSize:
      "text-2xl md:text-2xl font-instrument text-white font-bold mr-4",
    description:
      "Quy trình sản xuất xanh - Kết nối với nông dân đa tỉnh thành.",
    contentPosition: "top-16",
    descriptionKey: "carousel.desc_4",
  },
];
