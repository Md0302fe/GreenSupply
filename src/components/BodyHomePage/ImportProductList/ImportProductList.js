import React, { useEffect, useState } from "react";
import { getAllFuelEntry } from "../../../services/FuelEntryServices";
import { useParams } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

const ImportProductList = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const [productList, setProductList] = useState([]);
  const { id } = useParams();
  const user = useSelector((state) => state.user);

  const fetchOrders = async () => {
    try {
      const access_token = user?.access_token;
      const user_id = user?.id;
      const response = await getAllFuelEntry({}, access_token, user_id);
      const filteredOrders = response.data.filter(
        (order) =>
          order.status === "Đang xử lý" &&
          !order.is_deleted &&
          new Date(order.end_received).getTime() > Date.now()
      );
      setProductList(filteredOrders);
      console.log(productList);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [id]);

  // Cấu hình Slider
  const sliderSettings = {
    dots: true,
    infinite: productList.length > 4,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1 },
      },
    ],
  };
  const handleCreateOrder = () => {
    navigate(`/supplier/provide-request`);
  };
  return (
    <div className="max-w-[1400px] mx-auto p-6 bg-[#F4F4F4] border border-gray-800 shadow-inner mb-4 mt-[5rem]">
      <div className="flex justify-between items-center mb-4 mt-3 mx-4">
        <h2 className="text-[16px] sm:text-2xl lg:text-3xl font-semibold text-orange-500 font-nunito">
          {t("import_product_list.title")}
        </h2>
        <button
          onClick={handleCreateOrder}
          className="text-[12px] sm:text-sm md:text-base text-blue-600 font-semibold hover:underline hover:text-blue-800 transition"
        >
          {t("import_product_list.view_more")} →
        </button>
      </div>

      {productList.length > 0 ? (
        productList.length >= 0 ? (
          <Slider {...sliderSettings}>
            {productList.map((product) => (
              <div key={product._id} className="p-2">
                <ProductItem product={product} />
              </div>
            ))}
          </Slider>
        ) : (
          <div className="flex justify-center gap-4 flex-wrap">
            {productList.map((product) => (
              <div key={product._id} className="p-2">
                <ProductItem product={product} />
              </div>
            ))}
          </div>
        )
      ) : (
        <p className="text-[12px] sm:text-base md:text-lg font-semibold text-center text-gray-700 my-4">
          {t("import_product_list.empty")}
        </p>
      )}
    </div>
  );
};

const ProductItem = ({ product }) => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  // Hàm tính thời gian còn lại
  const getTimeRemaining = (endTime) => {
    const total = Date.parse(endTime) - Date.now();
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    return {
      total,
      days,
      hours,
      minutes,
      seconds,
    };
  };
  const [timeLeft, setTimeLeft] = useState(
    getTimeRemaining(product.end_received)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedTime = getTimeRemaining(product.end_received);
      setTimeLeft(updatedTime);
      if (updatedTime.total <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [product.end_received]);

  const handleCreateOrderDetail = () => {
    navigate(`/supplier/provide-request/${product._id}`);
  };

  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-right-bottom">
      <img
        src={product.fuel_image || "/default-image.jpg"}
        alt="Fuel"
        className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] rounded-md object-cover object-center mt-2"
      />
      <div className="text-center mt-4">
        <h3 className="text-sm sm:text-lg font-bold font-instrument line-clamp-1">
          {product.request_name}
        </h3>
        <p className="text-xs sm:text-sm text-gray-700">
          {t("import_product_list.quantity")}:{" "}
          <span className="font-bold">{product.quantity_remain}</span>
        </p>
        <p className="text-xs sm:text-sm text-gray-700">
          {t("import_product_list.price_per_unit")}:{" "}
          <span className="font-bold">
            {product.price.toLocaleString("vi-VN")} VNĐ
          </span>
        </p>
        <p className="text-xs sm:text-sm text-gray-700">
          {t("import_product_list.total_price")}:{" "}
          <span className="font-bold">
            {product.total_price.toLocaleString("vi-VN")} VNĐ
          </span>
        </p>
        {timeLeft.total > 0 ? (
          <p className="text-xs sm:text-sm text-red-600 font-semibold">
            {t("import_product_list.remaining")}: {timeLeft.days}{" "}
            {t("common.days")} {timeLeft.hours} {t("common.hours")}{" "}
            {timeLeft.minutes} {t("common.minutes")} {timeLeft.seconds}{" "}
            {t("common.seconds")}
          </p>
        ) : (
          <p className="text-xs sm:text-sm text-gray-500 font-semibold">
            {t("import_product_list.expired")}
          </p>
        )}
      </div>
      <button
        onClick={handleCreateOrderDetail}
        className="bg-[#006838] text-white px-3 sm:px-4 py-2 rounded-md flex items-center hover:bg-[#008c4a] hover:scale-105 hover:shadow-lg transition-transform duration-200 ease-in-out mt-4"
      >
        <i className="fa-solid fa-file-alt mr-2"></i>{" "}
        {t("import_product_list.create_order")}
      </button>
    </div>
  );
};

export default ImportProductList;
