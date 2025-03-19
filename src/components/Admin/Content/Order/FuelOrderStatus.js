import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  message,
  Space,
  Tag,
  Drawer,
  Descriptions,
  Modal,
} from "antd";
import axios from "axios";
import { DownloadOutlined } from "@ant-design/icons";
import { Excel } from "antd-table-saveas-excel";
import { converDateString } from "../../../../ultils";
import { useSelector } from "react-redux";

const FuelOrderStatus = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const userRedux = useSelector((state) => state.user);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = `${process.env.REACT_APP_API_URL}/orders/fuel-request/GetALLstatusSuccess`;
      if (filterType === "fuelRequests") {
        url = `${process.env.REACT_APP_API_URL}/orders/approved-fuel-requests`;
      } else if (filterType === "fuelSupplyOrders") {
        url = `${process.env.REACT_APP_API_URL}/orders/approved-fuel-supply-orders`;
      }

      const response = await axios.get(url);
      if (response.data.success) {
        const sortedOrders = response.data.data
          .map((order) => ({
            ...order,
            createdAt: new Date(order.createdAt),
          }))
          .sort((a, b) => b.createdAt - a.createdAt);

        setOrders(sortedOrders);
      } else {
        message.error("Lỗi khi lấy danh sách đơn hàng!");
      }
    } catch (error) {
      message.error("Không thể kết nối đến server!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [filterType]);

  const confirmCreateFuelStorageReceipt = (order) => {
    Modal.confirm({
      title: "Xác nhận tạo đơn nhập kho",
      content: `Bạn có chắc chắn muốn tạo đơn nhập kho cho đơn hàng này không?`,
      okText: "Tạo đơn",
      cancelText: "Hủy",
      onOk: () => createFuelStorageReceipt(order),
    });
  };

  const createFuelStorageReceipt = async (order) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        message.error("Bạn chưa đăng nhập!");
        return;
      }

      if (!order?._id || !order.receipt_type) {
        message.error("Dữ liệu đơn hàng không hợp lệ!");
        return;
      }

      const payload =
        order.receipt_type === "supply"
          ? { receipt_supply_id: order._id }
          : { receipt_request_id: order._id };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/fuel-storage/create`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${userRedux.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        message.success("Tạo đơn nhập kho thành công!");
        fetchOrders();
      } else {
        message.error(`Thất bại: ${response.data.message}`);
      }
    } catch (error) {
      message.error("Lỗi khi tạo đơn nhập kho!");
    }
  };

  const tableData = orders?.map((order) => ({
    ...order,
    key: order._id,
    customerName: order?.supplier_id?.full_name,
  }));

  const columns = [
    {
      title: "Khách Hàng",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Loại Nhiên Liệu",
      dataIndex: "fuel_name",
      key: "fuel_name",
    },
    {
      title: "Giá Tiền",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Số Lượng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Tổng Giá",
      dataIndex: "total_price",
      key: "total_price",
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colors = {
          "Chờ Nhập Kho": "gold",
          "Đang xử lý": "blue",
          "Nhập kho thành công": "green",
          "Nhập kho thất bại": "red",
        };
        return <Tag color={colors[status] || "default"}>{status}</Tag>;
      },
    },
    {
      title: "Loại Đơn Hàng",
      dataIndex: "receipt_type",
      key: "receipt_type",
      render: (text) => (
        <Tag color={text === "supply" ? "blue" : "green"}>
          {text === "supply" ? "Cung cấp" : "Thu hàng"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <span
            className="text-blue-600 cursor-pointer underline"
            onClick={() => {
              setSelectedOrder(record);
              setIsDrawerOpen(true);
            }}
          >
           Xem Chi Tiết
          </span>
          <Button
            type="default"
            onClick={() => confirmCreateFuelStorageReceipt(record)}
            disabled={record.status === "Đang xử lý"}
          >
            Tạo Đơn Nhập Kho
          </Button>
        </Space>
      ),
    },
  ];

  const handleExportFileExcel = () => {
    const excel = new Excel();
    excel
      .addSheet("Danh sách đơn hàng")
      .addColumns(columns.filter((col) => col.dataIndex !== "action"))
      .addDataSource(tableData, { str2Percent: true })
      .saveAs("DanhSachDonHangChoNhapKho.xlsx");
  };

  return (
    <div className="fuel-order-status">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h5 className="text-2xl font-bold text-gray-800">
          Quản lý Đơn Hàng Chờ Nhập Kho
        </h5>
      </div>

      {/* Filter + Export */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <Button
          type={filterType === "all" ? "primary" : "default"}
          onClick={() => setFilterType("all")}
        >
          Tất cả đơn
        </Button>
        <Button
          type={filterType === "fuelRequests" ? "primary" : "default"}
          onClick={() => setFilterType("fuelRequests")}
        >
          Đơn thu hàng
        </Button>
        <Button
          type={filterType === "fuelSupplyOrders" ? "primary" : "default"}
          onClick={() => setFilterType("fuelSupplyOrders")}
        >
          Đơn cung cấp
        </Button>
        <Button
          icon={<DownloadOutlined />}
          type="primary"
          className="bg-black text-white"
          onClick={handleExportFileExcel}
        >
          Xuất Excel
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={tableData}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 8 }}
      />

      {/* Drawer chỉ để xem chi tiết */}
      <Drawer
        title="Chi tiết Đơn Hàng"
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedOrder(null);
        }}
        placement="right"
        width="30%"
      >
        {selectedOrder ? (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Khách Hàng">
              {selectedOrder.supplier_id?.full_name || "Không có"}
            </Descriptions.Item>
            <Descriptions.Item label="Loại Nhiên Liệu">
              {selectedOrder.fuel_name}
            </Descriptions.Item>
            <Descriptions.Item label="Số Lượng">
              {selectedOrder.quantity}
            </Descriptions.Item>
            <Descriptions.Item label="Giá Tiền">
              {selectedOrder.price}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng Giá">
              {selectedOrder.total_price}
            </Descriptions.Item>
            <Descriptions.Item label="Loại Đơn Hàng">
              {selectedOrder.receipt_type === "supply" ? "Cung cấp" : "Thu hàng"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng Thái">
              {selectedOrder.status}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày Tạo">
              {converDateString(selectedOrder.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Cập Nhật">
              {converDateString(selectedOrder.updatedAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi Chú">
              {selectedOrder.note || "Không có"}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
        )}
      </Drawer>
    </div>
  );
};

export default FuelOrderStatus;
