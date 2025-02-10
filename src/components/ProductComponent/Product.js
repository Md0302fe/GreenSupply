import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import _ from "lodash";

const Product = () => {
  const [products, setProducts] = useState([]); // Danh sách sản phẩm từ API
  const [filteredProducts, setFilteredProducts] = useState([]); // Kết quả tìm kiếm tức thời
  const [searchTerm, setSearchTerm] = useState(""); // Từ khóa tìm kiếm
  const [loading, setLoading] = useState(false); // Trạng thái đang tải
  const [error, setError] = useState(null); // Trạng thái lỗi
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Hàm gọi API
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:3001/api/product/getAllProduct"
      );
      setProducts(response.data.products);
      setFilteredProducts(response.data.products); // Gán toàn bộ sản phẩm vào danh sách lọc
      setLoading(false);
    } catch (err) {
      setError("Không thể tải dữ liệu sản phẩm!");
      setLoading(false);
    }
  }, []);

  // Hàm lọc sản phẩm tức thời
  const filterProducts = (query) => {
    const lowerCaseQuery = query.toLowerCase();
    const matchedProducts = products.filter((product) =>
      product.name.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredProducts(matchedProducts);
  };

  // Debounced Search
  const debouncedSearch = useCallback(
    _.debounce((query) => {
      filterProducts(query);
    }, 50),
    [products]
  );

  // Xử lý khi người dùng nhập
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Lấy danh sách sản phẩm khi trang được load lần đầu
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Đảm bảo focus lại ô nhập liệu
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchTerm]);

  // Hàm xử lý khi nhấp vào hình ảnh sản phẩm
  const handleProductClick = (productId) => {
    navigate(`/product-detail/${productId}`); // Điều hướng đến trang chi tiết sản phẩm
  };

  if (loading) {
    return <div className="text-center py-10">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-[1450px] mx-auto text-center bg-gray-100 py-10 border border-gray-300 shadow-inner mb-6 mt-6">
      <div className="font-instrument">
        {/* Breadcrumb */}
        <div className="bg-light rounded-3 p-3 mb-4 flex flex-row w-full justify-between items-center min-h-[60px]">
          <div className="flex flex-row items-center">
            <span
              onClick={() => navigate("/home")}
              className="cursor-pointer hover:border-b hover:border-black transition-all duration-200"
            >
              Trang chủ
            </span>
            <span className="mx-2">/</span>
            <span className="text-gray-500">Sản phẩm</span>
          </div>
        </div>

        {/* Tiêu đề */}
        <h2 className="text-[#006838] text-xl font-semibold mb-2">Cửa hàng</h2>
        <h1 className="text-[#FF8B00] text-3xl font-bold mb-2">SẢN PHẨM</h1>

        {/* Thanh tìm kiếm */}
        <div className="mb-4">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Tìm kiếm sản phẩm..."
            className="border rounded-lg px-4 py-2 w-1/2"
          />
        </div>

        {/* Danh sách sản phẩm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product._id}
                className="cursor-pointer hover:scale-105 transition-transform duration-300 p-4"
              >
                <div
                  className="overflow-hidden flex justify-center items-center shadow-right-bottom border-4 border-white"
                  onClick={() => handleProductClick(product._id)} // Bắt sự kiện click
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-auto h-auto"
                  />
                </div>
                <div className="mt-3">
                  <h3 className="text-lg font-bold text-gray-800">
                    {product.name}
                  </h3>
                  <div className="flex flex-col items-center">
                    <p className="text-[#F14A00] text-lg font-semibold mt-1">
                      {product.price}đ
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Không tìm thấy sản phẩm nào</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Product;
