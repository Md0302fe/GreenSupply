import React, { useEffect, useState } from "react";
import { getAllFuelEntry } from "../../../services/FuelEntryServices";
import { useParams } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom";

const ImportProductList = () => {
  const [productList, setProductList] = useState([]);
  const { id } = useParams();

  const fetchOrders = async () => {
    try {
      const response = await getAllFuelEntry();
      const filteredOrders = response.data.filter(
        (order) => order.status === "Đang xử lý" && !order.is_deleted
      );
      setProductList(filteredOrders);
      console.log(productList)
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
    infinite: true,
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

  return (
    <div className="max-w-[1400px] mx-auto p-6 bg-[#F4F4F4] border border-gray-800 shadow-inner mb-10 mt-[6rem]">
      <h2 className="text-2xl sm:text-3xl font-bold text-orange-500 mb-4 mt-3 mx-4 font-instrument">
        Mặt hàng cần nhập
      </h2>

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
        <p className="text-lg font-semibold text-center text-gray-700 mt-5">
          Hiện tại chưa có đơn cần cung cấp.
        </p>
      )}
    </div>
  );
};

const ProductItem = ({ product }) => {
  const navigate = useNavigate();

  const handleCreateOrder = () => {
    navigate(`/supplier/supply-request/${product._id}`);
  };

  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-right-bottom">
      <img
        src={product.fuel_image}
        alt="Fuel"
        className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] rounded-md object-cover object-center mt-2"
      />
      <div className="text-center mt-4">
        <h3 className="text-sm sm:text-lg font-bold font-instrument">
          {product.request_name}
        </h3>
        <p className="text-xs sm:text-sm text-gray-700">
          Số lượng: <span className="font-bold">{product.quantity}</span>
        </p>
        <p className="text-xs sm:text-sm text-gray-700">
          Giá mỗi đơn vị:{" "}
          <span className="font-bold">
            {product.price.toLocaleString("vi-VN")} VNĐ
          </span>
        </p>
        <p className="text-xs sm:text-sm text-gray-700">
          Tổng giá:{" "}
          <span className="font-bold">
            {product.total_price.toLocaleString("vi-VN")} VNĐ
          </span>
        </p>
      </div>
      <button
        onClick={handleCreateOrder}
        className="bg-[#006838] text-white px-3 sm:px-4 py-2 rounded-md flex items-center hover:bg-[#008c4a] hover:scale-105 hover:shadow-lg transition-transform duration-200 ease-in-out mt-4"
      >
        <i className="fa-solid fa-file-alt mr-2"></i> Tạo đơn
      </button>
    </div>
  );
};

export default ImportProductList;
