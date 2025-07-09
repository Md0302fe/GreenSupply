import React, { useEffect, useState } from "react";
import { Progress, Table, Card, Statistic, message } from "antd";
import axios from "axios";
import { useSelector } from "react-redux";
import { Pie, Column } from "@ant-design/plots";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  InboxOutlined,
  ExportOutlined,
  FileSyncOutlined,
  HomeOutlined,
  BarChartOutlined,
  FileAddOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";

import moment from "moment";

const DashboardWarehouse = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [storage, setStorage] = useState({
    name_storage: "Không có dữ liệu",
    capacity: 0,
    remaining_capacity: 0,
  });
  const [receipts, setReceipts] = useState([]);
  const [stats, setStats] = useState({
    totalReceipts: 0,
    pendingReceipts: 0,
    approvedReceipts: 0,
  });
  const [exportStats, setExportStats] = useState({
    totalExports: 0,
    completedExports: 0,
    pendingExports: 0,
    exportReceipts: [],
  });

  const statusMap = {
    "Chờ duyệt": "pending",
    "Đã duyệt": "approve",
    "Đã huỷ": "cancelled",
    "Đã hủy": "cancelled",
    "Hoàn Thành": "completed",
    "Đang xử lý": "processing",
    "thất bại": "failed",
    "Vô hiệu hóa": "disable",
    "Nhập kho thành công": "imported",
  };

  const [filterType, setFilterType] = useState("day"); // "day", "week", "month"

  //  Lấy token từ Redux hoặc localStorage
  const userRedux = useSelector((state) => state.user);
  const token = userRedux?.access_token || localStorage.getItem("access_token");

  //  Gọi API lấy dữ liệu kho + đơn nhập kho gần đây
  const fetchWarehouseData = async () => {
    // setLoading(true);
    try {
      if (!token) {
        message.error(t("dashboardWarehouse.notLoggedIn"));
        return;
      }

      console.log("🔍 Gửi request từ Dashboard với token:", token);

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/fuel-storage/getAll`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log(" API Response:", response.data);

      if (response.data.success) {
        let allReceipts = response.data.data;

        if (allReceipts.length > 0) {
          console.log(" Danh sách đơn nhập kho từ API:", allReceipts);

          // ✅ Chuyển `createdAt` về Date object
          allReceipts = allReceipts.map((receipt) => ({
            ...receipt,
            createdAt: new Date(receipt.createdAt),
          }));

          // ✅ Xác định thời gian lọc dựa vào filterType
          const now = new Date();
          let startDate;

          if (filterType === "day") {
            // 🔹 Lấy từ đầu ngày hôm nay
            startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
          } else if (filterType === "week") {
            // 🔹 Lấy từ ngày hiện tại - 7 ngày
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            startDate.setHours(0, 0, 0, 0);
          } else if (filterType === "month") {
            // 🔹 Lấy từ ngày hiện tại - 30 ngày
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 30);
            startDate.setHours(0, 0, 0, 0);
          }

          console.log("📌 Thời gian lọc startDate:", startDate.toISOString());
          // ✅ Tìm đơn nhập kho đầu tiên có storage_id hợp lệ
          const validStorageReceipt = allReceipts.find(
            (receipt) => receipt.storage_id !== null
          );
          if (validStorageReceipt) {
            const storageId = validStorageReceipt.storage_id?._id; // ✅ Lấy ID kho
            console.log("📌 ID kho hợp lệ:", storageId);

            if (storageId) {
              const storageDetails = await fetchStorageById(storageId); // 🔥 Gọi API mới
              if (storageDetails) {
                setStorage({
                  name_storage:
                    storageDetails.name_storage || "Chưa có tên kho",
                  capacity: storageDetails.capacity || 0, // ✅ Dữ liệu từ API
                  remaining_capacity: storageDetails.remaining_capacity || 0,
                });
              } else {
                message.warning(t("dashboardWarehouse.noStorageInfo"));
              }
            }
          } else {
            console.warn(
              "⚠️ Không tìm thấy đơn nhập kho nào có `storage_id` hợp lệ!"
            );
            message.warning(t("dashboardWarehouse.noReceipts"));
          }

          // Lọc đơn nhập kho theo khoảng thời gian
          const filteredReceipts = allReceipts.filter((receipt) => {
            return receipt.createdAt >= startDate;
          });

          console.log("📌 Đơn nhập kho sau khi lọc:", filteredReceipts);

          //  Cập nhật dữ liệu hiển thị
          setStats({
            totalReceipts: filteredReceipts.length,
            pendingReceipts: filteredReceipts.filter(
              (r) => r.status === "Chờ duyệt"
            ).length,
            // approvedReceipts: filteredReceipts.filter(
            //   (r) => r.status === "Đã duyệt"
            // ).length,
            importedReceipts: filteredReceipts.filter(
              (r) => r.status === "Nhập kho thành công"
            ).length,
          });

          setReceipts(filteredReceipts);
        } else {
          message.warning(t("dashboardWarehouse.noReceipts"));
        }
      } else {
        throw new Error("Dữ liệu API không hợp lệ");
      }
    } catch (error) {
      console.error("❌ Lỗi API:", error);
      message.error(t("dashboardWarehouse.serverError"));
    }
    // setLoading(false);
  };

  const fetchExportData = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/material-storage-export/getAllRawMaterialBatch`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        let allExports = res.data.exports.map((exp) => ({
          ...exp,
          createdAt: new Date(exp.createdAt),
        }));

        //  Xác định khoảng lọc theo filterType
        const now = new Date();
        let startDate = new Date();
        if (filterType === "week") {
          startDate.setDate(now.getDate() - 7);
        } else if (filterType === "month") {
          startDate.setDate(now.getDate() - 30);
        } else {
          startDate.setHours(0, 0, 0, 0);
        }

        //  Lọc theo thời gian
        const filtered = allExports.filter((exp) => exp.createdAt >= startDate);

        //  Lọc trạng thái
        const completed = filtered.filter((exp) => exp.status === "Hoàn thành");
        const pending = filtered.filter((exp) => exp.status === "Chờ duyệt");

        //  Cập nhật dữ liệu
        setExportStats({
          totalExports: filtered.length,
          completedExports: completed.length,
          pendingExports: pending.length,
          exportReceipts: filtered
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 5),
        });

        console.log(" Đơn xuất kho sau khi lọc:", filtered.length);
      }
    } catch (err) {
      console.error(" Lỗi khi lấy dữ liệu xuất kho:", err);
      message.error("Không thể tải dữ liệu đơn xuất kho");
    }
  };

  useEffect(() => {
    console.log(" Gọi API đồng thời với bộ lọc:", filterType);

    const runParallelFetch = async () => {
      setLoading(true);
      await Promise.all([fetchWarehouseData(), fetchExportData()]);
      setLoading(false);
    };

    runParallelFetch();
  }, [filterType]);

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

  const fetchStorageById = async (storageId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/fuel-storage/storage/${storageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data.success ? res.data.data : null;
    } catch (error) {
      console.error("❌ Lỗi khi lấy kho:", error);
      return null;
    }
  };
  //  Tính phần trăm sức chứa kho
  const usagePercent =
    storage.capacity > 0
      ? ((storage.capacity - storage.remaining_capacity) / storage.capacity) *
        100
      : 0;

  //  Làm tròn số phần trăm hiển thị
  const formattedUsagePercent = usagePercent.toFixed(2); // Giữ 2 số sau dấu thập phân

  // Cấu hình biểu đồ cột cho thống kê đơn nhập kho
  const receiptsChartData = [
    {
      status: isMobile
        ? t("supplier_dashboard.total_orders").replace(" ", "\n")
        : t("supplier_dashboard.total_orders"),
      count: stats.totalReceipts,
    },
    {
      status: isMobile
        ? t("status.pending").replace(" ", "\n")
        : t("status.pending"),
      count: stats.pendingReceipts,
    },
    // {
    //   status: isMobile
    //     ? t("status.approve").replace(" ", "\n")
    //     : t("status.approve"),
    //   count: stats.approvedReceipts,
    // },
    {
      status: isMobile
        ? t("status.imported").replace(" ", "\n")
        : t("status.imported"),
      count: stats.importedReceipts || 0,
    },
  ];

  const receiptsChartConfig = {
    data: receiptsChartData,
    xField: "status",
    yField: "count",
    color: ({ status }) => {
      const raw = status.replace("\n", " ");
      if (raw === "Chờ duyệt") return "#faad14";
      if (raw === "Nhập kho thành công") return "#52c41a";
      return "#1890ff";
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

  // ✅ Cấu hình biểu đồ cột cho đơn xuất kho
  const exportsChartData = [
    {
      status: isMobile ? "Tổng đơn\nxuất kho" : "Tổng đơn xuất kho",
      count: exportStats.totalExports,
    },
    {
      status: isMobile ? "Chờ\nduyệt" : "Chờ duyệt",
      count: exportStats.pendingExports,
    },
    {
      status: isMobile ? "Hoàn\nthành" : "Hoàn thành",
      count: exportStats.completedExports,
    },
  ];

  const exportsChartConfig = {
    data: exportsChartData,
    xField: "status",
    yField: "count",
    color: ({ status }) => {
      const raw = status.replace("\n", " ");
      if (raw === "Hoàn thành") return "#52c41a";
      if (raw === "Chờ duyệt") return "#faad14";
      return "#1890ff";
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
    <div className="min-h-screen bg-gray-100 p-6">
      {/* 🟢 Header */}
      <header className="bg-gradient-to-r from-blue-500 to-teal-500 text-white p-6 shadow-lg mb-4 md:mb-6">
        <h1 className="text-[22px] md:text-4xl font-bold">
          {t("dashboardWarehouse.title")}
        </h1>
      </header>

      {/* 🟢 Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4 md:mb-6">
        {/* Tổng đơn nhập kho */}
        <Card
          className="transition-transform hover:scale-105 duration-300 shadow"
          onClick={() => navigate("/system/admin/warehouse-receipt")}
        >
          <Statistic
            title={
              <span>
                <InboxOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                Tổng đơn nhập kho
              </span>
            }
            value={stats.totalReceipts}
          />
        </Card>
        {/* Đơn xuất kho */}
        <Card
          className="transition-transform hover:scale-105 duration-300 shadow"
          onClick={() => navigate("/system/admin/material-storage-export-list")}
        >
          <Statistic
            title={
              <span>
                <ExportOutlined style={{ marginRight: 8, color: "#fa8c16" }} />
                Tổng đơn xuất kho
              </span>
            }
            value={exportStats.totalExports}
          />
        </Card>
        {/*Trạng thái đơn */}
        <Card>
          <Statistic
            title={
              <span>
                <FileSyncOutlined
                  style={{ marginRight: 8, color: "#52c41a" }}
                />
                Trạng thái đơn
              </span>
            }
            valueRender={() => (
              <div>
                <div>
                  Chờ duyệt:{" "}
                  <b style={{ color: "#faad14" }}>
                    {stats.pendingReceipts + exportStats.pendingExports}
                  </b>
                </div>
                <div>
                  Đã xuất kho:{" "}
                  <b style={{ color: "#52c41a" }}>
                    {exportStats.completedExports}
                  </b>
                </div>
              </div>
            )}
          />
        </Card>
      </div>

      {/* 🟢 Thông tin kho */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-4 md:mb-6">
        <h2 className="text-xl font-semibold mb-4">
          <HomeOutlined className="mr-2 text-blue-500" />
          {t("dashboardWarehouse.storageInfo")}: {storage.name_storage}
        </h2>
        <Progress percent={formattedUsagePercent} status="active" />
        <p className="mt-2 text-gray-600">
          {storage.capacity - storage.remaining_capacity} / {storage.capacity}{" "}
          {t("dashboardWarehouse.used")}
        </p>
      </div>

      {/* 🟢 Biểu đồ cột thống kê nhập & xuất kho */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 md:mb-6">
        {/* Biểu đồ nhập kho */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            <BarChartOutlined className="mr-2 text-purple-500" />
            {t("dashboardWarehouse.statsChartTitle")}
          </h2>
          <Column {...receiptsChartConfig} />
        </div>
        {/* Biểu đồ xuất kho */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            <BarChartOutlined className="mr-2 text-purple-500" />
            Thống kê đơn xuất kho
          </h2>
          <Column {...exportsChartConfig} />
        </div>
      </div>

      {/* 🟢 Danh sách đơn nhập kho gần đây */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-4">
        {/* Nút chọn lọc theo Ngày / Tuần / Tháng */}
        <div className="flex justify-center mb-4 space-x-2">
          <button
            className={`text-[10px] sm:text-base px-2 py-1 sm:px-4 sm:py-2 rounded-l whitespace-nowrap ${
              filterType === "day"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setFilterType("day")}
          >
            {t("dashboard.filter_day")}
          </button>

          <button
            className={`text-[10px] sm:text-base px-2 py-1 sm:px-4 sm:py-2 whitespace-nowrap ${
              filterType === "week"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setFilterType("week")}
          >
            {t("dashboard.filter_week")}
          </button>
          <button
            className={`text-[10px] sm:text-base px-2 py-1 sm:px-4 sm:py-2 rounded-r whitespace-nowrap ${
              filterType === "month"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setFilterType("month")}
          >
            {t("dashboard.filter_month")}
          </button>
        </div>

        <h2 className="text-xl font-semibold mb-4">
          <FileAddOutlined className="mr-2 text-blue-600" />
          {t("dashboardWarehouse.recentReceipts")}
        </h2>

        <Table
          columns={[
            {
              title: t("dashboardWarehouse.columns.id"),
              dataIndex: "_id",
              key: "_id",
              width: 150,
            },
            {
              title: (
                <div className="text-center">
                  {t("dashboardWarehouse.columns.manager")}
                </div>
              ),
              dataIndex: ["manager_id", "full_name"],
              key: "manager_id",
              align: "center",
              className: "text-center",
            },
            // {
            //   title: (
            //     <div className="text-center">
            //       {t("dashboardWarehouse.columns.status")}
            //     </div>
            //   ),
            //   dataIndex: "status",
            //   key: "status",
            //   align: "center",
            //   className: "text-center",
            //   render: (status) => t(`status.${statusMap[status]}`) || status,
            // },
            {
              title: (
                <div className="text-center">
                  {t("dashboardWarehouse.columns.quantity")}
                </div>
              ),
              dataIndex: "quantity",
              key: "quantity",
              align: "center",
              className: "text-center",
            },
            {
              title: (
                <div className="text-center">
                  {t("dashboardWarehouse.columns.createdAt")}
                </div>
              ),
              dataIndex: "createdAt",
              key: "createdAt",
              align: "center",
              className: "text-center",
              render: (date) =>
                date
                  ? moment(date).format("DD/MM/YYYY HH:mm")
                  : t("dashboardWarehouse.noData"),
            },
          ]}
          dataSource={receipts}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
          scroll={{ x: "max-content" }}
        />
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md  mb-4">
        <h2 className="text-xl font-semibold mb-4 mt-8">
          <FileDoneOutlined className="mr-2 text-green-600" />
          Đơn xuất kho 
        </h2>

        <Table
          columns={[
            {
              title: "Mã đơn",
              dataIndex: "_id",
              key: "_id",
              width: 150,
            },
            {
              title: "Người tạo",
              dataIndex: ["user_id", "full_name"],
              key: "user_id",
              align: "center",
            },
            {
              title: "Lô nguyên liệu",
              dataIndex: ["batch_id", "batch_name"],
              key: "batch_id",
              align: "center",
            },
            // {
            //   title: "Trạng thái",
            //   dataIndex: "status",
            //   key: "status",
            //   align: "center",
            // },
            {
              title: "Ngày tạo",
              dataIndex: "createdAt",
              key: "createdAt",
              align: "center",
              render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
            },
          ]}
          dataSource={exportStats.exportReceipts}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
          scroll={{ x: "max-content" }}
        />
      </div>
    </div>
  );
};

export default DashboardWarehouse;
