import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ProductDetail = () => {
  const { id } = useParams(); // Lấy `id` từ URL
  const [product, setProduct] = useState(null); // Trạng thái lưu thông tin sản phẩm
  const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu
  const [error, setError] = useState(null); // Trạng thái lỗi
  const navigate = useNavigate();

  const handleCreateOrder = () => {
    navigate(`/customer/orders-production/${product._id}`);
  };

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/product/getProductDetail/${id}`
        );
        console.log("API Full Response:", response.data); // Kiểm tra dữ liệu API trả về

        // Kiểm tra và cập nhật state chính xác
        if (response.data.product) {
          setProduct(response.data.product); // Nếu có key `product`, gán vào state
        } else if (response.data.productDetail) {
          setProduct(response.data.productDetail); // Nếu API trả về `productDetail`, sử dụng nó
        } else {
          console.error("Unexpected API response format:", response.data);
          setError("Dữ liệu sản phẩm không hợp lệ!");
        }
      } catch (err) {
        console.error("API Error:", err);
        setError("Không thể tải dữ liệu chi tiết sản phẩm!");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-10">Đang tải dữ liệu sản phẩm...</div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }



  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 pt-12 pb-20">
      {/* Breadcrumb */}
      <div className="bg-gray-100 rounded-lg p-3 mb-6 flex flex-wrap items-center justify-between min-h-[50px] text-sm">
        <div className="flex items-center">
          <span
            onClick={() => navigate("/home")}
            className="cursor-pointer hover:border-b hover:border-black transition-all duration-200"
          >
            Trang chủ
          </span>
          <span className="mx-2">/</span>
          <span
            onClick={() => navigate("/Product")}
            className="cursor-pointer hover:border-b hover:border-black transition-all duration-200"
          >
            Sản phẩm
          </span>
          <span className="mx-2">/</span>
          <span className="text-gray-500">Thông tin sản phẩm</span>
        </div>
      </div>

      {product && (
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Hình ảnh sản phẩm */}
          <div className="w-full md:w-1/2 flex justify-center">
            <img
              src={`http://localhost:3001/${product.image}`}
              alt={product.name}
              className="w-full max-w-[350px] md:max-w-[400px] h-auto rounded-lg shadow-md"
            />
          </div>

          {/* Thông tin sản phẩm */}
          <div className="w-full md:w-1/2">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">
              {product.name}
            </h1>
            <p className="text-xl font-semibold text-[#F14A00] mb-2">
              Giá: {product.price}đ/kg
            </p>
            {product.oldPrice > 0 && (
              <p className="text-gray-500 line-through mb-2">
                Giá gốc: {product.oldPrice}đ
              </p>
            )}
            <p className="text-gray-700 mb-2">
              <span className="font-bold">Thông tin:</span>{" "}
              {product.description}
            </p>
            <p className="text-gray-700 mb-2">
              <span className="font-bold">Xuất xứ:</span> {product.origin}
            </p>
            <p className="text-gray-700">
              <span className="font-bold">Số lượng tồn kho:</span>{" "}
              {product.quantity} kg
            </p>

            {/* Nút đặt hàng */}
            <button onClick={handleCreateOrder}
              className="flex items-center justify-center w-full md:w-auto bg-[#FFE814] text-[#F14A00] px-6 py-3 rounded-lg font-bold text-sm hover:bg-[#FBC02D] hover:scale-105 md:hover:scale-105 transition duration-300 mt-6">
              Tạo đơn đặt hàng
              <span className="ml-3 w-6 h-6 bg-[#F14A00] text-white rounded-full flex items-center justify-center hover:bg-[#D84315]">
                <i className="fa-solid fa-chevron-right text-xs"></i>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );  
};

export default ProductDetail;
