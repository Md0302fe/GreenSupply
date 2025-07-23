"use client"
import { Link } from "react-router-dom"
import { Home, ArrowLeft, Shield, Lock } from "lucide-react"

const CannotAccessPage = () => {
  const handleGoBack = () => window.history.back()

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* Số 403 */}
        <div className="relative mb-6">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 animate-pulse">
            403
          </h1>
        </div>

        {/* Icon */}
        <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
          <Shield className="w-10 h-10 text-red-500" />
        </div>

        {/* Thông báo */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
            <Lock className="w-5 h-5 text-red-500" />
            Không có quyền truy cập
          </h2>
          <p className="text-gray-600">Bạn không có quyền truy cập vào trang này.</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-center mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-orange-500 hover:to-red-600 transition-all duration-300"
          >
            <Home className="w-4 h-4" />
            Trang chủ
          </Link>

          <button
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
        </div>

        {/* Contact */}
        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">Cần hỗ trợ?</p>
          <a href="mailto:mangovate@gmail.com" className="text-orange-600 text-sm font-medium">
            📧 mangovate@gmail.com
          </a>
        </div>
      </div>
    </div>
  )
}

export default CannotAccessPage
