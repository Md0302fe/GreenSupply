import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  ArrowRight,
  Factory,
  ShoppingCart,
  Warehouse,
  GitBranch,
  BarChart3,
} from "lucide-react"
import { Button } from "./button.js"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const services = [
    { name: "Sản xuất thông minh", icon: Factory },
    { name: "Quản lý đơn hàng", icon: ShoppingCart },
    { name: "Quản lý kho bãi", icon: Warehouse },
    { name: "Quy trình minh bạch", icon: GitBranch },
    { name: "Dashboard tổng quan", icon: BarChart3 },
  ]

  const quickLinks = ["Giới thiệu", "Tính năng", "Bảng giá", "Hỗ trợ", "Blog", "Tài liệu"]

  const legalLinks = ["Chính sách bảo mật", "Điều khoản sử dụng", "Chính sách cookie", "GDPR"]

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="">
              <h3 className="text-2xl font-bold mb-2">Đăng ký nhận tin tức</h3>
              <p className="text-green-100">
                Nhận thông tin mới nhất về sản phẩm và xu hướng công nghệ trong ngành sản xuất
              </p>
            </div>
            <div className="flex flex-col items-center sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <Button className="bg-white text-green-600 hover:bg-gray-100 px-6 py-3 font-semibold">
                Đăng ký
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <h3 className="text-2xl font-bold">MangoVate</h3>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Hệ thống quản lý sản xuất xoài sấy dẻo thông minh, mang đến giải pháp toàn diện cho doanh nghiệp.
            </p>

            {/* Social Media */}
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-blue-400 rounded-lg flex items-center justify-center transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Dịch vụ</h4>
            <ul className="space-y-3">
              {services.map((service, index) => {
                const IconComponent = service.icon
                return (
                  <li key={index}>
                    <a
                      href="#"
                      className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors group"
                    >
                      <IconComponent className="w-4 h-4 group-hover:text-green-400" />
                      <span>{service.name}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Liên kết nhanh</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>

            <h4 className="text-lg font-semibold mb-4 mt-8">Pháp lý</h4>
            <ul className="space-y-3">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Liên hệ</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-400">
                    123 Đường ABC, Quận 1<br />
                    TP. Hồ Chí Minh, Việt Nam
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-green-400" />
                <a href="tel:+84123456789" className="text-gray-400 hover:text-white transition-colors">
                  +84 333 090 091
                </a>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-green-400" />
                <a href="mailto:info@mangovate.com" className="text-gray-400 hover:text-white transition-colors">
                  info@mangovate.com
                </a>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-green-400 mt-1" />
                <div className="text-gray-400">
                  <p>Thứ 2 - Thứ 6: 8:00 - 18:00</p>
                  <p>Thứ 7: 8:00 - 12:00</p>
                  <p>Chủ nhật: Nghỉ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">© {currentYear} MangoVate. Tất cả quyền được bảo lưu.</div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>Được phát triển với ❤️ tại Việt Nam</span>
              <div className="flex items-center space-x-2">
                <span>Powered by</span>
                <span className="text-green-400 font-semibold">MangoVate Tech</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
