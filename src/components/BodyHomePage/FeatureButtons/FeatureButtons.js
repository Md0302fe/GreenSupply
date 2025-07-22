"use client";

import { useNavigate } from "react-router-dom";
import { Package, Truck, Headphones, ArrowRight, Sparkles } from "lucide-react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

const ImprovedFeatureButtons = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  // Mock translation function
  const mockT = (key) => {
    const translations = {
      "feature_buttons.order_management": "Quản lý đơn hàng",
      "feature_buttons.harvest_request": "Yêu cầu thu hàng",
      "feature_buttons.provide_material": "Cung cấp nguyên liệu",
    };
    return translations[key] || key;
  };

  const features = [
    {
      id: 1,
      icon: Package,
      textKey: "feature_buttons.order_management",
      descriptionKey: "feature_buttons.order_management_description",
      path: "/supplier/harvest-request-management",
      color: "from-blue-500 to-blue-600",
      hoverColor: "hover:from-blue-600 hover:to-blue-700",
      bgColor: "bg-blue-50",
    },
    {
      id: 2,
      icon: Truck,
      textKey: "feature_buttons.harvest_request",
      descriptionKey: "feature_buttons.harvest_request_description",
      path: "/supplier/harvest-request",
      color: "from-green-500 to-green-600",
      hoverColor: "hover:from-green-600 hover:to-green-700",
      bgColor: "bg-green-50",
    },
    {
      id: 3,
      icon: Headphones,
      textKey: "feature_buttons.provide_material",
      descriptionKey: "feature_buttons.provide_material_description",
      path: "/supplier/provide-request",
      color: "from-orange-500 to-orange-600",
      hoverColor: "hover:from-orange-600 hover:to-orange-700",
      bgColor: "bg-orange-50",
    },
  ];

  const handleFeatureClick = (feature) => {
    // Add any authentication checks here if needed
    navigate(feature.path);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-2">
      {/* Header Section */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6 text-yellow-500 mr-2" />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {t("feature_buttons.title")}
          </h2>
          <Sparkles className="w-6 h-6 text-yellow-500 ml-2" />
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t("feature_buttons.description")}
        </p>
      </div>

      {/* Feature Buttons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;

          return (
            <div key={feature.id} className="group relative">
              {/* Main Button */}
              <button
                onClick={() => handleFeatureClick(feature)}
                className={`
                  relative w-full h-48 lg:h-56
                  bg-gradient-to-br ${feature.color} ${feature.hoverColor}
                  rounded-2xl shadow-lg hover:shadow-xl
                  transform hover:scale-105 hover:-translate-y-2
                  transition-all duration-300 ease-out
                  overflow-hidden
                  focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50
                `}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 right-4 w-20 h-20 bg-white rounded-full"></div>
                  <div className="absolute bottom-4 left-4 w-12 h-12 bg-white rounded-full"></div>
                  <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-white">
                  {/* Icon Container */}
                  <div className="mb-4 p-4 bg-white/20 backdrop-blur-sm rounded-2xl group-hover:bg-white/30 transition-colors duration-300">
                    <IconComponent className="w-8 h-8 lg:w-10 lg:h-10" />
                  </div>

                  {/* Text */}
                  <h3 className="text-lg lg:text-xl font-bold text-center mb-2 leading-tight">
                    {t(feature.textKey)}
                  </h3>

                  <p className="text-sm text-white/80 text-center mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {t(feature.descriptionKey)}
                  </p>

                  {/* Arrow Icon */}
                  <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>

                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
              </button>

              {/* Connection Line (for desktop) */}
              {index < features.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 lg:-right-6 w-8 lg:w-12 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400 transform -translate-y-1/2 z-0">
                  <div className="absolute right-0 top-1/2 w-2 h-2 bg-gray-400 rounded-full transform -translate-y-1/2"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-12">
        <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full text-gray-700 text-sm font-medium">
          <span>{t("feature_buttons.need_help")}</span>
          <button className="ml-3 text-blue-600 hover:text-blue-700 font-semibold transition-colors">
            {t("feature_buttons.contact_now")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImprovedFeatureButtons;
