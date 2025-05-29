import React from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";

import mng_request_orders from "../../assets/Feature_order_suppliers/mng_request_orders.jpg";
import mng_supply_orders from "../../assets/Feature_order_suppliers/mng_supply_orders.jpg";
import mng_receipt_orders from "../../assets/Feature_order_suppliers/mng_receipt_orders.jpg";
import mng_dashboard_Purchasedorders from "../../assets/Feature_purchased_order/mng_dashboard_Purchasedorders.png";

const UserComponent = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 px-4 py-8 max-w-7xl mx-auto">
      {/* Title Section */}
      <div className="flex items-center text-2xl font-semibold text-gray-800 mb-2">
        <FaShoppingCart className="text-3xl text-blue-500 mr-2" />
        <h5 className="relative">
          Quản Lý Yêu Cầu Supplier
          <span className="absolute left-0 right-0 bottom-0 h-1 bg-blue-500 transform scale-x-0 transition-transform duration-300 origin-left hover:scale-x-100"></span>
        </h5>
      </div>

      {/* Feature Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full justify-items-center">
           {/* Dashboard */}
           <Card
          link="/system/admin/manage-Supplier-orders"
          title="Dashboard"
          description="Thông tin toàn yêu cầu supplier"
          image={mng_dashboard_Purchasedorders}
        />
        <Card
          link="/system/admin/manage-fuel-orders"
          title="D.sách yêu cầu thu nguyên liệu"
          description="Quản lý danh sách các yêu cầu thu nguyên liệu"
          image={mng_request_orders}
        />

        <Card
          link="/system/admin/manage-provide-orders"
          title="D.sách yêu cầu cung cấp nguyên liệu"
          description="Quản lý danh sách các yêu cầu cung cấp nguyên liệu"
          image={mng_supply_orders}
        />
{/* 
        <Card
          link="/system/admin/View-Order-Success"
          title="Tạo yêu cầu nhập kho"
          description="Quản lý danh sách hàng đã về kho và tạo yêu cầu nhập kho"
          image={mng_receipt_orders}
        /> */}
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
      {/* Background image */}
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
