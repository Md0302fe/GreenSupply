import React from "react";
import { Link } from "react-router-dom";
import { FaGear } from "react-icons/fa6";

import mng_created_production_processing from "../../assets/Feture_production_processing/mng_created_production_processing.jpg";
import mng_production_list from "../../assets/Feture_production_processing/mng_production_list.jpg";
import request_list from "../../assets/Feature_product_process/request_list.jpg";
import waiting_list from "../../assets/Feature_product_process/waiting_list.jpg";
import processing_list from "../../assets/Feature_product_process/processing_list.jpg";

const UserComponent = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 px-4 py-8 max-w-7xl mx-auto">
      {/* Title Section */}
      <div className="flex items-center text-2xl font-semibold text-gray-800 mb-2">
        <FaGear className="text-3xl text-blue-500 mr-2" />
        <h5 className="relative">
          Quản Lý Yêu Cầu Sản Xuất
          <span className="absolute left-0 right-0 bottom-0 h-1 bg-blue-500 transform scale-x-0 transition-transform duration-300 origin-left hover:scale-x-100"></span>
        </h5>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full justify-items-center">
        <Card
          link="/system/admin/production-request"
          title="Tạo yêu cầu sản xuất"
          description="Tạo mới yêu cầu sản xuất - Quy trình sản xuất"
          image={mng_production_list}
        />
        <Card
          link="/system/admin/production-request-list"
          title="D.sách các yêu cầu"
          description="Quản lý danh sách các yêu cầu"
          image={request_list}
        />
        <Card
          link="/system/admin/production-processing"
          title="Danh sách chờ sản xuất"
          description="Quản lý danh sách các đơn chờ sản xuất"
          image={waiting_list}
        />
        <Card
          link="/system/admin/production-processing-list"
          title="Danh sách quy trình đã tạo"
          description="Quản lý danh sách các quy trình đã tạo"
          image={processing_list}
        />
      </div>
    </div>
  );
};

const Card = ({ link, title, description, image }) => (
  <div className="relative w-full max-w-xs h-[240px] cursor-pointer rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300 overflow-hidden">
    <Link
      to={link}
      className="w-full h-full flex flex-col justify-center items-center text-white text-sm font-bold transition-all duration-300"
    >
      {/* Background */}
      <div
        className="absolute top-0 left-0 right-0 bottom-0 bg-contain bg-no-repeat bg-center rounded-xl"
        style={{
          backgroundImage: `url(${image})`,
          filter: "blur(2px)",
        }}
      ></div>

      {/* Overlay */}
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-60 rounded-xl"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4">
        <h6 className="text-lg font-semibold hover:border-b-2 hover:border-yellow-300">
          {title}
        </h6>
        <p className="text-sm text-white mt-1 hover:border-b-2 hover:border-yellow-300">
          {description}
        </p>
      </div>
    </Link>
  </div>
);

export default UserComponent;
