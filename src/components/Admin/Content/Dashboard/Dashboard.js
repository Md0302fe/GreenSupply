import React from "react";

const DashboardComponent = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 shadow-lg">
        <h1 className="text-4xl font-bold">
          Hệ Thống Quản Lý GreenSupply
        </h1>
        <nav className="mt-4">
          <ul className="flex space-x-6">
            <li>
              <a href="#dashboard" className="hover:underline">
                Bảng Điều Khiển
              </a>
            </li>
            <li>  
              <a href="#production" className="hover:underline">
                Quản Lý Sản Xuất
              </a>
            </li>
            <li>
              <a href="#distribution" className="hover:underline">
                Quản Lý Phân Phối
              </a>
            </li>
            <li>
              <a href="#reports" className="hover:underline">
                Báo Cáo
              </a>
            </li>
            <li>
              <a href="#settings" className="hover:underline">
                Cài Đặt
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <main className="p-6">
        <section className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-3xl font-semibold mb-4 text-blue-600">
            Tổng Quan
          </h2>
          <p className="text-gray-700">
            Chào mừng bạn đến với hệ thống quản lý sản xuất và phân phối. Tại
            đây, bạn có thể theo dõi và quản lý toàn bộ quy trình sản xuất và
            phân phối hàng hóa một cách hiệu quả.
          </p>
        </section>

        <section className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-green-600">
            Các Tính Năng Nổi Bật
          </h2>
          <ul className="list-disc list-inside text-gray-700">
            <li className="mb-2">Quản lý quy trình sản xuất</li>
            <li className="mb-2">Theo dõi tồn kho</li>
            <li className="mb-2">Quản lý đơn hàng và giao hàng</li>
            <li className="mb-2">Báo cáo và phân tích dữ liệu</li>
            <li className="mb-2">Cài đặt và tùy chỉnh hệ thống</li>
          </ul>
        </section>

        <section className="mt-6">
          <h2 className="text-2xl font-semibold mb-4 text-red-600">
            Tin Tức Mới Nhất
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-yellow-100 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
              <h3 className="font-semibold text-lg text-yellow-800">
                Cập Nhật Tính Năng Mới
              </h3>
              <p className="text-gray-600">
                Chúng tôi đã cập nhật một số tính năng mới để cải thiện trải
                nghiệm người dùng.
              </p>
            </div>
            <div className="bg-green-100 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
              <h3 className="font-semibold text-lg text-green-800">
                Khóa Học Đào Tạo
              </h3>
              <p className="text-gray-600">
                Tham gia khóa học đào tạo để hiểu rõ hơn về hệ thống của chúng
                tôi.
              </p>
            </div>
            <div className="bg-blue-100 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
              <h3 className="font-semibold text-lg text-blue-800">
                Hỗ Trợ Khách Hàng
              </h3>
              <p className="text-gray-600">
                Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7.
              </p>
            </div>
            <div className="bg-purple-100 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
              <h3 className="font-semibold text-lg text-purple-800">
                Thông Báo Quan Trọng
              </h3>
              <p className="text-gray-600">
                Đừng bỏ lỡ các thông báo quan trọng từ hệ thống của chúng tôi.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>
          &copy; 2023 Hệ Thống Quản Lý Sản Xuất và Phân Phối. Tất cả quyền được
          bảo lưu.
        </p>
      </footer>
    </div>
  );
};

export default DashboardComponent;
