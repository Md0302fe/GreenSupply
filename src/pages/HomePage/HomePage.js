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

const HomePage = () => {
  return (
    <div>
      <div className="relative mb-40">
        <Carousel />
        <div className="absolute -bottom-[8rem] right-1/2 translate-x-1/2">
          <FeatureButtons />
        </div>
      </div>
      {/* <ImportProductList /> */}
      <MangoDescription />
      <AboutSupplyChain />
      <VisionOverview />
      <StoreProduct />
      <InfoKnowledge />
    </div>
  );
};

const MangoDescription = () => {
  return (
    <div className="relative flex max-w-[1450px] mx-auto mt-16 mb-8 items-start">
      {/* Wrapper cho hình ảnh */}
      <div className="relative z-20 flex flex-col items-start">
        {/* Hình ảnh lớn (Farmer) */}
        <div className="w-[400px] h-auto relative -top-[20px] left-[300px]">
          <img
            src={Farmer}
            alt="Farmer"
            className="w-[400px] h-auto shadow-lg"
          />
        </div>

        {/* Hình ảnh nhỏ (MangoOrange) */}
        <div className="absolute w-[300px] h-auto top-[220px] left-[500px]">
          <img
            src={MangoOrange}
            alt="Mango"
            className="w-[300px] h-auto shadow-lg"
          />
        </div>
      </div>

      {/* Nội dung màu vàng */}
      <div className="bg-[#FFD412] rounded-[3rem] p-6 shadow-lg mt-12 ml-4 max-w-[840px]">
        <p className="font-instrument text-black text-sm leading-6 text-justify ml-[18.5rem]">
          Nhắc đến các loại trái cây miền nhiệt đới không thể nào không nhắc đến
          quả xoài. Tại Việt Nam, xoài được trồng từ Nam chí Bắc, vùng trồng
          xoài tập trung từ Bình Định trở vào, và được trồng nhiều nhất ở các
          tỉnh Đồng bằng Sông Cửu Long như Bến Tre, Tiền Giang, Đồng Tháp, Vĩnh
          Long, Cần Thơ,… Việt Nam là nước đứng thứ 13 về sản xuất xoài trên thế
          giới.
        </p>
        <p className="font-instrument text-black text-sm leading-6 text-justify mt-4 ml-[25rem]">
          Với kinh nghiệm nhiều năm xuất khẩu loại quả này, Chánh Thu đã đang và
          sẽ mang quả xoài đến với người tiêu dùng của nhiều nước trên thế giới.
          Quả xoài chín có màu vàng hấp dẫn, vị chua ngọt và mùi thơm đặc trưng.
          Trong xoài chín có chứa các chất dinh dưỡng sau: glucid, protein,
          lipic, tro, nước và các chất khoáng khác như: Ca, photpho, Sắt,
          Vitamin A, Vitamin B1, Vitamin C, acid folic, beta caroten…
        </p>
      </div>
    </div>
  );
};

const AboutSupplyChain = () => {
  return (
    <div className="max-w-[1450px] mx-auto mt-8 mb-8 p-6 rounded-lg">
      {/* Phần logo và dòng mô tả */}
      <div className="mx-20">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={LogoOrange} alt="Logo" className="w-[200px] h-auto" />
            <div className="text-[#FF8B00] font-semibold text-lg ml-4">
              Giải pháp hiệu quả dành cho nông sản của bạn
            </div>
          </div>
        </div>
        <div className="border-t-4 border-[#FF8B00] mb-1 -mt-[1rem] w-2/3 ml-[15rem]"></div>
      </div>

      {/* Nội dung */}
      <div className="mx-auto">
        <div className="border-4 border-[#FF8B00] border-t-0 p-20 pt-4 pb-4">
          <h2 className="font-bold text-lg mb-4 text-black">TỔNG QUAN CHUỖI CUNG ỨNG</h2>
          <p className="text-black text-base leading-6 mb-4 w-[1250px]">
            Tổng quan chuỗi Tiền Giang và Đồng Tháp là hai tỉnh thuộc số 13 năm
            trong khu vực châu thổ ĐBSCL, có nhiều diện tích trồng cây xoài được
            canh tác rất lâu đời. Xoài 'Cát Hòa Lộc' là một giống xoài rất nổi
            tiếng có nguồn gốc từ tỉnh Tiền Giang. Nhiều chợ đầu mối đã hình
            thành và phát triển một cách tự phát hiện thu hút nhiều bạn hàng đến
            đây để giao dịch buôn bán. Tuy nhiên thị trường tiêu thụ chính cho
            quả xoài là thị trường trong nước và Trung Quốc.
          </p>
          <p className="text-black text-base leading-6">
            Đóng gói ở địa phương đóng vai trò rất quan trọng trong công việc
            điều phối toàn bộ hệ thống tiêu thụ xoài trong cả nước.
          </p>
        </div>
      </div>
    </div>
  );
};

