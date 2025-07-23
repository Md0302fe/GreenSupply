import { Link } from "react-router-dom";
import { Home, ArrowLeft, Search, RefreshCw } from "lucide-react";

import PrivateRouteAdmin from "../../pages/NotFoundPage/PrivateRouteAdmin";

// Logo Component inline
const MangovateLogo = ({ size = "md", showText = true, className = "" }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo placeholder - thay thế bằng logo thực tế */}
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center shadow-lg`}
      >
        <span className="text-white font-bold text-xl">M</span>
        {/* Uncomment khi có logo thực tế:
        <img 
          src="/assets/mangovate-logo.svg" 
          alt="Mangovate Logo" 
          className="w-full h-full object-contain p-1"
        />
        */}
      </div>

      {showText && (
        <div className="text-left">
          <h3 className={`${textSizeClasses[size]} font-bold text-gray-800`}>
            Mangovate
          </h3>
          <p className="text-sm text-gray-500">Management System</p>
        </div>
      )}
    </div>
  );
};

const NotFoundPage = () => {
  // Các function xử lý sự kiện
  const handleGoBack = () => {
    window.history.back();
  };

  const handleReload = () => {
    window.location.reload();
  };

  // Danh sách các link hữu ích
  const helpfulLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/products", label: "Sản phẩm" },
    { to: "/users", label: "Người dùng" },
    { to: "/settings", label: "Cài đặt" },
    { to: "/reports", label: "Báo cáo" },
    { to: "/help", label: "Trợ giúp" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Số 404 với Animation */}
        <div className="relative mb-6">
          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-orange-600 to-pink-600 animate-pulse">
            404
          </h1>
          <div className="absolute inset-0 text-6xl md:text-8xl font-black text-gray-200 -z-10 blur-sm">
            404
          </div>
        </div>

        {/* Thông báo lỗi */}
        <div className="mb-8 space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
            Oops! Trang không tìm thấy
          </h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
            Trang bạn đang tìm kiếm có thể đã được di chuyển, xóa hoặc không tồn
            tại trong hệ thống Mangovate.
          </p>
        </div>

        {/* Các nút hành động */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-orange-500 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Home className="w-5 h-5" />
            Về trang chủ
          </Link>

          <button
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-300 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>

          <button
            onClick={handleReload}
            className="inline-flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg font-semibold border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
          >
            <RefreshCw className="w-5 h-5" />
            Tải lại
          </button>
        </div>

        {/* Thông tin hỗ trợ */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-800 mb-2">Cần hỗ trợ?</h4>
          <p className="text-sm text-gray-600 mb-3">
            Nếu bạn tin rằng đây là lỗi hệ thống, vui lòng liên hệ với đội ngũ
            hỗ trợ.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <a
              href="mailto:support@mangovate.com"
              className="text-orange-600 hover:text-orange-800 text-sm font-medium"
            >
              📧 mangovate@gmail.com
            </a>
            <span className="hidden sm:inline text-gray-400">|</span>
            <a
              href="tel:+84333090091"
              className="text-orange-600 hover:text-orange-800 text-sm font-medium"
            >
              📞 +84 333 090 091
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-sm text-gray-500">
          <p>
            <strong>Mangovate Management System</strong> - Mã lỗi: 404
          </p>
          <p className="mt-1">© 2025 Mangovate. Phiên bản 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
