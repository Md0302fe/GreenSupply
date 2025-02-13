import React, { useEffect, useState, useRef } from "react";
import { Table, Button, message, Space, Input, Modal, Descriptions } from "antd";
import axios from "axios";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import "./FuelOrderStatus.scss"; // Tạo file CSS để tùy chỉnh giao diện

const FuelOrderStatus = () => {
  const [orders, setOrders] = useState([]); // Danh sách đơn hàng
  const [loading, setLoading] = useState(false); // Trạng thái loading
  const [searchText, setSearchText] = useState(""); // Nội dung tìm kiếm
  const [searchedColumn, setSearchedColumn] = useState(""); // Cột đang tìm kiếm
  const searchInput = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false); // Modal hiển thị chi tiết
  const [selectedOrder, setSelectedOrder] = useState(null); // Đơn hàng được chọn

  // 🟢 Gọi API để lấy danh sách đơn hàng đã duyệt
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:3001/api/orders/fuel-request/GetALLstatusSuccess");
        if (response.data.success) {
          setOrders(response.data.data);
        } else {
          message.error("Lỗi khi lấy danh sách đơn hàng đã duyệt!");
        }
      } catch (error) {
        message.error("Không thể kết nối đến server!");
      }
      setLoading(false);
    };

    fetchOrders();
  }, []);

  // 🟢 Xử lý tìm kiếm
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Tìm kiếm ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button type="primary" onClick={() => handleSearch(selectedKeys, confirm, dataIndex)} icon={<SearchOutlined />} size="small">
            Tìm kiếm
          </Button>
          <Button onClick={() => clearFilters && handleReset(clearFilters)} size="small">
            Xóa
          </Button>
          <Button type="link" size="small" onClick={() => close()}>
            Đóng
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />,
    onFilter: (value, record) => record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }} searchWords={[searchText]} autoEscape textToHighlight={text ? text.toString() : ""} />
      ) : (
        text
      ),
  });

  // 🟢 Hiển thị chi tiết đơn hàng
  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // 🟢 Cấu hình bảng hiển thị đơn hàng
  const columns = [
    {
      title: "Khách Hàng",
      dataIndex: "customerName",
      key: "customerName",
      ...getColumnSearchProps("customerName"),
    },
    {
      title: "Loại Nhiên Liệu",
      dataIndex: "fuel_name",
      key: "fuel_name",
      ...getColumnSearchProps("fuel_name"),
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
      filters: [{ text: "Hoàn thành", value: "Đã duyệt" }], // Đổi chữ trong filter
      onFilter: (value, record) => record.status.includes(value),
      render: (status) => <span>{status === "Đã duyệt" ? "Hoàn thành" : status}</span> // Chỉ đổi chữ hiển thị
    },
    {
      title: "Hành động",
      dataIndex: "action",
      key: "action",
      render: (_, record) => (
        <Button type="primary" icon={<EyeOutlined />} onClick={() => showOrderDetails(record)}>
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="fuel-order-status">
      <h2>Danh sách đơn hàng đã duyệt</h2>
      <Table columns={columns} dataSource={orders} loading={loading} rowKey="_id" pagination={{ pageSize: 10 }} />

      {/* 🟢 Modal hiển thị chi tiết đơn hàng */}
      <Modal title="Chi tiết đơn hàng" open={isModalOpen} onCancel={handleCancel} footer={null}>
        {selectedOrder && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Khách Hàng">{selectedOrder.customerName}</Descriptions.Item>
            <Descriptions.Item label="Loại Nhiên Liệu">{selectedOrder.fuel_name}</Descriptions.Item>
            <Descriptions.Item label="Giá Tiền">{selectedOrder.price}</Descriptions.Item>
            <Descriptions.Item label="Số Lượng">{selectedOrder.quantity}</Descriptions.Item>
            <Descriptions.Item label="Tổng Giá">{selectedOrder.total_price}</Descriptions.Item>
            <Descriptions.Item label="Trạng Thái">{selectedOrder.status}</Descriptions.Item>
            <Descriptions.Item label="Ghi Chú">{selectedOrder.note}</Descriptions.Item>
            <Descriptions.Item label="Ngày Tạo">{selectedOrder.createdAt}</Descriptions.Item>
            <Descriptions.Item label="Cập Nhật">{selectedOrder.updatedAt}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default FuelOrderStatus;
