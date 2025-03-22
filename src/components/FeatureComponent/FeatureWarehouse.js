import React from "react";
import { Link } from "react-router-dom";
import { FaHockeyPuck } from "react-icons/fa";

import mng_warehouse_dashboard from "../../assets/Feature_warehouse/mng_warehouse_dashboard.jpg";
import mng_receipt_list from "../../assets/Feature_warehouse/mng_receipt_list.jpg";
import mng_raw_materials from "../../assets/Feature_warehouse/mng_raw_materials.jpg";
import mng_created_storage_export from "../../assets/Feature_warehouse/mng_created_storage_export.jpg";
import mng_mng_storare_export from "../../assets/Feature_warehouse/mng_storare_export.jpg";
import mng_storage_export_history from "../../assets/Feature_warehouse/mng_storage_export_history.jpg";

const UserComponent = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 px-4 py-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex items-center text-2xl font-semibold text-gray-800 mb-2">
        <FaHockeyPuck className="text-3xl text-blue-500 mr-2" />
        <h5 className="relative">
          Quản Lý Kho
          <span className="absolute left-0 right-0 bottom-0 h-1 bg-blue-500 transform scale-x-0 transition-transform duration-300 origin-left hover:scale-x-100"></span>
        </h5>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full justify-items-center">
        <Card
          link="/system/admin/manage-warehouse"
          title="Dashboard"
          description="Quản lý thông tin tổng quát kho"
          image={mng_warehouse_dashboard}
        />
        <Card
          link="/system/admin/warehouse-receipt"
          title="D.sách đơn nhập kho"
          description="Quản lý danh sách các yêu cầu (chờ) nhập kho"
          image={mng_receipt_list}
        />
        <Card
          link="/system/admin/raw-material-batch-list"
          title="Nguyên liệu thô"
          description="Quản lý thông tin các lô nguyên liệu thô"
          image={mng_raw_materials}
        />
        <Card
          link="/system/admin/material-storage-export"
          title="Tạo đơn xuất kho"
          description="Quản lý danh sách các đơn (chờ) xuất kho"
          image={mng_created_storage_export}
        />
        <Card
          link="/system/admin/material-storage-export-list"
          title="Danh sách đơn xuất kho"
          description="Quản lý danh sách đơn xuất kho"
          image={mng_mng_storare_export}
        />
        <Card
          link="/system/admin/batch-history"
          title="Lịch sử đơn xuất kho"
          description="Quản lý lịch sử đơn xuất kho"
          image={mng_storage_export_history}
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
      {/* Background Image */}
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
