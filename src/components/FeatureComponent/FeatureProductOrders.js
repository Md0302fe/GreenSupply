import React from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import { useTranslation } from "react-i18next";

import mng_supply_orders from "../../assets/Feature_order_suppliers/mng_supply_orders.jpg";

const UserComponent = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col space-y-6 p-6">
      {/* Title Section */}
      <div className="flex items-center text-2xl font-semibold text-gray-800 mb-4">
        <FaShoppingCart className="text-3xl text-blue-500 mr-2" />
        <h5 className="relative">
          {t("customerOrders.title")}
          <span className="absolute left-0 right-0 bottom-0 h-1 bg-blue-500 transform scale-x-0 transition-transform duration-300 origin-left hover:scale-x-100"></span>
        </h5>
      </div>

      {/* Feature Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Product Orders List */}
        <div
          className="relative rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 transform overflow-hidden"
          style={{ height: "200px", width: "300px" }}
        >
          <Link
            to={"/system/admin/manage-product-orders"}
            className="mt-4 text-white hover:text-yellow-300 text-sm font-bold transition-all duration-300"
          >
            {/* Background image */}
            <div
              className="absolute top-0 left-0 right-0 bottom-0 bg-cover bg-center rounded-lg"
              style={{
                backgroundImage: `url(${mng_supply_orders})`,
                filter: "blur(2px)",
              }}
            ></div>

            {/* Overlay */}
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-black opacity-60 rounded-lg transition-all duration-300"></div>

            {/* Text Content */}
            <div className="relative flex flex-col justify-center items-center h-full p-4">
              <h6 className="text-lg text-center font-semibold text-white shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
                {t("customerOrders.productOrderList.title")}
              </h6>
              <p className="text-sm text-center text-white mt-1 shadow-md transition-all duration-300 hover:border-b-2 hover:border-yellow-300">
                {t("customerOrders.productOrderList.description")}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserComponent;
