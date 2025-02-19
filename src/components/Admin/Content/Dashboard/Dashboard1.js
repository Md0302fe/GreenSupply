import React, { useEffect, useState } from "react";
import { Progress, Table, Card, Statistic, message } from "antd";
import axios from "axios";
import { useSelector } from "react-redux";
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
        "http://localhost:3001/api/fuel-storage/getAll",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        let allReceipts = response.data.data;
        console.log("📌 API Response:", response.data);

        if (allReceipts.length > 0) {
          console.log("📌 Danh sách allReceipts:", allReceipts);

          // ✅ Lọc các đơn nhập kho chỉ trong ngày hôm nay
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Đặt giờ về đầu ngày

          // ✅ Lọc đơn nhập kho trong ngày & Sắp xếp mới nhất trước
          allReceipts = allReceipts
            .filter((receipt) => receipt.createdAt) // Loại bỏ đơn không có ngày tạo
            .map((receipt) => ({
              ...receipt,
              createdAt: new Date(receipt.createdAt), // Chuyển thành đối tượng Date
            }))
            .filter((receipt) => receipt.createdAt >= today) // Chỉ lấy đơn nhập kho trong ngày
            .sort((a, b) => b.createdAt - a.createdAt); // 🔥 Sắp xếp mới nhất trước

          // Lọc đơn nhập kho trong ngày

          console.log("📌 Đơn nhập kho trong ngày:", allReceipts);

          // ✅ Tìm đơn nhập kho đầu tiên có storage_id hợp lệ
          const validStorageReceipt = allReceipts.find(
            (receipt) => receipt.storage_id !== null
          );

          if (validStorageReceipt) {
            const storageData = validStorageReceipt.storage_id;
            console.log("📌 Kho hợp lệ:", storageData);

            setStorage({
              name_storage: storageData?.name_storage || "Chưa có tên kho",
              capacity: storageData?.capacity || 0,
              remaining_capacity: storageData?.remaining_capacity || 0,
            });
          } else {
            console.warn(
              "⚠️ Không tìm thấy đơn nhập kho nào có `storage_id` hợp lệ!"
            );
            message.warning(
              "Không tìm thấy thông tin kho từ danh sách đơn nhập kho!"
            );
          }

          // ✅ Thống kê số lượng đơn nhập kho trong ngày
          const totalReceipts = allReceipts.length;
          const pendingReceipts = allReceipts.filter(
            (r) => r.status === "Chờ duyệt"
          ).length;
          const approvedReceipts = allReceipts.filter(
            (r) => r.status === "Đã duyệt"
          ).length;

          setStats({ totalReceipts, pendingReceipts, approvedReceipts });

          // ✅ Lưu danh sách đơn nhập kho trong ngày
          setReceipts(allReceipts);
        } else {
          message.warning("Không có dữ liệu đơn nhập kho hôm nay!");
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
    fetchWarehouseData();
  }, []);

  // ✅ Tính phần trăm sức chứa kho
  const usagePercent =
    storage.capacity > 0
      ? ((storage.capacity - storage.remaining_capacity) / storage.capacity) *
        100
      : 0;

      const formattedUsagePercent = usagePercent.toFixed(2);
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

      {/* 🟢 Danh sách đơn nhập kho gần đây */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Đơn nhập kho gần đây</h2>
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
