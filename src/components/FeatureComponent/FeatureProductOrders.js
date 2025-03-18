import React from "react";
import { Link } from "react-router-dom"; // Ensure react-router-dom is installed
import { FaUser } from "react-icons/fa"; // Import biểu tượng từ react-icons

import mng_request_orders from "../../assets/Feature_order_suppliers/mng_request_orders.jpg";
import mng_supply_orders from "../../assets/Feature_order_suppliers/mng_supply_orders.jpg";
import mng_receipt_orders from "../../assets/Feature_order_suppliers/mng_receipt_orders.jpg";

import { FaShoppingCart } from "react-icons/fa";


const UserComponent = () => {
  return (
    <div className="flex flex-col space-y-6 p-6">
      {/* Title Section */}
      <div className="flex items-center text-2xl font-semibold text-gray-800 mb-4">
        <FaShoppingCart className="text-3xl text-blue-500 mr-2" />{" "}
        {/* Biểu tượng người dùng */}
        <h5 className="relative">
          Quản Lý Yêu Cầu Khách Hàng
          <span className="absolute left-0 right-0 bottom-0 h-1 bg-blue-500 transform scale-x-0 transition-transform duration-300 origin-left hover:scale-x-100"></span>{" "}
          {/* Hiệu ứng gạch dưới */}
        </h5>
      </div>

      {/* Feature Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">


        

        {/* Danh sách yêu cầu cung cấp nguyên liệu */}
        <div
          className="relative rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 transform overflow-hidden" // Thêm overflow-hidden
          style={{ height: "200px", width: "300px" }}
        >
          {/* Thẻ div cho ảnh nền */}
          <Link
            to={"/system/admin/manage-product-orders"}
            className="mt-4 text-white hover:text-yellow-300 text-sm font-bold transition-all duration-300"
          >
            <div
              className="absolute top-0 left-0 right-0 bottom-0 bg-cover bg-center rounded-lg"
              style={{
                backgroundImage: `url(${mng_supply_orders})`,
                filter: "blur(2px)", // Chỉ áp dụng mờ cho ảnh nền
              }}
            ></div>
            {/* Lớp phủ */}
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-60 rounded-lg transition-all duration-300"></div>
            {/* Nội dung văn bản */}
            <div className="relative flex flex-col justify-center items-center h-full p-4">
              {/* Thêm padding cho nội dung */}
              <h6 className="text-lg text-center font-semibold text-white shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
              D.sách đơn đặt hàng sản phẩm
              </h6>
              <p className="text-sm text-center text-white mt-1 shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
              Quản lý danh sách đơn đặt hàng sản phẩm
              </p>
            </div>
          </Link>
        </div>

        
      </div>
    </div>
  );
};

export default UserComponent;
