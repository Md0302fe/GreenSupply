import React, { useEffect, useState } from "react";
import { Card, Statistic, Table, message, Spin, Alert } from "antd";
import axios from "axios";
import { useSelector } from "react-redux";
import { Pie } from "@ant-design/plots";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Column } from "@ant-design/plots";

const DashboardFuel = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [fuelSummary, setFuelSummary] = useState(null);
  const [fuelTypes, setFuelTypes] = useState([]);
  const [fuelHistory, setFuelHistory] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  const userRedux = useSelector((state) => state.user);
  const token = userRedux?.access_token || localStorage.getItem("access_token");
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryRes, fuelTypesRes, historyRes, alertsRes] =
        await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/fuel/dashboard/summary`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(
            `${process.env.REACT_APP_API_URL}/fuel/dashboard/fuel-types`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          axios.get(`${process.env.REACT_APP_API_URL}/fuel/dashboard/history`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/fuel/dashboard/alerts`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      if (summaryRes.data.success) setFuelSummary(summaryRes.data);
      if (fuelTypesRes.data.success) setFuelTypes(fuelTypesRes.data.fuelData);
      if (historyRes.data.success) setFuelHistory(historyRes.data.history);
      if (alertsRes.data.success) setLowStock(alertsRes.data.lowStock);
    } catch (error) {
      console.error("❌ Lỗi khi gọi API:", error);
      message.error(t("material_dashboard.errorLoading"));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const historyColumns = [
    { title: t("material_dashboard.date"), dataIndex: "date", key: "date" },
    {
      title: t("material_dashboard.fuelType"),
      dataIndex: "fuelType",
      key: "fuelType",
    },
    {
      title: t("material_dashboard.quantity"),
      dataIndex: "quantity",
      key: "quantity",
      render: (text) => <span className="font-bold">{text}</span>,
    },
    {
      title: t("material_dashboard.status"),
      dataIndex: "type",
      key: "type",
      render: (text) => (
        <span
          style={{
            color: text === "Nhập kho" ? "#4CAF50" : "#FF5722",
            fontWeight: "bold",
          }}
        >
          {t(`material_dashboard.${text}`)}
        </span>
      ),
    },
  ];

  const historyData = fuelHistory.map((entry, index) => ({
    key: index,
    date: moment(entry.timestamp).format("DD/MM/YYYY"),
    fuelType: entry.type || "Không xác định",
    quantity: Math.abs(entry.quantity),
    type: entry.action === "Nhập kho" ? "import" : "export",
  }));

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

  const pieData = fuelTypes
    .map((item) => ({
      type:
        item.type && typeof item.type === "string"
          ? item.type.trim()
          : "Không xác định",
      value: Number(item.value) || 0,
    }))
    .filter((item) => item.type !== "Không xác định" && item.value > 0);

  const pieConfig = {
    data: pieData,
    angleField: "value",
    colorField: "type",
    radius: 0.9,
    height: isMobile ? 240 : 400,
  };

  // Dữ liệu biểu đồ cột
  const boxBarData = Object.entries(
    fuelSummary?.boxCategory?.typeBreakdown || {}
  ).map(([type, quantity]) => ({
    type,
    quantity,
  }));

  const barConfig = {
    data: boxBarData,
    xField: "type", // Phân loại theo loại bao bì
    yField: "quantity", // Số lượng
    color: ({ type }) => {
      // Màu sắc tùy theo loại
      if (type === "túi chân không") return "#1677ff";
      if (type === "thùng carton") return "#13c2c2";
      return "#bfbfbf";
    },
    label: {
      position: "top",
      style: {
        fontSize: isMobile ? 10 : 12,
      },
    },
    columnWidthRatio: isMobile ? 0.3 : 0.6,
    height: isMobile ? 220 : 400,
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
  // 🔍 Tổng hợp cho Card thứ 3
  const past7days = fuelHistory.filter((entry) =>
    moment(entry.timestamp).isAfter(moment().subtract(7, "days"))
  );

  const maxFuel = pieData.reduce(
    (prev, curr) => (curr.value > prev.value ? curr : prev),
    { type: "", value: 0 }
  );

  const mostCritical = lowStock.length
    ? lowStock.reduce((a, b) => (a.quantity < b.quantity ? a : b))
    : null;

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <header className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white p-6 rounded mb-4 md:mb-6">
        <h1 className="text-[20px] md:text-3xl font-bold">
          {t("material_dashboard.title")}
        </h1>
      </header>

      {loading ? (
        <Spin
          size="large"
          className="flex justify-center items-center w-full h-full"
        />
      ) : (
        <>
          {/* 🔹 Thống kê tổng quan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-4 md:mb-6">
            {/* Thẻ 1: đã có hoverable */}
            <Card
              hoverable
              className="transition-transform hover:scale-105 duration-300 shadow"
            >
              <div className="flex flex-col gap-2">
                {/* Dòng 1: Tổng số loại nhiên liệu */}
                <div
                  onClick={() => navigate("/system/admin/fuel-list")}
                  className="cursor-pointer hover:underline"
                >
                  <Statistic
                    title={
                      <span className="flex items-center gap-1">
                        🌿{" "}
                        <span className="font-medium">
                          {t("material_dashboard.totalFuelTypes")}
                        </span>
                      </span>
                    }
                    value={fuelSummary?.fuel?.totalFuelTypes || 0}
                  />
                </div>

                {/* Dòng 2: Tổng số loại bao bì */}
                <div
                  onClick={() => navigate("/system/admin/box-categories/list")}
                  className="cursor-pointer hover:underline pb-1 text-gray-600"
                >
                  <Statistic
                    title={
                      <span className="flex items-center gap-1">
                        📦{" "}
                        <span className="font-medium">
                          {t("material_dashboard.totalBoxCategories")}
                        </span>
                      </span>
                    }
                    value={fuelSummary?.boxCategory?.totalBoxCategories || 0}
                  />
                </div>
              </div>
            </Card>
            {/* Thẻ 2: thêm hoverable + hiệu ứng */}
            <Card
              hoverable
              className="transition-transform hover:scale-105 duration-300 shadow"
            >
              <Statistic
                title={
                  <span className="flex items-center gap-1">
                    <span style={{ fontSize: 18, color: "#1f2937" }}>📦</span>
                    <span className="font-medium">
                      {t("material_dashboard.totalFuelQuantity")}
                    </span>
                  </span>
                }
                value={fuelSummary?.fuel?.totalFuelQuantity || 0}
                suffix="Kg"
              />
            </Card>

            {/* Thẻ 3: tổng quan nhanh cũng thêm hoverable */}
            <Card
              hoverable
              className="transition-transform hover:scale-105 duration-300 shadow"
            >
              <h3 className="text-base font-semibold mb-2 flex items-center gap-1">
                📈 {t("material_dashboard.quickOverview")}
              </h3>
              <div className="text-sm text-gray-800 leading-6 space-y-3">
                <div className="flex items-center gap-2">
                  🔁{" "}
                  <span className="text-blue-600 font-bold text-lg">
                    {past7days.length}
                  </span>{" "}
                  {t("material_dashboard.recentTransactions")}
                </div>
                <div className="flex items-center gap-2">
                  🥭 {t("material_dashboard.mostAvailable")}:{" "}
                  <span className="font-bold text-yellow-600">
                    {maxFuel.type} ({maxFuel.value} Kg)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  ⛔ {t("material_dashboard.lowStock")}:{" "}
                  {mostCritical ? (
                    <span className="font-bold text-red-500">
                      {mostCritical.fuel_type} ({mostCritical.quantity} Kg)
                    </span>
                  ) : (
                    <span className="text-gray-600 italic">
                      {t("material_dashboard.noLowStock")}
                    </span>
                  )}
                </div>
              </div>
            </Card>
            <Card
              hoverable
              className="transition-transform hover:scale-105 duration-300 shadow"
            >
              <h3 className="text-base font-semibold mb-2 flex items-center gap-1">
                🧾 {t("material_dashboard.packagingStats")}
              </h3>
              <div className="text-sm text-gray-800 leading-6 space-y-2">
                <div>
                  🟢 {t("material_dashboard.active")}:{" "}
                  <strong>
                    {fuelSummary?.boxCategory?.activeBoxCategories || 0}
                  </strong>
                </div>
                <div>
                  🔴 {t("material_dashboard.inactive")}:{" "}
                  <strong>
                    {fuelSummary?.boxCategory?.inactiveBoxCategories || 0}
                  </strong>
                </div>
                <div>
                  🏆 {t("material_dashboard.maxStock")}:{" "}
                  <strong>
                    {fuelSummary?.boxCategory?.maxStockBoxCategory?.name} (
                    {fuelSummary?.boxCategory?.maxStockBoxCategory?.quantity})
                  </strong>
                </div>
                <div>
                  ⚠️ {t("material_dashboard.minStock")}:{" "}
                  <strong>
                    {fuelSummary?.boxCategory?.minStockBoxCategory?.name} (
                    {fuelSummary?.boxCategory?.minStockBoxCategory?.quantity})
                  </strong>
                </div>
              </div>
            </Card>
          </div>
          {/* Biểu đồ tròn: phân bổ nguyên liệu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 md:mb-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">
                📊 {t("material_dashboard.fuelDistribution")}
              </h2>
              {pieData.length > 0 ? (
                <Pie {...pieConfig} />
              ) : (
                <Alert message={t("material_dashboard.noChartData")} type="info" />
              )}
            </div>

            {/* Biểu đồ cột: tổng bao bì theo loại */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">
                📦 {t("material_dashboard.packagingDistribution")}
              </h2>
              {boxBarData.length > 0 ? (
                <Column {...barConfig} />
              ) : (
                <Alert message={t("material_dashboard.noPackagingData")} type="info" />
              )}
            </div>
          </div>

          {/* 🔹 Danh sách lịch sử nhập/xuất nguyên liệu */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-4 md:mb-6">
            <h2 className="text-[18px] md:text-xl font-semibold mb-4">
              📜 {t("material_dashboard.historyTitle")}
            </h2>
            {historyData.length > 0 ? (
              <Table
                columns={historyColumns}
                dataSource={historyData}
                pagination={{ pageSize: 5 }}
                scroll={{ x: "max-content" }}
              />
            ) : (
              <Alert message={t("material_dashboard.noHistory")} type="info" />
            )}
          </div>

          {/* 🔹 Cảnh báo nguyên liệu sắp hết */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-4 md:mb-6">
            <h2 className="text-[18px] md:text-xl font-semibold mb-4">
              ⚠️ {t("material_dashboard.warningTitle")}
            </h2>
            <Table
              columns={[
                {
                  title: t("material_dashboard.fuelType"),
                  dataIndex: "fuel_type",
                  key: "fuel_type",
                },
                {
                  title: t("material_dashboard.quantity"),
                  dataIndex: "quantity",
                  key: "quantity",
                },
                {
                  title: t("material_dashboard.status"),
                  dataIndex: "warning",
                  key: "warning",
                  render: (text) => (
                    <span className="text-red-500">
                      {text === "Sắp hết nhiên liệu!"
                        ? t("material_dashboard.warningAlmostEmpty")
                        : text === "Hết nhiên liệu!"
                        ? t("material_dashboard.warningEmpty")
                        : text}
                    </span>
                  ),
                },
              ]}
              dataSource={lowStock}
              loading={loading}
              rowKey="_id"
              pagination={{ pageSize: 5 }}
              scroll={{ x: "max-content" }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardFuel;
