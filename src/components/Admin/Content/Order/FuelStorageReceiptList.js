import React, { useEffect, useState } from "react";
import { Table, Button, message, Space, Modal, Descriptions, Tag, Select, Input } from "antd";
import axios from "axios";
import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { converDateString } from "../../../../ultils";
import { Excel } from "antd-table-saveas-excel";
import _ from "lodash"; // 🛠️ Thêm lodash để debounce API calls

const { Option } = Select;

const FuelStorageReceiptList = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [searchText, setSearchText] = useState(""); // 🔍 Tìm kiếm nâng cao
  const [debouncedSearch, setDebouncedSearch] = useState(""); // Debounce Search
  const [statusFilterVal, setStatusFilterVal] = useState(""); // 🎛 Lọc trạng thái
  const [sortOrder, setSortOrder] = useState("desc"); // ⬆⬇ Sắp xếp theo ngày nhập kho (mặc định mới nhất)

  const userRedux = useSelector((state) => state.user);
  const token = userRedux?.access_token || localStorage.getItem("access_token");

  // 🟢 Fetch dữ liệu từ API
  const fetchReceipts = async () => {
    setLoading(true);
    try {
      if (!token) {
        message.error("Bạn chưa đăng nhập!");
        setLoading(false);
        return;
      }

      const response = await axios.get("http://localhost:3001/api/fuel-storage/getAll", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: debouncedSearch, // 🔍 Gửi search text đã debounce
          status: statusFilterVal, // 🎛 Lọc theo trạng thái
          sortOrder: sortOrder, // ⬆⬇ Sắp xếp theo ngày nhập kho (asc/desc)
        },
      });

      console.log("🟢 Dữ liệu nhận về từ API:", response.data); 

      if (response.data.success) {
        setReceipts(response.data.data);
      } else {
        message.error("Lỗi khi lấy danh sách đơn nhập kho!");
      }
    } catch (error) {
      message.error("Không thể kết nối đến server!");
    }
    setLoading(false);
  };

  // 🛠️ Dùng debounce cho search (tránh gọi API liên tục khi gõ)
  useEffect(() => {
    const debounceFn = _.debounce(() => {
      setDebouncedSearch(searchText);
    }, 500); // ⏳ Delay 500ms trước khi gọi API

    debounceFn();
    return () => debounceFn.cancel(); // Cleanup debounce khi component unmount
  }, [searchText]);

  // 🔄 Gọi API khi có thay đổi trong tìm kiếm, lọc hoặc sắp xếp
  useEffect(() => {
    fetchReceipts();
  }, [debouncedSearch, statusFilterVal, sortOrder]);

  // 🛠️ Cập nhật bộ lọc trạng thái
  const handleStatusChange = (value) => {
    setStatusFilterVal(value);
  };

  // 🛠️ Cập nhật sắp xếp ngày
  const handleSortChange = (value) => {
    setSortOrder(value);
  };

  // 🛠️ Xử lý ô tìm kiếm
  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  // 🛠️ Xuất file Excel
  const handleExportFileExcel = () => {
    if (!receipts.length) {
      message.warning("Không có dữ liệu để xuất!");
      return;
    }

    const excel = new Excel();
    excel
      .addSheet("Danh sách Đơn Nhập Kho")
      .addColumns(columns.filter((col) => col.dataIndex !== "action"))
      .addDataSource(
        receipts.map((receipt) => ({
          manager: receipt.manager_id?.full_name || "Không có dữ liệu",
          storage: receipt.storage_id?.name_storage || "Không có dữ liệu",
          receiptType: receipt.receipt_supply_id ? "Cung cấp" : "Thu hàng",
          quantity: receipt.receipt_request_id?.quantity || receipt.receipt_supply_id?.quantity || "Không có dữ liệu",
          status: receipt.status,
          createdAt: converDateString(receipt.createdAt),
          updatedAt: converDateString(receipt.updatedAt),
          note: receipt.note || "Không có ghi chú",
        })),
        { str2Percent: true }
      )
      .saveAs("DanhSachDonNhapKho.xlsx");
  };

  // 🛠️ Cấu hình cột bảng
  const columns = [
    {
      title: "Người Quản Lý",
      dataIndex: ["manager_id", "full_name"],
      key: "manager_id",
    },
    {
      title: "Loại Đơn Hàng",
      dataIndex: "receipt_supply_id",
      key: "receipt_type",
      render: (_, record) => (record.receipt_supply_id ? <Tag color="blue">Cung cấp</Tag> : <Tag color="green">Thu hàng</Tag>),
    },
    {
      title: "Kho",
      dataIndex: ["storage_id", "name_storage"],
      key: "storage_id",
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = status === "Chờ duyệt" ? "gold" : status === "Đã duyệt" ? "green" : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Ngày Nhập Kho",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (date ? converDateString(date) : "Không có dữ liệu"),
    },
    {
      title: "Ngày Cập Nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date) => (date ? converDateString(date) : "Không có dữ liệu"),
    },
  ];

  return (
    <div className="fuel-storage-receipt-list">
      <h2>Danh sách Đơn Nhập Kho</h2>

      {/* 🔍 Ô tìm kiếm + Bộ lọc trạng thái + Sắp xếp */}
      <div className="filters" style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <Input
          placeholder="Tìm kiếm nâng cao..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={handleSearchChange}
          style={{ width: 250 }}
        />

        <Select onChange={handleStatusChange} value={statusFilterVal} placeholder="Lọc theo trạng thái" style={{ width: 150 }}>
          <Option value="">Tất cả</Option>
          <Option value="Chờ duyệt">Chờ duyệt</Option>
          <Option value="Đã duyệt">Đã duyệt</Option>
          <Option value="Đã huỷ">Đã huỷ</Option>
        </Select>

        <Select onChange={handleSortChange} value={sortOrder} style={{ width: 150 }}>
          <Option value="asc">Cũ nhất trước</Option>
          <Option value="desc">Mới nhất trước</Option>
        </Select>
      </div>

      <Table columns={columns} dataSource={receipts} loading={loading} rowKey="_id" pagination={{ pageSize: 10 }} />
    </div>
  );
};

export default FuelStorageReceiptList;
