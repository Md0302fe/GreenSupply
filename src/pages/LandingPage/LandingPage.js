
import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-white">
      <div className="flex justify-between">
        <div className="max-sm:hidden w-5/12 flex flex-col items-center">
          <img src="/image/logo-orange.png" alt="" />
          <p className="text-supply-primary text-sm">Giải pháp hiệu quả dành cho nông sản của bạn</p>
        </div>
        <div className="sm:w-7/12 w-full flex flex-col">
          <div className="flex sm:flex-row flex-col gap-4 justify-center sm:justify-start items-center py-4">
            <input
              type="text"
              placeholder="Bạn đang tìm kiếm gì?"
              className="border px-4 py-2 rounded-full w-1/2 max-sm:hidden"
            />
            <div className="flex gap-4">
              <Link
                to="/login"
                className="border border-orange-500 text-orange-500 px-4 py-2 rounded-md"
              >
                Đăng Nhập
              </Link>
              <Link
                to="/register"
                className="bg-orange-500 text-white px-4 py-2 rounded-md"
              >
                Đăng Ký
              </Link>
            </div>
          </div>
          <div className="bg-orange-500 text-white flex justify-center sm:justify-start gap-6 md:gap-8 py-3 sm:pl-6 sm:rounded-s-lg">
            <a href="/" className="hover:underline text-sm sm:text-base">Trang chủ</a>
            <a href="/" className="hover:underline text-sm sm:text-base">Giới thiệu</a>
            <a href="/" className="hover:underline text-sm sm:text-base">Dịch vụ</a>
            <a href="/" className="hover:underline text-sm sm:text-base">Blogs</a>
            <a href="/" className="hover:underline text-sm sm:text-base">Liên Hệ</a>
          </div>
        </div>
      </div>

    </nav>
  );
};

const Banner = () => {
  return (
    <div className="h-[600px] bg-cover bg-no-repeat mt-8 flex flex-col justify-center items-start md:pl-12 pl-3 pr-3" style={{ backgroundImage: 'url(/image/truck-1.png)' }}>
      <img src="/image/logo-green.png" alt="" className="w-48" />
      <p className="text-white max-w-[360px] text-xl ">Nền tảng quản lý chuỗi cung ứng xoài thông minh, minh bạch và bền vững, giúp kết nối từ nông trại đến tay người tiêu dùng một cách hiệu quả.</p>
      <div className="sm:w-[350px] w-[250px] h-[2px] border-b-4 border-supply-primary py-2"></div>
      <button className="bg-supply-primary rounded-b-xl rounded-tr-xl mt-4 flex gap-2 text-white px-3 py-2">
        <span>Xem thêm</span>
        <img src="/image/icon/right.png" alt="" />
      </button>
    </div>
  )
}

const Card = () => {
  return (
    <div className="grid md:grid-cols-4 sm:grid-cols-2 max-lg:px-4 lg:px-28 justify-center mt-10 gap-4">
      <div className="flex flex-col items-center text-center bg-[#006838] py-12 px-3 gap-2 rounded-2xl">
        <img src="/image/landing/group-1.png" alt="" className="w-16" />
        <p className=" text-white">Chi phí hài lòng</p>
        <p className="self-start text-justify text-white">Đảm bảo mức chi phí tối ưu nhất ở mọi bước trong chuỗi cung ứng của bạn, từ sản xuất đến giao hàng.</p>
      </div>
      <div className="flex flex-col items-center text-center bg-[#006838] py-12 px-3 gap-2 rounded-2xl">
        <img src="/image/landing/group-2.png" alt="" className="w-16" />
        <p className=" text-white">Hỗ trợ 24x7</p>
        <p className="self-start text-justify text-white">Nhận hỗ trợ 24x7 để đảm bảo chuỗi cung ứng của bạn hoạt động liền mạch mọi lúc, mọi nơi.</p>
      </div>
      <div className="flex flex-col items-center text-center bg-[#006838] py-12 px-3 gap-2 rounded-2xl">
        <img src="/image/landing/group-3.png" alt="" className="w-16" />
        <p className=" text-white">Tích hợp liền mạch</p>
        <p className="self-start text-justify text-white">Kết nối các quy trình trong chuỗi cung ứng của bạn một cách dễ dàng với các công cụ và công nghệ hiện đại, đảm bảo hoạt động trơn tru.</p>
      </div>
      <div className="flex flex-col items-center text-center bg-[#006838] py-12 px-3 gap-2 rounded-2xl">
        <img src="/image/landing/group-4.png" alt="" className="w-16" />
        <p className=" text-white">Real-Time Tracking</p>
        <p className="self-start text-justify text-white">Monitor your supply chain in real time with precise updates, ensuring transparency and control at every step.</p>
      </div>
    </div>
  )
}

const About = () => {
  return (
    <div className="h-[600px] bg-cover bg-no-repeat mt-8 flex justify-end md:pr-12 pr-3 pl-3" style={{ backgroundImage: 'url(/image/landing/about-bg.png)' }}>
      <div className="flex flex-col justify-center items-start">
        <img src="/image/landing/about.png" alt="" className="w-56" />
        <p className="text-white max-w-[420px] text-xl text-justify mt-4">Chúng tôi nỗ lực chuyển đổi chuỗi cung ứng xoài bằng cách cung cấp các giải pháp đổi mới đảm bảo chất lượng, hiệu quả và tính bền vững từ trang trại đến bàn ăn. Với MSCM, tính minh bạch và hợp tác là trọng tâm trong mọi việc chúng tôi làm.
          Để đơn giản hóa và nâng cao chuỗi cung ứng xoài, trao quyền cho nông dân, nhà phân phối và nhà bán lẻ thông qua các giải pháp đổi mới, công nghệ và dựa trên dữ liệu.</p>
        <div className="sm:w-[400px] w-[300px] h-[2px] border-b-4 border-supply-primary py-2"></div>
        <button className="bg-supply-primary rounded-b-xl rounded-tr-xl mt-4 flex gap-2 text-white px-3 py-2">
          <span>Xem thêm</span>
          <img src="/image/icon/right.png" alt="" />
        </button>
      </div>
    </div>
  )
}

const LandingPage = () => {
  return (
    <div>
      <Navbar />
      <Banner />
      <Card />
      <About />

    </div>
  );
};


export default LandingPage;
