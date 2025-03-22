import React from "react";
import { Link } from "react-router-dom"; // Ensure react-router-dom is installed
import { FaUser } from "react-icons/fa"; // Import biểu tượng từ react-icons

import mng_warehouse_dashboard from "../../assets/Feature_warehouse/mng_warehouse_dashboard.jpg";
import mng_receipt_list from "../../assets/Feature_warehouse/mng_receipt_list.jpg";
import mng_raw_materials from "../../assets/Feature_warehouse/mng_raw_materials.jpg";
import mng_created_storage_export from "../../assets/Feature_warehouse/mng_created_storage_export.jpg";
import mng_mng_storare_export from "../../assets/Feature_warehouse/mng_storare_export.jpg";
import mng_accmng_storage_export_historyount from "../../assets/Feature_warehouse/mng_storage_export_history.jpg";

import { FaHockeyPuck } from "react-icons/fa";


const UserComponent = () => {
  return (
    <div className="flex flex-col space-y-6 p-6">
      {/* Title Section */}
      <div className="flex items-center text-2xl font-semibold text-gray-800 mb-4">
        <FaHockeyPuck className="text-3xl text-blue-500 mr-2" />{" "}
        {/* Biểu tượng người dùng */}
        <h5 className="relative">
          Quản Lý Kho
          <span className="absolute left-0 right-0 bottom-0 h-1 bg-blue-500 transform scale-x-0 transition-transform duration-300 origin-left hover:scale-x-100"></span>{" "}
          {/* Hiệu ứng gạch dưới */}
        </h5>
      </div>

      {/* Feature Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Quản lý dashboard của kho */}
        <div
          className="relative cursor-pointer rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 transform overflow-hidden" // Thêm overflow-hidden
          style={{ height: "200px", width: "300px" }}
        >
          {/* Thẻ div cho ảnh nền */}
          <Link
            to={"/system/admin/manage-warehouse"}
            className="mt-4 text-white hover:text-yellow-300 text-sm font-bold transition-all duration-300"
          >
            <div
              className="absolute top-0 left-0 right-0 bottom-0 bg-cover bg-center rounded-lg"
              style={{
                backgroundImage: `url(${mng_warehouse_dashboard})`,
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
                Quản lý thông tin tổng quát kho
              </p>
            </div>
          </Link>
        </div>

        {/* Quản lý danh sách đơn nhập kho */}
        <div
          className="relative rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 transform overflow-hidden" // Thêm overflow-hidden
          style={{ height: "200px", width: "300px" }}
        >
          {/* Thẻ div cho ảnh nền */}
          <Link
            to={"/system/admin/warehouse-receipt"}
            className="mt-4 text-white hover:text-yellow-300 text-sm font-bold transition-all duration-300"
          >
            <div
              className="absolute top-0 left-0 right-0 bottom-0 bg-cover bg-center rounded-lg"
              style={{
                backgroundImage: `url(${mng_receipt_list})`,
                filter: "blur(2px)", // Chỉ áp dụng mờ cho ảnh nền
              }}
            ></div>
            {/* Lớp phủ */}
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-60 rounded-lg transition-all duration-300"></div>
            {/* Nội dung văn bản */}
            <div className="relative flex flex-col justify-center items-center h-full p-4">
              {/* Thêm padding cho nội dung */}
              <h6 className="text-lg text-center font-semibold text-white shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
                D.sách đơn nhập kho
              </h6>
              <p className="text-sm text-center text-white mt-1 shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
                Quản lý danh sách các yêu cầu (chờ) nhập kho
              </p>
            </div>
          </Link>
        </div>

        <div
          className="relative cursor-pointer rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 transform overflow-hidden" // Thêm overflow-hidden
          style={{ height: "200px", width: "300px" }}
        >
          {/* Thẻ div cho ảnh nền */}
          <Link
            to={"/system/admin/raw-material-batch-list"}
            className="mt-4 text-white hover:text-yellow-300 text-sm font-bold transition-all duration-300"
          >
            <div
              className="absolute top-0 left-0 right-0 bottom-0 bg-cover bg-center rounded-lg"
              style={{
                backgroundImage: `url(${mng_raw_materials})`,
                filter: "blur(2px)", // Chỉ áp dụng mờ cho ảnh nền
              }}
            ></div>
            {/* Lớp phủ */}
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-60 rounded-lg transition-all duration-300"></div>
            {/* Nội dung văn bản */}
            <div className="relative flex flex-col justify-center items-center h-full">
              <h6 className="text-lg text-center font-semibold text-white shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
                Lô nguyên liệu
              </h6>
              <p className="text-sm text-center text-white mt-1 shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
                Quản lý thông tin các lô nguyên liệu thô
              </p>
            </div>
          </Link>
        </div>
        
        {/* Tạo đơn xuất kho */}
        <div
          className="relative cursor-pointer rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 transform overflow-hidden" // Thêm overflow-hidden
          style={{ height: "200px", width: "300px" }}
        >
          {/* Thẻ div cho ảnh nền */}
          <Link
            to={"/system/admin/material-storage-export"}
            className="mt-4 text-white hover:text-yellow-300 text-sm font-bold transition-all duration-300"
          >
            <div
              className="absolute top-0 left-0 right-0 bottom-0 bg-cover bg-center rounded-lg"
              style={{
                backgroundImage: `url(${mng_created_storage_export})`,
                filter: "blur(2px)", // Chỉ áp dụng mờ cho ảnh nền
              }}
            ></div>
            {/* Lớp phủ */}
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-60 rounded-lg transition-all duration-300"></div>
            {/* Nội dung văn bản */}
            <div className="relative flex flex-col justify-center items-center h-full">
              <h6 className="text-lg text-center font-semibold text-white shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
                Tạo đơn xuất kho
              </h6>
              <p className="text-sm text-center text-white mt-1 shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
                Quản lý danh sách các đơn (chờ) xuất kho
              </p>
            </div>
          </Link>
        </div>
        {/* Danh sách đơn xuất kho */}
        <div
          className="relative cursor-pointer rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 transform overflow-hidden" // Thêm overflow-hidden
          style={{ height: "200px", width: "300px" }}
        >
          {/* Thẻ div cho ảnh nền */}
          <Link
            to={"/system/admin/material-storage-export-list"}
            className="mt-4 text-white hover:text-yellow-300 text-sm font-bold transition-all duration-300"
          >
            <div
              className="absolute top-0 left-0 right-0 bottom-0 bg-cover bg-center rounded-lg"
              style={{
                backgroundImage: `url(${mng_mng_storare_export})`,
                filter: "blur(2px)", // Chỉ áp dụng mờ cho ảnh nền
              }}
            ></div>
            {/* Lớp phủ */}
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-60 rounded-lg transition-all duration-300"></div>
            {/* Nội dung văn bản */}
            <div className="relative flex flex-col justify-center items-center h-full">
              <h6 className="text-lg text-center font-semibold text-white shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
                Danh sách đơn xuất kho
              </h6>
              <p className="text-sm text-center text-white mt-1 shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
                Quản lý danh sách đơn xuất kho
              </p>
            </div>
          </Link>
        </div>

        <div
          className="relative cursor-pointer rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 transform overflow-hidden" // Thêm overflow-hidden
          style={{ height: "200px", width: "300px" }}
        >
          {/* Thẻ div cho ảnh nền */}
          <Link
            to={"/system/admin/batch-history"}
            className="mt-4 text-white hover:text-yellow-300 text-sm font-bold transition-all duration-300"
          >
            <div
              className="absolute top-0 left-0 right-0 bottom-0 bg-cover bg-center rounded-lg"
              style={{
                backgroundImage: `url(${mng_accmng_storage_export_historyount})`,
                filter: "blur(2px)", // Chỉ áp dụng mờ cho ảnh nền
              }}
            ></div>
            {/* Lớp phủ */}
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-60 rounded-lg transition-all duration-300"></div>
            {/* Nội dung văn bản */}
            <div className="relative flex flex-col justify-center items-center h-full">
              <h6 className="text-lg text-center font-semibold text-white shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
                Lịch sử đơn xuất kho
              </h6>
              <p className="text-sm text-center text-white mt-1 shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
                Quản lý lịch sử đơn xuất kho
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserComponent;
