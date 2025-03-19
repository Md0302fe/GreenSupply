import React, { useEffect, useState } from "react";
import { Card, Statistic, Table, message } from "antd";
import axios from "axios";
import { useSelector } from "react-redux";
import { Column } from "@ant-design/plots";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const DashboardSupplierOrder = () => {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [combinedOrders, setCombinedOrders] = useState([]);
  const [filterType, setFilterType] = useState("day");
  const userRedux = useSelector((state) => state.user);
  const token = userRedux?.access_token || localStorage.getItem("access_token");
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [dashboardRes, ordersRes] = await Promise.all([
        axios.get(
          `${process.env.REACT_APP_API_URL}/orders/dashboard/supplier-order`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        axios.get(
          `${process.env.REACT_APP_API_URL}/orders/fuel-request/GetALLstatusSuccess`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
      ]);
      if (dashboardRes.data.success && ordersRes.data.success) {
        setDashboardData(dashboardRes.data.data);

        // 👉 Lọc đơn hàng theo thời gian
        let orders = ordersRes.data.data;
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

        const filteredOrders = orders.filter((order) => {
          const createdAt = new Date(order.createdAt);
          return createdAt >= startDate;
        });

        setCombinedOrders(filteredOrders);
      } else {
        message.error("Không thể tải dữ liệu dashboard!");
      }
    } catch (error) {
      console.error("❌ Lỗi khi gọi API:", error);
      message.error("Lỗi khi gọi API!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filterType]);

  const handleCardClick = (type, status) => {
    const route =
      type === "request"
        ? "/system/admin/manage-fuel-orders"
        : "/system/admin/manage-provide-orders";

    navigate(`${route}?status=${encodeURIComponent(status)}`);
  };

  // 🔷 Biểu đồ cột - Trạng thái đơn
  const chartData = [
    { type: "Chờ duyệt", value: dashboardData?.pendingRequests || 0 },
    { type: "Đã duyệt", value: dashboardData?.approvedRequests || 0 },
    { type: "Hoàn thành", value: dashboardData?.totalCompleted || 0 },
  ];

  const chartConfig = {
    data: chartData,
    xField: "type",
    yField: "value",
    label: {
      position: "top",
      style: { fill: "#000", fontSize: 14 },
    },
    color: ({ type }) => {
      if (type === "Chờ duyệt") return "#faad14";
      if (type === "Đã duyệt") return "#52c41a";
      if (type === "Hoàn thành") return "#1890ff";
      return "#ccc";
    },
  };
  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <header className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded mb-6">
        <h1 className="text-3xl font-bold">Dashboard Đơn Hàng Nhà Cung Cấp</h1>
      </header>

      {/* 🔹 Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <Statistic
            title="Tổng Đơn"
            value={
              (dashboardData?.totalFuelRequests || 0) +
              (dashboardData?.totalFuelSupplyOrders || 0)
            }
          />
        </Card>
        <Card>
          <Statistic
            title="Đơn Chờ Duyệt"
            value={dashboardData?.pendingRequests || 0}
            valueStyle={{ color: "#faad14" }}
          />
        </Card>
        <Card>
          <Statistic
            title="Đơn Đã Duyệt"
            value={dashboardData?.approvedRequests || 0}
            valueStyle={{ color: "#52c41a" }}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Card 1: Yêu Cầu Thu Nguyên Liệu */}
        <Card
          title="📥 Yêu Cầu Thu Nguyên Liệu"
          bordered={false}
          className="shadow-md rounded-lg"
        >
          <p className="text-gray-600 mb-2">Tổng số đơn</p>
          <h2 className="text-3xl font-bold mb-4">
            {dashboardData?.fuelRequests?.total || 0}
          </h2>

          <ul className="space-y-2">
            <li
              onClick={() => handleCardClick("request", "Chờ duyệt")}
              className="text-yellow-500 cursor-pointer hover:underline"
            >
              🕒 Chờ duyệt:{" "}
              <strong>{dashboardData?.fuelRequests?.pending || 0}</strong>
            </li>
            <li
              onClick={() => handleCardClick("request", "Đã duyệt")}
              className="text-green-600 cursor-pointer hover:underline"
            >
              ✅ Đã duyệt:{" "}
              <strong>{dashboardData?.fuelRequests?.approved || 0}</strong>
            </li>
            <li
              onClick={() => handleCardClick("request", "Hoàn thành")}
              className="text-blue-500 cursor-pointer hover:underline"
            >
              🏁 Hoàn thành:{" "}
              <strong>{dashboardData?.fuelRequests?.completed || 0}</strong>
            </li>
          </ul>
        </Card>

        {/* Card 2: Yêu Cầu Cung Cấp Nguyên Liệu */}
        <Card
          title="📦 Yêu Cầu Cung Cấp Nguyên Liệu"
          bordered={false}
          className="shadow-md rounded-lg"
        >
          <p className="text-gray-600 mb-2">Tổng số đơn</p>
          <h2 className="text-3xl font-bold mb-4">
            {dashboardData?.fuelSupplyOrders?.total || 0}
          </h2>

          <ul className="space-y-2">
            <li
              onClick={() => handleCardClick("supply", "Chờ duyệt")}
              className="text-yellow-500 cursor-pointer hover:underline"
            >
              🕒 Chờ duyệt:{" "}
              <strong>{dashboardData?.fuelSupplyOrders?.pending || 0}</strong>
            </li>
            <li
              onClick={() => handleCardClick("supply", "Đã duyệt")}
              className="text-green-600 cursor-pointer hover:underline"
            >
              ✅ Đã duyệt:{" "}
              <strong>{dashboardData?.fuelSupplyOrders?.approved || 0}</strong>
            </li>
            <li
              onClick={() => handleCardClick("supply", "Hoàn thành")}
              className="text-blue-500 cursor-pointer hover:underline"
            >
              🏁 Hoàn thành:{" "}
              <strong>{dashboardData?.fuelSupplyOrders?.completed || 0}</strong>
            </li>
          </ul>
        </Card>
      </div>

      {/* 🔹 Biểu đồ đơn hàng theo trạng thái */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Biểu đồ trạng thái đơn</h2>
        <Column {...chartConfig} />
      </div>

      {/* 🔹 Danh sách đơn hàng gần đây */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* 🔘 Bộ lọc thời gian */}
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
              title: "Loại",
              dataIndex: "receipt_type",
              key: "receipt_type",
              render: (type) =>
                type === "supply" ? "Đơn Cung Cấp" : "Yêu Cầu Thu Hàng",
            },
            {
              title: "Nhà cung cấp",
              dataIndex: ["supplier_id", "full_name"],
              key: "supplier_id",
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
          dataSource={combinedOrders}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
        />
      </div>
    </div>
  );
};

export default DashboardSupplierOrder;