const VisionOverview = () => {
  return (
    <div className="relative flex max-w-[1000px] mx-auto md:flex-nowrap items-start justify-between gap-6 mb-36 font-instrument">
      {/* Phần nội dung */}
      <div className="md:w-[40%] text-left self-start mt-4 font-bold">
        <h3 className="text-[#006838] text-xs md:text-lg font-bold mb-4 leading-snug">
          Sứ mệnh - Tầm nhìn
        </h3>
        <p className="mb-3 text-xs md:text-base leading-relaxed">
          Lựa chọn của khách hàng quan tâm đến sức khỏe và môi trường
        </p>
        <p className="mb-3 text-xs md:text-base leading-relaxed">
          Cung cấp cho bạn sản phẩm chất lượng cao từ nhà vườn uy tín
        </p>
        <p className="text-xs md:text-base leading-relaxed">
          Hãy truy cập <strong className="text-[#006838]">Green</strong> để lựa
          chọn cho mình những quả xoài sạch, an toàn cho sức khỏe
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
        <div className="absolute bottom-[-40px] right-40 flex gap-6">
          {/* Nhà vườn */}
          <div className="w-[270px] bg-[#006838] text-white px-6 py-8 rounded-lg shadow-right-bottom flex flex-col justify-center">
            <h3 className="text-xl font-bold text-left">Nhà vườn</h3>
            <h1 className="text-4xl font-bold text-center mt-2">1000+</h1>
          </div>

          {/* Hecta đất trồng */}
          <div className="w-[270px] bg-[#FFD412] text-white px-6 py-8 rounded-lg shadow-right-bottom flex flex-col justify-center">
            <h3 className="text-xl font-bold text-left">
              Hecta đất trồng trọt
            </h3>
            <h1 className="text-4xl font-bold text-center mt-2">60.000+</h1>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoKnowledge = () => {
  const articles = [
    {
      image: Info1,
      date: "25 tháng 11 năm 2025",
      title:
        "Tình hình sản xuất Xoài thế giới và Việt Nam | Kỹ thuật trồng và chăm sóc Xoài",
    },
    {
      image: Info2,
      date: "25 tháng 11 năm 2025",
      title: "Cải tiến chuỗi giá trị ngành hàng xoài tại tỉnh Đồng Tháp",
    },
    {
      image: Info3,
      date: "25 tháng 11 năm 2025",
      title:
        "Xây dựng chuỗi giá trị xoài Việt Nam phục vụ thị trường trong nước và các thị trường xuất khẩu chủ lực",
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
    <div className="w-full max-w-[1450px] mx-auto mt-6 mb-8">
      {/* Tiêu đề */}
      <div className="relative mb-4 mx-[3rem]">
        <h2 className="text-3xl font-bold text-[#006838] inline-block">
          Thông tin - Kiến thức
        </h2>
        <div className="absolute bottom-2 right-0 w-[75%] h-[3px] bg-[#006838]"></div>
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
  );
};

export default HomePage;
