import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import xoaiuc from "../../../assets/NewProject/ProductList/XoaiUc/xoaiuc-1.png";
import xoaicathl from "../../../assets/NewProject/ProductList/XoaiCatHoaLoc/xoaicathoaloc-1.png";
import xoaithanhca from "../../../assets/NewProject/ProductList/XoaiThanhCa/xoaithanhca-1.png";
import xoaituquy from "../../../assets/NewProject/ProductList/XoaiTuQuy/xoaituquy-1.png";

export const StoreProduct = [
  {
    id: 1,
    name: "Xoài Úc",
    price: "50.000đ",
    oldPrice: null,
    image: {
      src: xoaiuc,
    },
  },
  {
    id: 2,
    name: "Xoài cát Hoà Lộc",
    price: "50.000đ",
    oldPrice: "60.000đ",
    image: {
      src: xoaicathl,
    },
  },
  {
    id: 3,
    name: "Xoài thanh ca",
    price: "50.000đ",
    oldPrice: null,
    image: {
      src: xoaithanhca,
    },
  },
  {
    id: 4,
    name: "Xoài Tứ Quý",
    price: "50.000đ",
    oldPrice: null,
    image: {
      src: xoaituquy,
    },
  },
];

const StoreProducts = () => {
  const [selectedProductId, setSelectedProductId] = useState(null);
  const navigate = useNavigate(); // Hook điều hướng

  const handleClick = (id) => {
    setSelectedProductId(id);
  };

  const handleViewMore = () => {
    navigate("/Product"); 
  };

  return (
    <div className="max-w-[1450px] mx-auto text-center bg-gray-100 py-10 border border-gray-300 shadow-inner mb-10">
      <div className="font-instrument">
        {/* Tiêu đề */}
        <h2 className="text-[#006838] text-xl font-semibold mb-2">Cửa hàng</h2>
        <h1 className="text-[#FF8B00] text-3xl font-bold mb-2">SẢN PHẨM</h1>

        {/* Danh sách sản phẩm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {StoreProduct.map((product) => (
            <div
              key={product.id}
              className={`cursor-pointer hover:scale-105 transition-transform duration-300 p-4`}
            >
              {/* Ảnh sản phẩm */}
              <div
                onClick={() => handleClick(product.id)}
                className={`overflow-hidden flex justify-center items-center shadow-right-bottom ${
                  selectedProductId === product.id
                    ? "border-4 border-[#FFD412]"
                    : "border-4 border-white"
                }`}
              >
                <img
                  src={product.image.src}
                  alt={product.name}
                  className="w-auto h-auto"
                />
              </div>
              {/* Tên và giá sản phẩm */}
              <div className="mt-3">
                <h3 className="text-lg font-bold text-gray-800">
                  {product.name}
                </h3>
                <div className="flex flex-col items-center">
                  <p className="text-[#F14A00] text-lg font-semibold mt-1">
                    {product.price}
                  </p>
                  {product.oldPrice && (
                    <p
                      className="text-black line-through text-sm"
                      style={{ textDecorationColor: "#F14A00" }}
                    >
                      {product.oldPrice}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Nút xem thêm */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleViewMore} // Thêm sự kiện điều hướng
            className="flex items-center bg-[#FFE814] text-[#F14A00] px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#FBC02D] hover:scale-105 transition duration-300"
          >
            Xem thêm
            <span className="flex items-center justify-center ml-3 w-6 h-6 bg-[#F14A00] text-white rounded-full hover:bg-[#D84315]">
              <i className="fa-solid fa-chevron-right text-xs"></i>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreProducts;
