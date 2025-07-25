import React from "react";
import { Link } from "react-router-dom";
import { CubeIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

import mng_dashboard_Purchasedorders from "../../assets/Feature_purchased_order/mng_dashboard_Purchasedorders.png";
import mng_mango from "../../assets/Feature_materials_category/mng_mango.png";
import mng_addnew_mango from "../../assets/Feature_materials_category/mng_addnew_mango.jpg";
import mng_mango_list from "../../assets/Feature_materials_category/RawMaterialMangoList.jpg";
import mngo_mango_VatLieu from "../../assets/Feature_materials_category/mngo_LoaiVatLieu.jpg";
import mngo_mango_NguyenVatLieu from "../../assets/Feature_materials_category/mngo_NguyenVatLieu.jpg";

const UserComponent = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center space-y-8 px-4 py-8 max-w-7xl mx-auto">
      {/* Title Section */}
      <div className="flex items-center text-2xl font-semibold text-gray-800 mb-2">
        <CubeIcon className="w-8 h-8 mr-2 text-blue-500" />
        <h5 className="relative">
          {t("material.title")}
          <span className="absolute left-0 right-0 bottom-0 h-1 bg-blue-500 transform scale-x-0 transition-transform duration-300 origin-left hover:scale-x-100"></span>
        </h5>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full justify-items-center">
        <Card
          link="/system/admin/manage-fuel"
          title={t("material.dashboard.title")}
          description={t("material.dashboard.description")}
          image={mng_dashboard_Purchasedorders}
        />
        <Card
          link="/system/admin/fuel-Create"
          title={t("material.create.title")}
          description={t("material.create.description")}
          image={mng_addnew_mango}
        />
        <Card
          link="/system/admin/fuel-list"
          title={t("material.list.title")}
          description={t("material.list.description")}
          image={mng_mango_list}
        />
        <Card
          link="/system/admin/box-list"
          title={t("material.manage.title")}
          description={t("material.manage.description")}
          image={mngo_mango_NguyenVatLieu}
        />
        <Card
          link="/system/admin/box-categories/list"
          title={t("material.type.title")}
          description={t("material.type.description")}
          image={mngo_mango_VatLieu}
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
        className="absolute top-0 left-0 right-0 bottom-0 bg-cover bg-center rounded-xl"
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
