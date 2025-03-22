import React from "react";
import { Link } from "react-router-dom"; // Ensure react-router-dom is installed
import { FaUser } from "react-icons/fa"; // Import biểu tượng từ react-icons

import mng_dashboard_Purchasedorders from "../../assets/Feature_purchased_order/mng_dashboard_Purchasedorders.png";
import mng_created_purchased_orders from "../../assets/Feature_purchased_order/mng_created_purchased_orders.png";
import mng_purchased_orders from "../../assets/Feature_purchased_order/mng_purchased_orders.png";
import mng_finish_orders from "../../assets/Feature_purchased_order/mng_finish_orders.png";

import { FaClipboard } from "react-icons/fa6";


const UserComponent = () => {
  return (
    <div className="flex flex-col space-y-6 p-6">
      {/* Title Section */}
      <div className="flex items-center text-2xl font-semibold text-gray-800 mb-4">
        <FaClipboard className="text-3xl text-blue-500 mr-2" />{" "}
        {/* Biểu tượng người dùng */}
        <h5 className="relative">
          Quản Lý Yêu Cầu Nhập Nguyên Liệu
          <span className="absolute left-0 right-0 bottom-0 h-1 bg-blue-500 transform scale-x-0 transition-transform duration-300 origin-left hover:scale-x-100"></span>{" "}
          {/* Hiệu ứng gạch dưới */}
        </h5>
      </div>

      {/* Feature Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Dashboard */}
        <div
          className="relative cursor-pointer rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 transform overflow-hidden" // Thêm overflow-hidden
          style={{ height: "200px", width: "300px" }}
        >
          {/* Thẻ div cho ảnh nền */}
          <Link
            to={"/system/admin/manage-Supplier-orders"}
            className="mt-4 text-white hover:text-yellow-300 text-sm font-bold transition-all duration-300"
          >
            <div
              className="absolute top-0 left-0 right-0 bottom-0 bg-cover bg-center rounded-lg "
              style={{
                backgroundImage: `url(${mng_dashboard_Purchasedorders})`,
                filter: "blur(2px)", // Chỉ áp dụng mờ cho ảnh nền
              }}
            ></div>
            {/* Lớp phủ */}
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-60 rounded-lg transition-all duration-300"></div>
            {/* Nội dung văn bản */}
            <div className="relative flex flex-col justify-center items-center h-full">
              <h6 className="text-lg text-center font-semibold text-white shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
                Dashboard
              </h6>
              <p className="text-sm text-center text-white mt-1 shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
                Thông tin toàn bộ khâu
              </p>
            </div>
          </Link>
        </div>

        {/* Tạo Yêu Cầu */}
        <div
          className="relative cursor-pointer rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 transform overflow-hidden" // Thêm overflow-hidden
          style={{ height: "200px", width: "300px" }}
        >
          {/* Thẻ div cho ảnh nền */}
          <Link
            to={"/system/admin/C_purchase-order"}
            className="mt-4 text-white hover:text-yellow-300 text-sm font-bold transition-all duration-300"
          >
            <div
              className="absolute top-0 left-0 right-0 bottom-0 bg-cover bg-center rounded-lg "
              style={{
                backgroundImage: `url(${mng_created_purchased_orders})`,
                filter: "blur(2px)", // Chỉ áp dụng mờ cho ảnh nền
              }}
            ></div>
            {/* Lớp phủ */}
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-60 rounded-lg transition-all duration-300"></div>
            {/* Nội dung văn bản */}
            <div className="relative flex flex-col justify-center items-center h-full">
              <h6 className="text-lg text-center font-semibold text-white shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
                Tạo yêu cầu
              </h6>
              <p className="text-sm text-center text-white mt-1 shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
                Tạo yêu cầu nhập nguyên liệu
              </p>
            </div>
          </Link>
        </div>

        {/* Quản lý yêu cầu đã tạo */}
        <div
          className="relative rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 transform overflow-hidden" // Thêm overflow-hidden
          style={{ height: "200px", width: "300px" }}
        >
          {/* Thẻ div cho ảnh nền */}
          <Link
            to={"/system/admin/R_purchase-orders"}
            className="mt-4 text-white hover:text-yellow-300 text-sm font-bold transition-all duration-300"
          >
            <div
              className="absolute top-0 left-0 right-0 bottom-0 bg-cover bg-center rounded-lg "
              style={{
                backgroundImage: `url(${mng_purchased_orders})`,
                filter: "blur(2px)", // Chỉ áp dụng mờ cho ảnh nền
              }}
            ></div>
            {/* Lớp phủ */}
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-60 rounded-lg transition-all duration-300"></div>
            {/* Nội dung văn bản */}
            <div className="relative flex flex-col justify-center items-center h-full p-4">
              {/* Thêm padding cho nội dung */}
              <h6 className="text-lg text-center font-semibold text-white shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
                Quản lý yêu cầu
              </h6>
              <p className="text-sm text-center text-white mt-1 shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
                Quản lý thông tin, các yêu cầu đã tạo
              </p>
            </div>
          </Link>
        </div>

        {/* Các yêu cầu đã hoàn thành */}
        <div
          className="relative cursor-pointer rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 transform overflow-hidden" // Thêm overflow-hidden
          style={{ height: "200px", width: "300px" }}
        >
          {/* Thẻ div cho ảnh nền */}
          <Link
            to={"/system/admin/feature_purchase_orders"}
            className="mt-4 text-white hover:text-yellow-300 text-sm font-bold transition-all duration-300"
          >
            <div
              className="absolute top-0 left-0 right-0 bottom-0 bg-cover bg-center rounded-lg "
              style={{
                backgroundImage: `url(${mng_finish_orders})`,
                filter: "blur(2px)", // Chỉ áp dụng mờ cho ảnh nền
              }}
            ></div>
            {/* Lớp phủ */}
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-60 rounded-lg transition-all duration-300"></div>
            {/* Nội dung văn bản */}
            <div className="relative flex flex-col justify-center items-center h-full">
              <h6 className="text-lg text-center font-semibold text-white shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
                Hoàn thành
              </h6>
              <p className="text-sm text-center text-white mt-1 shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
                Các yêu cầu đã hoàn thành
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserComponent;
