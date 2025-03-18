import React from "react";
import { Link } from "react-router-dom"; // Ensure react-router-dom is installed

import mng_created_production_processing from "../../assets/Feture_production_processing/mng_created_production_processing.jpg";
import mng_production_list from "../../assets/Feture_production_processing/mng_production_list.jpg";

import { FaGear } from "react-icons/fa6";

const UserComponent = () => {
  return (
    <div className="flex flex-col space-y-6 p-6">
      {/* Title Section */}
      <div className="flex items-center text-2xl font-semibold text-gray-800 mb-4">
        <FaGear className="text-3xl text-blue-500 mr-2" />{" "}
        {/* Biểu tượng người dùng */}
        <h5 className="relative">
          Quản Lý Yêu Cầu Sản Xuất
          <span className="absolute left-0 right-0 bottom-0 h-1 bg-blue-500 transform scale-x-0 transition-transform duration-300 origin-left hover:scale-x-100"></span>{" "}
          {/* Hiệu ứng gạch dưới */}
        </h5>
      </div>

      {/* Feature Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Card for Quản lý người dùng */}

        {/* Thêm padding cho khung bên ngoài */}
        <div
          className="relative cursor-pointer rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 transform overflow-hidden" // Thêm overflow-hidden
          style={{ height: "200px", width: "300px" }}
        >
          {/* Thẻ div cho ảnh nền */}
          <Link
            to={"/system/admin/production-request"}
            className="mt-4 text-white hover:text-yellow-300 text-sm font-bold transition-all duration-300"
          >
            <div
              className="absolute top-0 left-0 right-0 bottom-0 bg-cover bg-center rounded-lg"
              style={{
                backgroundImage: `url(${mng_production_list})`,
                filter: "blur(2px)", // Chỉ áp dụng mờ cho ảnh nền
              }}
            ></div>
            {/* Lớp phủ */}
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-60 rounded-lg transition-all duration-300"></div>
            {/* Nội dung văn bản */}
            <div className="relative flex flex-col justify-center items-center h-full">
              <h6 className="text-lg text-center font-semibold text-white shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
                Tạo yêu cầu sản xuất
              </h6>
              <p className="text-sm text-center text-white mt-1 shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
                Tạo mới yêu cầu sản xuất - Quy trình sản xuất
              </p>
            </div>
          </Link>
        </div>

        {/* Card for Quản lý tài khoản */}
        <div
          className="relative rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 transform overflow-hidden" // Thêm overflow-hidden
          style={{ height: "200px", width: "300px" }}
        >
          {/* Thẻ div cho ảnh nền */}
          <Link
            to={"/system/admin/production-request-list"}
            className="mt-4 text-white hover:text-yellow-300 text-sm font-bold transition-all duration-300"
          >
            <div
              className="absolute top-0 left-0 right-0 bottom-0 bg-cover bg-center rounded-lg"
              style={{
                backgroundImage: `url(${mng_created_production_processing})`,
                filter: "blur(2px)", // Chỉ áp dụng mờ cho ảnh nền
              }}
            ></div>
            {/* Lớp phủ */}
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-60 rounded-lg transition-all duration-300"></div>
            {/* Nội dung văn bản */}
            <div className="relative flex flex-col justify-center items-center h-full p-4">
              {/* Thêm padding cho nội dung */}
              <h6 className="text-lg text-center font-semibold text-white shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
                D.sách các yêu cầu
              </h6>
              <p className="text-sm text-center text-white mt-1 shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
                Quản lý danh sách các yêu cầu
              </p>
            </div>
          </Link>
        </div>
        {/* Card for Quản lý tài khoản */}
        <div
          className="relative rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 transform overflow-hidden" // Thêm overflow-hidden
          style={{ height: "200px", width: "300px" }}
        >
          {/* Thẻ div cho ảnh nền */}
          <Link
            to={"/system/admin/production-processing"}
            className="mt-4 text-white hover:text-yellow-300 text-sm font-bold transition-all duration-300"
          >
            <div
              className="absolute top-0 left-0 right-0 bottom-0 bg-cover bg-center rounded-lg"
              style={{
                backgroundImage: `url(${mng_created_production_processing})`,
                filter: "blur(2px)", // Chỉ áp dụng mờ cho ảnh nền
              }}
            ></div>
            {/* Lớp phủ */}
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-60 rounded-lg transition-all duration-300"></div>
            {/* Nội dung văn bản */}
            <div className="relative flex flex-col justify-center items-center h-full p-4">
              {/* Thêm padding cho nội dung */}
              <h6 className="text-lg text-center font-semibold text-white shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
                Danh sách chờ sản xuất
              </h6>
              <p className="text-sm text-center text-white mt-1 shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
                Quản lý danh sách các đơn chờ sản xuất
              </p>
            </div>
          </Link>
        </div>
        {/* Card for Quản lý quy trình đã tạo */}
        <div
          className="relative rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 transform overflow-hidden" // Thêm overflow-hidden
          style={{ height: "200px", width: "300px" }}
        >
          {/* Thẻ div cho ảnh nền */}
          <Link
            to={"/system/admin/production-processing-list"}
            className="mt-4 text-white hover:text-yellow-300 text-sm font-bold transition-all duration-300"
          >
            <div
              className="absolute top-0 left-0 right-0 bottom-0 bg-cover bg-center rounded-lg"
              style={{
                backgroundImage: `url(${mng_created_production_processing})`,
                filter: "blur(2px)", // Chỉ áp dụng mờ cho ảnh nền
              }}
            ></div>
            {/* Lớp phủ */}
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-60 rounded-lg transition-all duration-300"></div>
            {/* Nội dung văn bản */}
            <div className="relative flex flex-col justify-center items-center h-full p-4">
              {/* Thêm padding cho nội dung */}
              <h6 className="text-lg text-center font-semibold text-white shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
                Danh sách quy trình đã tạo
              </h6>
              <p className="text-sm text-center text-white mt-1 shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
                Quản lý danh sách các quy trình đã tạo
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserComponent;
