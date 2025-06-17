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

  const chartData = [
    {
    status: isMobile ? t("status.pending").replace(" ", "\n") : t("status.pending"),
    count: dashboardData?.waiting || 0,
  },
  {
    status: isMobile ? t("status.processing").replace(" ", "\n") : t("status.processing"),
    count: dashboardData?.processing || 0,
  },
  {
    status: isMobile ? t("status.completed").replace(" ", "\n") : t("status.completed"),
    count: dashboardData?.done || 0,
  },
  ];

  const chartConfig = {
  data: chartData,
  xField: "status",
  yField: "count",
  color: ({ status }) => {
    const raw = status.replace("\n", " ");
    if (raw === "Chờ duyệt") return "#faad14";
    if (raw === "Đang sản xuất") return "#1890ff";
    if (raw === "Hoàn thành") return "#52c41a";
    return "#ccc";
  },
  label: {
    position: "top",
    style: {
      fontSize: isMobile ? 10 : 12,
    },
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
      <header className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6 rounded mb-4 md:mb-6">
        <h1 className="text-[18px] md:text-3xl font-bold">{t("dashboardProduction.title")}</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4 md:mb-6">
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
