import React, { useEffect, useState } from "react";
import { Progress, Table, Card, Statistic, message } from "antd";
import axios from "axios";
import { useSelector } from "react-redux";
import { Pie, Column } from "@ant-design/plots";

import moment from "moment";

const DashboardWarehouse = () => {
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

  const [filterType, setFilterType] = useState("day"); // "day", "week", "month"

  // ✅ Lấy token từ Redux hoặc localStorage
  const userRedux = useSelector((state) => state.user);
  const token = userRedux?.access_token || localStorage.getItem("access_token");



  // ✅ Gọi API lấy dữ liệu kho + đơn nhập kho gần đây
  const fetchWarehouseData = async () => {
    setLoading(true);
    try {
      if (!token) {
        message.error("Bạn chưa đăng nhập!");
        return;
      }

      console.log("🔍 Gửi request từ Dashboard với token:", token);

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/fuel-storage/getAll`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("📌 API Response:", response.data);

      if (response.data.success) {
        let allReceipts = response.data.data;

        if (allReceipts.length > 0) {
          console.log("📌 Danh sách đơn nhập kho từ API:", allReceipts);

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
                  name_storage: storageDetails.name_storage || "Chưa có tên kho",
                  capacity: storageDetails.capacity || 0,  // ✅ Dữ liệu từ API
                  remaining_capacity: storageDetails.remaining_capacity || 0,
                });
              } else {
                message.warning("Không tìm thấy thông tin kho!");
              }
            }
          }
           else {
            console.warn(
              "⚠️ Không tìm thấy đơn nhập kho nào có `storage_id` hợp lệ!"
            );
            message.warning(
              "Không tìm thấy thông tin kho từ danh sách đơn nhập kho!"
            );
          }


          // ✅ Lọc đơn nhập kho theo khoảng thời gian
          const filteredReceipts = allReceipts.filter((receipt) => {
            return receipt.createdAt >= startDate;
          });

          console.log("📌 Đơn nhập kho sau khi lọc:", filteredReceipts);

          // ✅ Cập nhật dữ liệu hiển thị
          setStats({
            totalReceipts: filteredReceipts.length,
            pendingReceipts: filteredReceipts.filter((r) => r.status === "Chờ duyệt").length,
            approvedReceipts: filteredReceipts.filter((r) => r.status === "Đã duyệt").length,
          });

          setReceipts(filteredReceipts);
        } else {
          message.warning("Không có dữ liệu đơn nhập kho!");
        }
      } else {
        throw new Error("Dữ liệu API không hợp lệ");
      }
    } catch (error) {
      console.error("❌ Lỗi API:", error);
      message.error("Không thể kết nối đến server!");
    }
    setLoading(false);
  };

  useEffect(() => {
    console.log("🔄 Gọi API với bộ lọc:", filterType);
    fetchWarehouseData();
  }, [filterType]);

  const fetchStorageById = async (storageId) => {
    try {
      const res = await axios.get(
        `http://localhost:3001/api/fuel-storage/storage/${storageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data.success ? res.data.data : null;
    } catch (error) {
      console.error("❌ Lỗi khi lấy kho:", error);
      return null;
    }
  };
  

  

  // ✅ Tính phần trăm sức chứa kho
  const usagePercent =
    storage.capacity > 0
      ? ((storage.capacity - storage.remaining_capacity) / storage.capacity) *
        100
      : 0;

  // ✅ Làm tròn số phần trăm hiển thị
  const formattedUsagePercent = usagePercent.toFixed(2); // Giữ 2 số sau dấu thập phân

  // ✅ Cấu hình biểu đồ cột cho thống kê đơn nhập kho
  const receiptsChartData = [
    { status: "Tổng đơn", count: stats.totalReceipts },
    { status: "Chờ duyệt", count: stats.pendingReceipts },
    { status: "Đã duyệt", count: stats.approvedReceipts },
  ];

  const receiptsChartConfig = {
    data: receiptsChartData,
    xField: "status",
    yField: "count",
    color: ({ status }) => {
      return status === "Đã duyệt"
        ? "#52c41a"
        : status === "Chờ duyệt"
        ? "#faad14"
        : "#1890ff";
    },
    label: {
      position: "top", // ✅ Thay "middle" thành "top" hoặc "bottom"
      style: { fill: "#FFFFFF", fontSize: 12 },
    },
    xAxis: { label: { autoHide: true, autoRotate: false } },
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* 🟢 Header */}
      <header className="bg-gradient-to-r from-blue-500 to-teal-500 text-white p-6 shadow-lg mb-6">
        <h1 className="text-4xl font-bold">Quản Lý Kho</h1>
      </header>

      {/* 🟢 Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <Statistic title="Tổng đơn nhập kho" value={stats.totalReceipts} />
        </Card>
        <Card>
          <Statistic
            title="Đơn Chờ Duyệt"
            value={stats.pendingReceipts}
            valueStyle={{ color: "#faad14" }}
          />
        </Card>
        <Card>
          <Statistic
            title="Đơn Đã Duyệt"
            value={stats.approvedReceipts}
            valueStyle={{ color: "#52c41a" }}
          />
        </Card>
      </div>

      {/* 🟢 Thông tin kho */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Thông tin kho: {storage.name_storage}
        </h2>
        <Progress percent={formattedUsagePercent} status="active" />
        <p className="mt-2 text-gray-600">
          {storage.capacity - storage.remaining_capacity} / {storage.capacity}{" "}
          đã sử dụng
        </p>
      </div>

      {/* 🟢 Biểu đồ cột thống kê đơn nhập kho */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Thống kê đơn nhập kho</h2>
        <Column {...receiptsChartConfig} />
      </div>

      {/* 🟢 Danh sách đơn nhập kho gần đây */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Nút chọn lọc theo Ngày / Tuần / Tháng */}
        <div className="flex justify-start mb-4">
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

        <h2 className="text-xl font-semibold mb-4">Đơn nhập kho </h2>
        <Table
          columns={[
            { title: "Mã đơn", dataIndex: "_id", key: "_id", width: 150 },
            {
              title: "Người quản lý",
              dataIndex: ["manager_id", "full_name"],
              key: "manager_id",
            },
            { title: "Trạng thái", dataIndex: "status", key: "status" },
            { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
            {
              title: "Ngày nhập",
              dataIndex: "createdAt",
              key: "createdAt",
              render: (date) =>
                date
                  ? moment(date).format("DD/MM/YYYY HH:mm")
                  : "Không có dữ liệu",
            },
          ]}
          dataSource={receipts}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
        />
      </div>
    </div>
  );
};

export default DashboardWarehouse;
