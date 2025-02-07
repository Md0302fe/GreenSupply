import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const StoreProducts = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/product/getAllProduct");
        // Chỉ lấy 4 sản phẩm đầu tiên
        setProducts(response.data.products.slice(0, 4));
      } catch (error) {
        console.error("Không thể tải danh sách sản phẩm!", error);
      }
    };

    fetchProducts();
  }, []);

  const handleClick = (id) => {
    navigate(`/product-detail/${id}`);
  };

  return (
    <div className="max-w-[1450px] mx-auto text-center bg-gray-100 py-10 border border-gray-300 shadow-inner mb-10">
      <div className="font-instrument">
        <h2 className="text-[#006838] text-xl font-semibold mb-2">Cửa hàng</h2>
        <h1 className="text-[#FF8B00] text-3xl font-bold mb-2">SẢN PHẨM</h1>

        {/* Danh sách sản phẩm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product._id} className="cursor-pointer hover:scale-105 transition-transform duration-300 p-4">
              <div onClick={() => handleClick(product._id)} className="overflow-hidden flex justify-center items-center shadow-right-bottom border-4 border-white">
                <img src={product.image} alt={product.name} className="w-auto h-auto" />
              </div>
              <div className="mt-3">
                <h3 className="text-lg font-bold text-gray-800">{product.name}</h3>
                <p className="text-[#F14A00] text-lg font-semibold mt-1">{product.price}đ</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-6">
          <button onClick={() => navigate("/Product")} className="bg-[#FFE814] text-[#F14A00] px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#FBC02D] hover:scale-105 transition duration-300">
            Xem thêm
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreProducts;
