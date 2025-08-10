"use client";

import { useState, useEffect } from "react";
import slider1 from "../../assets/Logo_Mangovate/slider1.jpg";
import slider2 from "../../assets/Logo_Mangovate/slider2.jpg";
import slider3 from "../../assets/Logo_Mangovate/slider3.jpg";
import slider4 from "../../assets/Logo_Mangovate/slider4.jpg";
import slider5 from "../../assets/Logo_Mangovate/slider5.jpg";

import {
  ChevronLeft,
  ChevronRight,
  Factory,
  ShoppingCart,
  Warehouse,
  GitBranch,
  BarChart3,
} from "lucide-react";
import { Button } from "./button.js";
import { Card, CardContent } from "./card.js";
import { useTranslation } from "react-i18next";

const slides = [1, 2, 3, 4, 5];

export default function MangoVateSlider() {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const goToSlide = (index) => setCurrentSlide(index);

  const images = [slider1, slider2, slider3, slider4, slider5];
  const icons = [Factory, ShoppingCart, Warehouse, GitBranch, BarChart3];
  const bgColors = [
    "from-orange-200 to-orange-300",
    "from-orange-300 to-orange-400",
    "from-orange-500 to-orange-600",
    "from-green-300 to-purple-400",
    "from-indigo-500 to-green-600",
  ];

  const slideId = slides[currentSlide];
  const IconComponent = icons[currentSlide];

  return (
    <div className="relative max-w-7xl mx-auto">
      <Card className="overflow-hidden shadow-2xl">
        <CardContent className="p-0">
          <div
            className={`bg-gradient-to-r ${bgColors[currentSlide]} text-white relative min-h-[500px]`}
          >
            <div className="grid md:grid-cols-2 gap-8 p-12 items-center">
              <div className="flex flex-col justify-center space-y-6">
                <div className="flex items-center space-x-4 p-0 md:p-5">
                  <div className="p-2 md:p-3 bg-white/20 rounded-full backdrop-blur-sm">
                    <IconComponent className="w-4 md:w-8 h-4 md:h-8" />
                  </div>
                  <div className="text-sm font-medium bg-white/20 px-3 md:px-4 py-2 rounded-full backdrop-blur-sm">
                    MangoVate System
                  </div>
                </div>

                <div>
                  <h2 className="text-3x1 md:text-4xl font-bold mb-2">
                    {t(`landingPage.slider.slides.${slideId}.title`)}
                  </h2>
                  <p className="text-white/80 text-sm md:text-lg mb-4">
                    {t(`landingPage.slider.slides.${slideId}.subtitle`)}
                  </p>
                </div>

                <p className="text-sm md:text-lg leading-relaxed text-white/90">
                  {t(`landingPage.slider.slides.${slideId}.description`)}
                </p>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm md:text-lg">
                    {t("landingPage.slider.features_title")}
                  </h4>
                  <ul className="space-y-2">
                    {[0, 1, 2].map((index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span className="text-sm md:text-lg text-white/90">
                          {t(
                            `landingPage.slider.slides.${slideId}.features.${index}`
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col space-y-3 pt-4 md:flex-row md:space-y-0 md:space-x-4">
                  <Button
                    size="lg"
                    className="bg-white text-gray-900 hover:bg-white/90 font-semibold px-8"
                  >
                    {t("landingPage.slider.learn_more")}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-gray-900 px-8 bg-transparent"
                  >
                    {t("landingPage.slider.contact")}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="relative">
                  <img
                    src={images[currentSlide] || "/placeholder.svg"}
                    alt={t(`landingPage.slider.slides.${slideId}.title`)}
                    className="rounded-xl shadow-2xl max-w-full h-auto"
                  />
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                  <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm rounded-full w-12 h-12"
              onClick={prevSlide}
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm rounded-full w-12 h-12"
              onClick={nextSlide}
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center space-x-3 mt-6">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                ? "bg-green-600 scale-125"
                : "bg-gray-300 hover:bg-gray-400"
              }`}
            onClick={() => goToSlide(index)}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          />
        ))}
      </div>

      <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-green-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>

      <div className="text-center mt-4 text-gray-600">
        <span className="text-sm font-medium">
          {currentSlide + 1} / {slides.length}
        </span>
      </div>
    </div>
  );
}
