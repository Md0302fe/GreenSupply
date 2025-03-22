import React from "react";
import { Link } from "react-router-dom"; // Ensure react-router-dom is installed
import { FaUser } from "react-icons/fa"; // Import biểu tượng từ react-icons

import mng_dashboard_Purchasedorders from "../../assets/Feature_purchased_order/mng_dashboard_Purchasedorders.png";
import mng_mango from "../../assets/Feature_materials_category/mng_mango.png";
import mng_addnew_mango from "../../assets/Feature_materials_category/mng_addnew_mango.jpg";
import mng_mango_list from "../../assets/Feature_materials_category/mng_mango_list.jpg";


const UserComponent = () => {
  return (
    <div className="flex flex-col space-y-6 p-6">
      {/* Title Section */}
      <div className="flex items-center text-2xl font-semibold text-gray-800 mb-4">
        <img src={mng_mango} alt="" className="size-8 mr-2"/>
        {/* Biểu tượng người dùng */}
        <h5 className="relative">
          Quản Lý Nguyên Liệu
          <span className="absolute left-0 right-0 bottom-0 h-1 bg-blue-500 transform scale-x-0 transition-transform duration-300 origin-left hover:scale-x-100"></span>{" "}
          {/* Hiệu ứng gạch dưới */}
        </h5>
      </div>

      {/* Feature Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Card for Quản lý người dùng */}
        <div
                  className="relative cursor-pointer rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 transform overflow-hidden" // Thêm overflow-hidden
                  style={{ height: "200px", width: "300px" }}
                >
                  {/* Thẻ div cho ảnh nền */}
                  <Link
                    to={"/system/admin/manage-fuel"}
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
                        Thông tin Nguyên Liệu
                      </p>
                    </div>
                  </Link>
                </div>
        

        {/* Thêm padding cho khung bên ngoài */}
        <div
          className="relative cursor-pointer rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 transform overflow-hidden" // Thêm overflow-hidden
          style={{ height: "200px", width: "300px" }}
        >
          {/* Thẻ div cho ảnh nền */}
          <Link
            to={"/system/admin/feature_material_category"}
            className="mt-4 text-white hover:text-yellow-300 text-sm font-bold transition-all duration-300"
          >
            <div
              className="absolute top-0 left-0 right-0 bottom-0 bg-cover bg-center rounded-lg"
              style={{
                backgroundImage: `url(${mng_addnew_mango})`,
                filter: "blur(2px)", // Chỉ áp dụng mờ cho ảnh nền
              }}
            ></div>
            {/* Lớp phủ */}
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-60 rounded-lg transition-all duration-300"></div>
            {/* Nội dung văn bản */}
            <div className="relative flex flex-col justify-center items-center h-full">
              <h6 className="text-lg text-center font-semibold text-white shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
                Tạo nguyên liệu mới
              </h6>
              <p className="text-sm text-center text-white mt-1 shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
                Tạo thông tin cho nguyên liệu mới 
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
            to={"/system/admin/fuel-list"}
            className="mt-4 text-white hover:text-yellow-300 text-sm font-bold transition-all duration-300"
          >
            <div
              className="absolute top-0 left-0 right-0 bottom-0 bg-cover bg-center rounded-lg"
              style={{
                backgroundImage: `url(${mng_mango_list})`,
                filter: "blur(2px)", // Chỉ áp dụng mờ cho ảnh nền
              }}
            ></div>
            {/* Lớp phủ */}
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-60 rounded-lg transition-all duration-300"></div>
            {/* Nội dung văn bản */}
            <div className="relative flex flex-col justify-center items-center h-full p-4">
              {/* Thêm padding cho nội dung */}
              <h6 className="text-lg text-center font-semibold text-white shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
                Danh sách loại nguyên liệu
              </h6>
              <p className="text-sm text-center text-white mt-1 shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
                Quản lý danh sách các loại nguyên liệu
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserComponent;
