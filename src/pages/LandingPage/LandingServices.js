"use client";

import {
  Factory,
  ShoppingCart,
  Warehouse,
  GitBranch,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "./card.js";
import { Button } from "./button.js";
import { useTranslation } from "react-i18next";

const services = [
  {
    id: 1,
    icon: Factory,
    color: "blue",
    bgGradient: "from-blue-50 to-blue-100",
    iconBg: "bg-blue-500",
  },
  {
    id: 2,
    icon: ShoppingCart,
    color: "green",
    bgGradient: "from-green-50 to-green-100",
    iconBg: "bg-green-500",
  },
  {
    id: 3,
    icon: Warehouse,
    color: "orange",
    bgGradient: "from-orange-50 to-orange-100",
    iconBg: "bg-orange-500",
  },
  {
    id: 4,
    icon: GitBranch,
    color: "purple",
    bgGradient: "from-purple-50 to-purple-100",
    iconBg: "bg-purple-500",
  },
  {
    id: 5,
    icon: BarChart3,
    color: "indigo",
    bgGradient: "from-indigo-50 to-indigo-100",
    iconBg: "bg-indigo-500",
  },
];

export default function ServicesSection() {
  const { t } = useTranslation();

  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t("landingPage.servicesSection.header")}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("landingPage.servicesSection.subheader")}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-4">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <Card
                key={service.id}
                className="group hover:shadow-lg transition-all duration-300 border-0 bg-white"
              >
                <CardContent className="p-6">
                  <div
                    className={`bg-gradient-to-br ${service.bgGradient} rounded-lg p-4 mb-6`}
                  >
                    <div
                      className={`${service.iconBg} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {t(
                        `landingPage.servicesSection.services.${service.id}.title`
                      )}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {t(
                        `landingPage.servicesSection.services.${service.id}.description`
                      )}
                    </p>
                  </div>

                  <div className="space-y-2 mb-6">
                    {[0, 1, 2].map((index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 text-sm text-gray-600"
                      >
                        <div
                          className={`w-1.5 h-1.5 ${service.iconBg} rounded-full`}
                        ></div>
                        <span>
                          {t(
                            `landingPage.servicesSection.services.${service.id}.features.${index}`
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full group-hover:bg-gray-100 justify-between p-3"
                  >
                    <span>{t("landingPage.servicesSection.learn_more")}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-2xl p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {t("landingPage.servicesSection.ctaTitle")}
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            {t("landingPage.servicesSection.ctaDescription")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="!bg-green-600 !hover:bg-green-700 !text-white px-8"
            >
              {t("landingPage.servicesSection.contact")}
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50 px-8 bg-transparent"
            >
              {t("landingPage.servicesSection.demo")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
