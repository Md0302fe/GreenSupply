import React, { useEffect, useState } from "react";
import { Card, Statistic, Progress, message } from "antd";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Table } from "antd";
import moment from "moment";

const DashboardSupplyRequest = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const userRedux = useSelector((state) => state.user);
  const token = userRedux?.access_token || localStorage.getItem("access_token");
  const navigate = useNavigate();

  const [allOrders, setAllOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filterType, setFilterType] = useState("day");

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/purchase-order/dashboard-supplyrequest`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.status === "SUCCESS") {
        setDashboardData(res.data.data);
      } else {
        message.error("Không thể tải dữ liệu dashboard!");
      }
    } catch (error) {
      console.error("❌ Lỗi khi gọi API:", error);
      message.error("Lỗi khi tải dashboard!");
    }
    setLoading(false);
  };

  const fetchAllOrders = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/purchase-order/getAllPurchaseOrder`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.status === "SUCCESS") {
        setAllOrders(res.data.data.data || []);
      } else {
        message.error("Không thể tải danh sách đơn hàng!");
      }
    } catch (err) {
      console.error("Lỗi khi fetch đơn hàng:", err);
      message.error("Lỗi khi tải danh sách đơn hàng!");
    }
  };

  const filterOrders = () => {
    const now = new Date();
    let startDate = new Date();

    if (filterType === "day") {
      startDate.setHours(0, 0, 0, 0);
    } else if (filterType === "week") {
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (filterType === "month") {
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    }

    const filtered = allOrders.filter((order) => {
      const createdAt = new Date(order.createdAt);
      return createdAt >= startDate;
    });

    setFilteredOrders(filtered);
  };

  useEffect(() => {
    fetchDashboardData();
    fetchAllOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [filterType, allOrders]);

  const handleNavigate = (status) => {
    navigate(
      `/system/admin/R_purchase-orders?status=${encodeURIComponent(status)}`
    );
  };

  const handleNavigateAllOrders = () => {
    navigate("/system/admin/R_purchase-orders");
  };

  const handleNavigateCompleted = () => {
    navigate(
      `/system/admin/R_purchase-orders?status=${encodeURIComponent(
        "Đã Hoàn Thành"
      )}`
    );
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <header className="bg-gradient-to-r from-yellow-500 to-green-500 text-white p-6 rounded mb-6">
        <h1 className="text-3xl font-bold">
          Dashboard Yêu Cầu Thu Nguyên Liệu
        </h1>
      </header>

      {/* 🔹 Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card
          onClick={handleNavigateAllOrders}
          className="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
        >
          <Statistic title="Tổng Yêu Cầu" value={dashboardData?.total || 0} />
        </Card>

        <Card
          onClick={() => handleNavigate("Chờ duyệt")}
          className="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
        >
          <Statistic
            title="Chờ Duyệt"
            value={dashboardData?.pending || 0}
            valueStyle={{ color: "#faad14" }}
          />
        </Card>
        <Card
          onClick={handleNavigateCompleted}
          className="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
        >
          <Statistic
            title="Hoàn Thành"
            value={dashboardData?.completed || 0}
            valueStyle={{ color: "#1890ff" }}
          />
        </Card>
      </div>

      {/* 🔹 Đơn Đang Xử Lý */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Đơn Hàng Đang Xử Lý</h2>
        {dashboardData?.processingList?.length === 0 && (
          <p className="text-gray-500">Không có đơn đang xử lý</p>
        )}

        <div className="space-y-4">
          {dashboardData?.processingList?.map((item) => (
            <div
              key={item._id}
              className="flex items-center gap-4 border-b pb-4"
            >
              {/* Hình ảnh */}
              <div className="flex-shrink-0">
                <img
                  src={item.image || "https://via.placeholder.com/50"}
                  alt={item.name}
                  className="w-14 h-14 object-cover rounded shadow"
                />
              </div>

              {/* Tên + Progress */}
              <div className="flex-1">
                <div className="text-base font-semibold text-gray-800 mb-1">
                  {item.name} -{" "}
                  {item.priority === 1 && (
                    <span className="text-red-600 bg-red-100 px-2 py-0.5 rounded-full text-xs">
                      Ưu tiên cao
                    </span>
                  )}
                  {item.priority === 2 && (
                    <span className="text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full text-xs">
                      Trung bình
                    </span>
                  )}
                  {item.priority === 3 && (
                    <span className="text-green-600 bg-green-100 px-2 py-0.5 rounded-full text-xs">
                      Thấp
                    </span>
                  )}
                </div>
                <Progress
                  percent={item.progress || 0}
                  status="active"
                  strokeColor={{
                    "0%": "#d9f7be",
                    "50%": "#73d13d",
                    "100%": "#237804",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🔹 Danh sách đơn hàng gần đây theo thời gian */}
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        {/* Bộ lọc thời gian */}
        <div className="flex justify-start mb-4 space-x-2">
          <button
            className={`px-4 py-2 rounded-l ${
              filterType === "day"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setFilterType("day")}
          >
            Theo Ngày
          </button>
          <button
            className={`px-4 py-2 ${
              filterType === "week"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setFilterType("week")}
          >
            Theo Tuần
          </button>
          <button
            className={`px-4 py-2 rounded-r ${
              filterType === "month"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setFilterType("month")}
          >
            Theo Tháng
          </button>
        </div>

        <h2 className="text-xl font-semibold mb-4">Đơn hàng gần đây</h2>
        <Table
          columns={[
            { title: "Mã Đơn", dataIndex: "_id", key: "_id" },
            {
              title: "Tên đơn",
              dataIndex: "request_name",
              key: "request_name",
            },
            { title: "Trạng thái", dataIndex: "status", key: "status" },
            { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
            {
              title: "Ngày tạo",
              dataIndex: "createdAt",
              key: "createdAt",
              render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
            },
          ]}
          dataSource={filteredOrders}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
        />
      </div>
    </div>
  );
};

export default DashboardSupplyRequest;
