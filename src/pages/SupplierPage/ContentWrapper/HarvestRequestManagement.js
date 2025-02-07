import React from "react";
import Shop from "../../../assets/NewProject/Icon-GreenSupply/shop-illustration.webp";

const HarvestRequestManagement = () => {
  // Dữ liệu giả minh hoạ - thay bằng dữ liệu fetch từ API
  const mockRequests = [
    {
      _id: "001",
      fuel_name: "Xoài Thái",
      quantity: 50,
      price: 20000,
      total_price: 1000000,
      status: "Chờ duyệt",
      priority: 1,
      // Note rất dài để test
      note: "Cần gấp trong tuần này. Đây là yêu cầu khẩn cấp để kịp tiến độ sản xuất, vui lòng duyệt sớm có thể để vận chuyển kịp thời đến kho trung chuyển của chúng tôi. Cảm ơn!",
    },
    {
      _id: "002",
      fuel_name: "Xoài Cát",
      quantity: 100,
      price: 18000,
      total_price: 1800000,
      status: "Đã duyệt",
      priority: 2,
      note: "Đang chờ xác nhận kho",
    },
    {
      _id: "003",
      fuel_name: "Xoài Cát Hòa Lộc",
      quantity: 30,
      price: 19000,
      total_price: 570000,
      status: "Từ chối",
      priority: 3,
      note: "Do thiếu chứng từ",
    },
  ];

  return (
    <div className="px-2">
      {/* Giới thiệu */}
      <div className="w-full border border-gray-200 flex items-center gap-20 mb-5 justify-between rounded-md p-6 bg-white shadow">
        <div className="info">
          <h1 className="text-3xl font-bold mb-3 text-black">Good Morning</h1>
          <p>
            Here's what's happening in your store today. See the statistics.
          </p>
        </div>
        <img src={Shop} className="w-[250px]" alt="Shop Illustration" />
      </div>

      {/* Bảng quản lý đơn yêu cầu thu hàng */}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-white">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          {/* Tiêu đề cột */}
          <thead className="text-xs text-gray-800 uppercase bg-gray-100 dark:bg-gray-800 dark:text-gray-600">
            <tr>
              <th scope="col" className="px-6 py-3 text-center">
                Tên nhiên liệu
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Số lượng
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Giá mỗi đơn vị
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Tổng giá
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Trạng thái
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Ưu tiên
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Ghi chú
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Action
              </th>
            </tr>
          </thead>

          {/* Nội dung bảng */}
          <tbody>
            {/* Trường hợp có dữ liệu */}
            {mockRequests.map((req) => (
              <tr
                key={req._id}
                className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700"
              >
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center"
                >
                  {req.fuel_name}
                </th>
                <td className="px-6 py-4 text-center">{req.quantity}</td>
                <td className="px-6 py-4 text-center">
                  {req.price.toLocaleString("vi-VN")} đ
                </td>
                <td className="px-6 py-4 text-center">
                  {req.total_price.toLocaleString("vi-VN")} đ
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium inline-block w-24 text-center
                      ${
                        req.status === "Chờ duyệt"
                          ? "bg-yellow-100 text-yellow-800"
                          : req.status === "Đã duyệt"
                          ? "bg-green-100 text-green-800"
                          : req.status === "Từ chối"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    `}
                  >
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">{req.priority}</td>

                {/* Cột ghi chú - giới hạn hiển thị + tooltip */}
                <td
                  className="px-6 py-4 max-w-[180px] whitespace-nowrap overflow-hidden text-ellipsis"
                  title={req.note}
                >
                  {req.note}
                </td>

                <td className="px-6 py-4 text-center">
                  <button className="font-medium text-blue-600 hover:underline mr-4">
                    Edit
                  </button>
                  <button className="font-medium text-red-600 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {/* Trường hợp không có dữ liệu */}
            {mockRequests.length === 0 && (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                  Không có yêu cầu thu hàng nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HarvestRequestManagement;
