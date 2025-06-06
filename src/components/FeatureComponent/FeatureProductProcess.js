import React from "react";
import { Link } from "react-router-dom";
import { FaGear } from "react-icons/fa6";

import request_list from "../../assets/Feature_product_process/request_list.jpg";
import processing_list from "../../assets/Feature_product_process/processing_list.jpg";
import gear_loading from "../../assets/Feture_production_processing/gearLoading.jpg";
import { useTranslation } from "react-i18next";

import "./ProductProcess.css";
import mng_dashboard_Purchasedorders from "../../assets/Feature_purchased_order/mng_dashboard_Purchasedorders.png";

import single_process from "../../assets/Feature_product_process/Normal_Process.jpg";
import history_process from "../../assets/Feature_product_process/History_process.jpg";
import wating_create_process_list from "../../assets/Feature_product_process/wating_create_process_list.jpg";
import created_process_list from "../../assets/Feature_product_process/created_process_list-removebg.png";

const UserComponent = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center space-y-8 px-4 py-8 max-w-7xl mx-auto">
      {/* Title Section */}
      <div className="flex items-center text-2xl font-semibold text-gray-800 mb-2">
        <FaGear className="text-3xl text-blue-500 mr-2" />
        <h5 className="relative">
          {t("production.title")}
          <span className="absolute left-0 right-0 bottom-0 h-1 bg-blue-500 transform scale-x-0 transition-transform duration-300 origin-left hover:scale-x-100"></span>
        </h5>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full justify-items-center">
        <Card
          link="/system/admin/dashboard-production-request"
          title={t("production.dashboard.title")}
          description={t("production.dashboard.description")}
          image={mng_dashboard_Purchasedorders}
        />
        <Card
          link="/system/admin/production-request"
          title={t("production.create.title")}
          description={t("production.create.description")}
          image={single_process}
        />
        <Card
          link="/system/admin/production-request-list"
          title={t("production.requestList.title")}
          description={t("production.requestList.description")}
          image={request_list}
        />
        <Card
          link="/system/admin/production-processing"
          title={t("production.waitingList.title")}
          description={t("production.waitingList.description")}
          image={wating_create_process_list}
        />
        <Card
          link="/system/admin/production-processing-list"
          title={t("production.createdProcesses.title")}
          description={t("production.createdProcesses.description")}
          image={created_process_list}
        />
        <Card
          link="/system/admin/processing-system"
          title={t("production.executing.title")}
          description={t("production.executing.description")}
          image={processing_list}
          is1={true}
        />
        <Card
          link="/system/admin/process-histories"
          title={t("production.history.title")}
          description={t("production.history.description")}
          image={history_process}
        />
      </div>
    </div>
  );
};

const Card = ({ link, title, description, image, is1 = false }) => (
  <div className="relative w-full max-w-xs h-[240px] cursor-pointer rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300 overflow-hidden">
    <Link
      to={link}
      className="w-full h-full flex flex-col justify-center items-center text-white text-sm font-bold transition-all duration-300"
    >
      {/* Background */}

      {is1 ? (
        <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center">
          <div className="animate-spin">
            <img
              src={gear_loading} // Thay thế bằng đường dẫn đến hình ảnh bánh răng của bạn
              alt="Gear Animation"
              className="w-24 h-24" // Kích thước của bánh răng
            />
          </div>
        </div>
      ) : (
        <div
          className="absolute top-0 left-0 right-0 bottom-0 bg-contain bg-no-repeat bg-center rounded-xl"
          style={{
            backgroundImage: `url(${image})`,
            filter: "blur(2px)",
          }}
        ></div>
      )}

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
