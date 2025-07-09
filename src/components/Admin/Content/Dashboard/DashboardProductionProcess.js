import React, { useEffect, useState } from "react";
import { Card, Statistic, message } from "antd";
import { useSelector } from "react-redux";
import axios from "axios";
import { Column } from "@ant-design/plots";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Table } from "antd";
const DashboardProductionProcess = () => {
  const { t } = useTranslation();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const userRedux = useSelector((state) => state.user);
  const token = userRedux?.access_token || localStorage.getItem("access_token");
  const navigate = useNavigate();
  const [latestPlans, setLatestPlans] = useState([]);
  const [summaryStats, setSummaryStats] = useState({});

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
        setLatestPlans(res.data.data.latestPlans || []);
        setSummaryStats({
          executingSingle: res.data.data.executingSingle,
          executingConsolidate: res.data.data.executingConsolidate,
          totalSingleProcess: res.data.data.totalSingleProcess,
          totalConsolidateProcess: res.data.data.totalConsolidateProcess,
          totalProductionPlans: res.data.data.totalProductionPlans,
          waitingToCreate: res.data.data.plansWaitingProcessCreate?.length || 0,
        });
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
      status: isMobile
        ? t("status.pending").replace(" ", "\n")
        : t("status.pending"),
      count: dashboardData?.waiting || 0,
    },
    {
      status: isMobile
        ? t("status.processing").replace(" ", "\n")
        : t("status.processing"),
      count: dashboardData?.processing || 0,
    },
    {
      status: isMobile
        ? t("status.completed").replace(" ", "\n")
        : t("status.completed"),
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

  const columns = [
    {
      title: "Tên kế hoạch",
      dataIndex: "request_name",
      key: "request_name",
      render: (text) => <span className="font-medium text-700">{text}</span>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) =>
        new Date(date).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colorMap = {
          "Chờ duyệt": "#faad14",
          "Đã duyệt": "#1890ff",
          "Đang sản xuất": "#1890ff",
          "Hoàn thành": "#52c41a",
        };
        return (
          <span style={{ color: colorMap[status] || "#000", fontWeight: 600 }}>
            {status}
          </span>
        );
      },
    },
  ];
  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <header className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6 rounded mb-4 md:mb-6">
        <h1 className="text-[18px] md:text-3xl font-bold">
          {t("dashboardProduction.title")}
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 md:mb-6">
        {/* Card 1: Trạng thái chính */}
        {/* <Card loading={loading} className="shadow-md">
          <Statistic
            title={<div className="text-lg font-bold text-gray-800">Trạng Thái Sản Xuất</div>}
            valueRender={() => (
              <div className="grid gap-4 text-gray-700">
                <div>
                  <div className="text-sm">📝 Quy Trình Chờ Duyệt</div>
                  <div className="text-xl font-semibold text-yellow-600">
                    {dashboardData?.waiting ?? 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm">⚙️ Quy Trình Đang Sản Xuất</div>
                  <div className="text-xl font-semibold text-blue-600">
                    {dashboardData?.processing ?? 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm">✅ Quy Trình Hoàn Thành</div>
                  <div className="text-xl font-semibold text-green-600">
                    {dashboardData?.done ?? 0}
                  </div>
                </div>
              </div>
            )}
          />
        </Card> */}

        {/* Card 2: Thực thi hiện tại + tổng kế hoạch */}
        <Card loading={loading} className="shadow-md">
          <Statistic
            title={
              <div className="text-lg font-bold text-gray-800">
                Hoạt động hiện tại
              </div>
            }
            valueRender={() => (
              <div className="grid gap-4 text-gray-700">
                <div>
                  <div
                    className="text-sm hover:text-blue-600 cursor-pointer transition"
                    onClick={() =>
                      navigate("/system/admin/production-request-list")
                    }
                  >
                    📄 Tổng Kế Hoạch Sản Xuất
                  </div>
                  <div className="text-xl font-semibold text-purple-600">
                    {summaryStats.totalProductionPlans}
                  </div>
                </div>
                <div>
                  <div
                    className="text-sm hover:text-blue-600 cursor-pointer transition"
                    onClick={() =>
                      navigate("/system/admin/processing-system?type=single")
                    }
                  >
                    🚀 Quy Trình Đơn Đang Thực Thi
                  </div>

                  <div className="text-xl font-semibold text-blue-600">
                    {summaryStats.executingSingle}
                  </div>
                </div>
                <div>
                  <div
                    className="text-sm hover:text-blue-600 cursor-pointer transition"
                    onClick={() =>
                      navigate(
                        "/system/admin/processing-system?type=consolidate"
                      )
                    }
                  >
                    🔄 Quy Trình Tổng Hợp Đang Thực Thi
                  </div>
                  <div className="text-xl font-semibold text-blue-600">
                    {summaryStats.executingConsolidate}
                  </div>
                </div>
              </div>
            )}
          />
        </Card>

        {/* Card 3: Tổng quy trình + kế hoạch chưa xử lý */}
        <Card loading={loading} className="shadow-md">
          <Statistic
            title={
              <div className="text-lg font-bold text-gray-800">
                Tổng hợp thống kê
              </div>
            }
            valueRender={() => (
              <div className="grid gap-4 text-gray-700">
                <div>
                  <div
                    className="text-sm hover:text-blue-600 cursor-pointer transition"
                    onClick={() =>
                      navigate(
                        "/system/admin/production-processing-list?type=single"
                      )
                    }
                  >
                    📦 Tổng Quy Trình Đơn Đã Tạo
                  </div>
                  <div className="text-xl font-semibold text-indigo-600">
                    {summaryStats.totalSingleProcess}
                  </div>
                </div>
                <div>
                  <div
                    className="text-sm hover:text-blue-600 cursor-pointer transition"
                    onClick={() =>
                      navigate(
                        "/system/admin/production-processing-list?type=consolidate"
                      )
                    }
                  >
                    📦 Tổng Quy Trình Tổng Hợp Đã Tạo
                  </div>

                  <div className="text-xl font-semibold text-indigo-600">
                    {summaryStats.totalConsolidateProcess}
                  </div>
                </div>
                <div>
                  <div
                    className="text-sm hover:text-blue-600 cursor-pointer transition"
                    onClick={() =>
                      navigate(
                        "/system/admin/production-processing?status=Đã duyệt"
                      )
                    }
                  >
                    ⏳ Kế Hoạch Chờ Tạo Quy Trình
                  </div>

                  <div className="text-xl font-semibold text-red-600">
                    {summaryStats.waitingToCreate}
                  </div>
                </div>
              </div>
            )}
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

      {/* 🔽 Bảng kế hoạch mới nhất */}
      <div className="bg-white p-6 mt-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          🆕 Các kế hoạch sản xuất gần đây
        </h2>
        <Table
          dataSource={latestPlans.map((plan, index) => ({
            ...plan,
            key: plan._id || index,
          }))}
          columns={columns}
          pagination={false}
          scroll={{ x: true }}
        />
      </div>
    </div>
  );
};

export default DashboardProductionProcess;
