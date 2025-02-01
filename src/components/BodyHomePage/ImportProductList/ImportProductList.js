import React, { useState } from "react";
import { ProductList } from "../../../components/BodyHomePage/ImportProductList/ProductData.js";

const ImportProductList = () => {
  return (
    <div className="max-w-[1400px] mx-auto p-6 bg-[#F4F4F4] border border-gray-800 shadow-inner mb-10 mt-[6rem]">
      {/* Tiêu đề */}
      <h2 className="text-2xl sm:text-3xl font-bold text-orange-500 mb-4 mt-3 mx-4 font-instrument">
        Mặt hàng cần nhập
      </h2>

      {/* Danh sách sản phẩm */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {ProductList.map((product) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </div>

      {/* Nút xem thêm */}
      <div className="flex justify-center mt-8">
        <button className="flex items-center bg-[#FFE814] text-[#F14A00] px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#FBC02D] hover:scale-105 transition duration-300">
          Xem thêm
          <span className="flex items-center justify-center ml-3 w-6 h-6 bg-[#F14A00] text-white rounded-full hover:bg-[#D84315]">
            <i className="fa-solid fa-chevron-right text-xs"></i>
          </span>
        </button>
      </div>
    </div>
  );
};

const ProductItem = ({ product }) => {
  const [images, setImages] = useState(product.images);

  // Xử lý sự kiện khi click vào hình ảnh thumbnail
  const handleImageClick = (clickedIndex) => {
    const updatedImages = images.map((img, index) => ({
      ...img,
      isMain: index === clickedIndex,
    }));
    setImages(updatedImages);
  };

  // Lấy hình ảnh chính từ danh sách
  const mainImage = images.find((img) => img.isMain)?.src;

  return (
    <div className="flex flex-col sm:flex-row items-center bg-white p-4 rounded-lg shadow-right-bottom">
      {/* Hình ảnh sản phẩm */}
      <div className="flex items-start justify-center space-x-3 sm:space-x-4">
        {/* Thumbnails */}
        <div className="flex flex-col space-y-2">
          {images.map((image, index) => (
            <img
              key={index}
              src={image.src}
              alt={`Thumbnail ${index}`}
              className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-md object-cover object-center cursor-pointer transition-transform duration-200 ease-in-out ${
                image.isMain ? "border-2 border-black" : ""
              } hover:scale-105`}
              onClick={() => handleImageClick(index)}
            />
          ))}
        </div>

        {/* Ảnh chính */}
        <img
          src={mainImage}
          alt="Main"
          className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[122px] md:h-[122px] rounded-md object-cover object-center mt-2"
        />
      </div>

      {/* Thông tin sản phẩm */}
      <div className="flex justify-between items-center flex-1 ml-2 sm:ml-4 mt-3 sm:mt-0 w-full">
        <div>
          <h3 className="text-sm sm:text-lg font-bold font-instrument">
            {product.name}
          </h3>
          <h4 className="text-xs sm:text-sm text-gray-700 mt-2 mb-3 font-bold">
            Nhu cầu mặt hàng:{" "}
            <span className="text-[#006838] font-bold">{product.demand}</span>
          </h4>
          <p className="text-xs sm:text-sm text-gray-700 mt-2">
            Giá: {product.price}
          </p>
        </div>

        {/* Nút tạo đơn */}
        <button className="bg-[#006838] text-white px-3 sm:px-4 py-2 rounded-md flex items-center hover:bg-[#008c4a] hover:scale-105 hover:shadow-lg transition-transform duration-200 ease-in-out mt-3 sm:mt-5 md:mt-20">
          <i className="fa-solid fa-file-alt mr-2"></i> Tạo đơn
        </button>
      </div>
    </div>
  );
};

export default ImportProductList;
