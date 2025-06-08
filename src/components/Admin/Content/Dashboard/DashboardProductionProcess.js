import React, { useEffect, useState } from "react";
import { Card, Statistic, message } from "antd";
import { useSelector } from "react-redux";
import axios from "axios";
import { Column } from "@ant-design/plots";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const DashboardProductionProcess = () => {
  const { t } = useTranslation();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const userRedux = useSelector((state) => state.user);
  const token = userRedux?.access_token || localStorage.getItem("access_token");
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/production-processing/dashboard`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        setDashboardData(res.data.data);
      } else {
        message.error("Không thể lấy dữ liệu dashboard!");
      }
    } catch (error) {
      console.error("Lỗi dashboard:", error);
      message.error("Lỗi khi lấy dữ liệu dashboard!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCardClick = (status) => {
    if (status === "Chờ duyệt") {
      navigate("/system/admin/production-processing");
    } else if (status === "Đang sản xuất") {
      navigate("/system/admin/production-processing-list");
    } else if (status === "Hoàn thành") {
      navigate(
        `/system/admin/production-processing-list?status=${encodeURIComponent(
          status
        )}`
      );
    }
  };

  const chartData = [
    { type: t("status.pending"), value: dashboardData?.waiting || 0 },
    { type: t("status.processing"), value: dashboardData?.processing || 0 },
    { type: t("status.completed"), value: dashboardData?.done || 0 },
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
      if (type === "Đang sản xuất") return "#1890ff";
      if (type === "Hoàn thành") return "#52c41a";
      return "#ccc";
    },
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <header className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6 rounded mb-6">
        <h1 className="text-3xl font-bold">{t("dashboardProduction.title")}</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card
          loading={loading}
          onClick={() => handleCardClick("Chờ duyệt")}
          className="cursor-pointer hover:shadow-xl transition"
        >
          <Statistic
            title={
              <span className="flex items-center gap-2 text-gray-600 text-sm">
                📝 <span>{t("status.pending")}</span>
              </span>
            }
            value={dashboardData?.waiting || 0}
            valueStyle={{ color: "#faad14", fontSize: "24px" }}
          />
        </Card>

        <Card
          loading={loading}
          onClick={() => handleCardClick("Đang sản xuất")}
          className="cursor-pointer hover:shadow-xl transition"
        >
          <Statistic
            title={
              <span className="flex items-center gap-2 text-gray-600 text-sm">
                ⚙️ <span>{t("status.processing")}</span>
              </span>
            }
            value={dashboardData?.processing || 0}
            valueStyle={{ color: "#1890ff", fontSize: "24px" }}
          />
        </Card>

        <Card
          loading={loading}
          onClick={() => handleCardClick("Hoàn thành")}
          className="cursor-pointer hover:shadow-xl transition"
        >
          <Statistic
            title={
              <span className="flex items-center gap-2 text-gray-600 text-sm">
                ✅ <span>{t("status.completed")}</span>
              </span>
            }
            value={dashboardData?.done || 0}
            valueStyle={{ color: "#52c41a", fontSize: "24px" }}
          />
        </Card>
      </div>

      {/* 🔷 Biểu đồ trạng thái quy trình */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          {t("dashboardProduction.chartTitle")}
        </h2>
        <Column {...chartConfig} />
      </div>
    </div>
  );
};

export default DashboardProductionProcess;
