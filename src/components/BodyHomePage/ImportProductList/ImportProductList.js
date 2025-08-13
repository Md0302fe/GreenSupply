"use client"

import { useEffect, useState } from "react"
import { getAllFuelEntry } from "../../../services/FuelEntryServices"
import { useParams, useNavigate } from "react-router-dom"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import { useTranslation } from "react-i18next"
import { useSelector } from "react-redux"
import { ChevronLeft, ChevronRight, Clock, Package, DollarSign, FileText } from "lucide-react"

// Custom Arrow Components
const CustomPrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white shadow-lg rounded-full flex items-center justify-center transition-all duration-300 group border border-gray-200"
  >
    <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:scale-110 transition-transform" />
  </button>
)

const CustomNextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white shadow-lg rounded-full flex items-center justify-center transition-all duration-300 group border border-gray-200"
  >
    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:scale-110 transition-transform" />
  </button>
)

const ImportProductList = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [productList, setProductList] = useState([])
  const { id } = useParams()
  const user = useSelector((state) => state.user)

  const fetchOrders = async () => {
    try {
      const access_token = user?.access_token
      const user_id = user?.id
      const response = await getAllFuelEntry({}, access_token, user_id)
      const filteredOrders = response.data.filter(
        (order) =>
          order.status === "Đang xử lý" && !order.is_deleted && new Date(order.end_received).getTime() > Date.now(),
      )
      setProductList(filteredOrders)
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [id])

  // Cấu hình Slider
  const sliderSettings = {
    dots: true,
    infinite: productList.length > 4,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    adaptiveHeight: false, // giữ chiều cao track cố định
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    dotsClass: "slick-dots custom-dots",
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  }

  const handleCreateOrder = () => {
    navigate(`/supplier/provide-request`)
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {t("import_product_list.title")}
              </h2>
              <p className="text-gray-600">{t("import_product_list.note")}</p>
            </div>
            <button
              onClick={handleCreateOrder}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <FileText className="w-5 h-5 mr-2" />
              {t("import_product_list.view_more")}
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>

        {/* Product List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {productList.length > 0 ? (
            <div className="relative px-4">
              <Slider {...sliderSettings}>
                {productList.map((product) => (
                  <div key={product._id} className="px-3 h-full">
                    {/* h-full để slide giãn bằng nhau */}
                    <ProductItem product={product} />
                  </div>
                ))}
              </Slider>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("import_product_list.empty")}</h3>
              <button
                onClick={handleCreateOrder}
                className="inline-flex items-center px-6 py-3 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors font-medium"
              >
                <FileText className="w-4 h-4 mr-2" />
                {t('createNew')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        /* cân chiều cao các slide */
        .slick-track { display: flex !important; }
        .slick-slide { height: inherit !important; }
        .slick-slide > div { height: 100%; }

        .custom-dots { bottom: -50px !important; }
        .custom-dots li button:before {
          font-size: 12px !important;
          color: #d1d5db !important;
          opacity: 0.5 !important;
        }
        .custom-dots li.slick-active button:before {
          opacity: 1 !important;
          color: #3b82f6 !important;
        }
        .custom-dots li { margin: 0 4px !important; }
      `}</style>
    </div>
  )
}

const ProductItem = ({ product }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const getTimeRemaining = (endTime) => {
    const total = Date.parse(endTime) - Date.now()
    const seconds = Math.floor((total / 1000) % 60)
    const minutes = Math.floor((total / 1000 / 60) % 60)
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
    const days = Math.floor(total / (1000 * 60 * 60 * 24))
    return { total, days, hours, minutes, seconds }
  }

  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(product.end_received))

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedTime = getTimeRemaining(product.end_received)
      setTimeLeft(updatedTime)
      if (updatedTime.total <= 0) clearInterval(interval)
    }, 1000)
    return () => clearInterval(interval)
  }, [product.end_received])

  const handleCreateOrderDetail = () => {
    navigate(`/supplier/provide-request/${product._id}`)
  }

  const isUrgent = timeLeft.total > 0 && timeLeft.days < 3

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden transform hover:-translate-y-2 h-full flex flex-col">
      {/* Image cố định chiều cao để không nhảy */}
      <div className="relative overflow-hidden">
        <img
          src={product.fuel_image || "/default-image.jpg"}
          alt="Fuel"
          className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {isUrgent && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
            <Clock className="w-3 h-3 mr-1" />
            {t("import_product_list.urgent")}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Content co giãn */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-base font-semibold text-gray-900 min-h-[48px]">{product.request_name}</h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <span className="text-xs text-gray-600 flex items-center">
              <Package className="w-3 h-3 mr-1 text-blue-500" />
              {t("import_product_list.quantity")}:
            </span>
            <span className="font-bold text-sm text-gray-900">{product.quantity_remain}</span>
          </div>

          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <span className="text-xs text-gray-600 flex items-center">
              <DollarSign className="w-3 h-3 mr-1 text-green-500" />
              {t("import_product_list.price_per_unit")}:
            </span>
            <span className="font-bold text-sm text-gray-900">{product.price.toLocaleString("vi-VN")} VNĐ</span>
          </div>

          <div className="flex items-center justify-between p-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <span className="text-xs text-blue-700 font-medium">{t("import_product_list.total_price")}:</span>
            <span className="font-bold text-sm text-blue-900">{product.total_price.toLocaleString("vi-VN")} VNĐ</span>
          </div>
        </div>

        <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <div className="flex items-center mb-2">
            <Clock className="w-3 h-3 text-gray-500 mr-1" />
            <span className="text-xs font-medium text-gray-700">Thời gian còn lại:</span>
          </div>
          {timeLeft.total > 0 ? (
            <div className={`text-xs font-bold ${isUrgent ? "text-red-600" : "text-green-600"}`}>
              {timeLeft.days} {t("common.days")} {timeLeft.hours} {t("common.hours")} {timeLeft.minutes} {t("common.minutes")} {timeLeft.seconds} {t("common.seconds")}
            </div>
          ) : (
            <div className="text-xs font-bold text-gray-500">{t("import_product_list.expired")}</div>
          )}
        </div>

        {/* Đưa nút xuống đáy card */}
        <button
          onClick={handleCreateOrderDetail}
          className="mt-auto w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
        >
          <FileText className="w-4 h-4 mr-2" />
          {t("import_product_list.create_order")}
        </button>
      </div>
    </div>
  )
}

export default ImportProductList
