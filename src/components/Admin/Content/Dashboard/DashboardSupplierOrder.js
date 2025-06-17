import React, { useEffect, useState } from "react";
import { Card, Statistic, Table, message } from "antd";
import axios from "axios";
import { useSelector } from "react-redux";
import { Column } from "@ant-design/plots";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const DashboardSupplierOrder = () => {
  const { t } = useTranslation();

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

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // cập nhật ngay khi component mount

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔷 Biểu đồ cột - Trạng thái đơn
  const chartData = [
    {
      type: isMobile ? t("status.pending").replace(" ", "\n") : t("status.pending"),
      value: dashboardData?.pendingRequests || 0,
    },
    {
      type: isMobile ? t("status.approve").replace(" ", "\n") : t("status.approve"),
      value: dashboardData?.approvedRequests || 0,
    },
    {
      type: isMobile ? t("status.completed").replace(" ", "\n") : t("status.completed"),
      value: dashboardData?.totalCompleted || 0,
    },
  ];


  const chartConfig = {
    data: chartData,
    xField: "type",
    yField: "value",
    label: {
      position: "top",
      style: {
        fill: "#000",
        fontSize: isMobile ? 12 : 14,
      },
    },
    color: ({ type }) => {
      const raw = type.replace("\n", " ");
      if (raw === "Chờ duyệt") return "#faad14";
      if (raw === "Đã duyệt") return "#52c41a";
      if (raw === "Hoàn thành") return "#1890ff";
      return "#ccc";
    },
    columnWidthRatio: isMobile ? 0.3 : 0.6,
    height: isMobile ? 200 : 400,
    xAxis: {
      label: {
        autoRotate: false,
        style: {
          fill: "#000",
          fontSize: isMobile ? 10 : 12,
          wordBreak: "break-word",
          whiteSpace: "normal",
          textAlign: "center",
        },
      },
    },
  };



  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <header className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded mb-4 md:mb-6">
        <h1 className="text-[20px] md:text-3xl font-bold"> {t("supplier_dashboard.title")}</h1>
      </header>

      {/* 🔹 Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4 md:mb-6">
        <Card>
          <Statistic
            title={t("supplier_dashboard.total_orders")}
            value={
              (dashboardData?.totalFuelRequests || 0) +
              (dashboardData?.totalFuelSupplyOrders || 0)
            }
          />
        </Card>
        <Card>
          <Statistic
            title={t("supplier_dashboard.pending_orders")}
            value={dashboardData?.pendingRequests || 0}
            valueStyle={{ color: "#faad14" }}
          />
        </Card>
        <Card>
          <Statistic
            title={t("supplier_dashboard.approved_orders")}
            value={dashboardData?.approvedRequests || 0}
            valueStyle={{ color: "#52c41a" }}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 md:mb-6">
        {/* Card 1: Yêu Cầu Thu Nguyên Liệu */}
        <Card
          title={t("supplier_dashboard.request_title")}
          bordered={false}
          className="shadow-md rounded-lg"
        >
          <p className="text-gray-600 mb-2">{t("supplier_dashboard.total")}</p>
          <h2 className="text-3xl font-bold mb-4">
            {dashboardData?.fuelRequests?.total || 0}
          </h2>

          <ul className="space-y-2">
            <li
              onClick={() => handleCardClick("request", "Chờ duyệt")}
              className="text-yellow-500 cursor-pointer hover:underline"
            >
              🕒 {t("status.pending")}:{" "}
              <strong>{dashboardData?.fuelRequests?.pending || 0}</strong>
            </li>
            <li
              onClick={() => handleCardClick("request", "Đã duyệt")}
              className="text-green-600 cursor-pointer hover:underline"
            >
              ✅ {t("status.approve")}:{" "}
              <strong>{dashboardData?.fuelRequests?.approved || 0}</strong>
            </li>
            <li
              onClick={() => handleCardClick("request", "Hoàn thành")}
              className="text-blue-500 cursor-pointer hover:underline"
            >
              🏁 {t("status.completed")}:{" "}
              <strong>{dashboardData?.fuelRequests?.completed || 0}</strong>
            </li>
          </ul>
        </Card>

        {/* Card 2: Yêu Cầu Cung Cấp Nguyên Liệu */}
        <Card
          title={t("supplier_dashboard.supply_title")}
          bordered={false}
          className="shadow-md rounded-lg"
        >
          <p className="text-gray-600 mb-2">{t("supplier_dashboard.total")}</p>
          <h2 className="text-3xl font-bold mb-4">
            {dashboardData?.fuelSupplyOrders?.total || 0}
          </h2>

          <ul className="space-y-2">
            <li
              onClick={() => handleCardClick("supply", "Chờ duyệt")}
              className="text-yellow-500 cursor-pointer hover:underline"
            >
              🕒 {t("status.pending")}:{" "}
              <strong>{dashboardData?.fuelSupplyOrders?.pending || 0}</strong>
            </li>
            <li
              onClick={() => handleCardClick("supply", "Đã duyệt")}
              className="text-green-600 cursor-pointer hover:underline"
            >
              ✅ {t("status.approve")}:{" "}
              <strong>{dashboardData?.fuelSupplyOrders?.approved || 0}</strong>
            </li>
            <li
              onClick={() => handleCardClick("supply", "Hoàn thành")}
              className="text-blue-500 cursor-pointer hover:underline"
            >
              🏁 {t("status.completed")}:{" "}
              <strong>{dashboardData?.fuelSupplyOrders?.completed || 0}</strong>
            </li>
          </ul>
        </Card>
      </div>

      {/* 🔹 Biểu đồ đơn hàng theo trạng thái */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-4 md:mb-6">
        <h2 className="text-xl font-semibold mb-2 md:mb-4">
          {t("supplier_dashboard.status_chart_title")}
        </h2>
        <Column {...chartConfig} />
      </div>

      {/* 🔹 Danh sách đơn hàng gần đây */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* 🔘 Bộ lọc thời gian */}
        <div className="flex justify-center mb-4 space-x-2">
          <button
            className={`text-[10px] sm:text-base px-2 py-1 sm:px-4 sm:py-2 rounded-l whitespace-nowrap ${filterType === "day"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
              }`}
            onClick={() => setFilterType("day")}
          >
            {t("dashboard.filter_day")}
          </button>

          <button
            className={`text-[10px] sm:text-base px-2 py-1 sm:px-4 sm:py-2 whitespace-nowrap ${filterType === "week"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
              }`}
            onClick={() => setFilterType("week")}
          >
            {t("dashboard.filter_week")}
          </button>
          <button
            className={`text-[10px] sm:text-base px-2 py-1 sm:px-4 sm:py-2 rounded-r whitespace-nowrap ${filterType === "month"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
              }`}
            onClick={() => setFilterType("month")}
          >
            {t("dashboard.filter_month")}
          </button>
        </div>
        <h2 className="text-xl font-semibold mb-4">
          {t("supplier_dashboard.recent_orders")}
        </h2>
        <Table
          columns={[
            { title: t("table.order_id"), dataIndex: "_id", key: "_id" },
            {
              title: t("table.type"),
              dataIndex: "receipt_type",
              key: "receipt_type",
              render: (type) =>
                type === "supply"
                  ? t("table.supply_order")
                  : t("table.fuel_request"),
            },
            {
              title: t("table.supplier"),
              dataIndex: ["supplier_id", "full_name"],
              key: "supplier_id",
            },
            { title: t("table.status"), dataIndex: "status", key: "status" },
            {
              title: t("table.quantity"),
              dataIndex: "quantity",
              key: "quantity",
            },
            {
              title: t("table.created_at"),
              dataIndex: "createdAt",
              key: "createdAt",
              render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
            },
          ]}
          dataSource={combinedOrders}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
          scroll={{ x: "max-content" }}
        />
      </div>
    </div>
  );
};

export default DashboardSupplierOrder;
