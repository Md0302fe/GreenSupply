import React, { useEffect, useState } from "react";
import { Table, Button, message, Space, Tag, Select, Input, Modal } from "antd";
import {
  EyeOutlined,
  SearchOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useSelector } from "react-redux";
import { converDateString } from "../../../../ultils";
import { Excel } from "antd-table-saveas-excel";
import _ from "lodash";
import DrawerComponent from "../../../DrawerComponent/DrawerComponent";

const { Option } = Select;

const FuelStorageReceiptList = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilterVal, setStatusFilterVal] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  const userRedux = useSelector((state) => state.user);
  const token = userRedux?.access_token || localStorage.getItem("access_token");

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/fuel-storage/getAll`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            search: debouncedSearch,
            status: statusFilterVal,
            sortOrder,
          },
        }
      );
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

  // ✅ Hàm cập nhật trạng thái có xác nhận
  const confirmUpdateStatus = (id, newStatus) => {
    Modal.confirm({
      title: `Xác nhận ${newStatus === "Đã duyệt" ? "Duyệt Đơn" : "Hủy Đơn"}`,
      content: `Bạn có chắc chắn muốn ${
        newStatus === "Đã duyệt" ? "duyệt" : "hủy"
      } đơn này không?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: () => updateReceiptStatus(id, newStatus),
    });
  };

  const updateReceiptStatus = async (id, newStatus) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/fuel-storage/update/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        message.success(`Đã cập nhật trạng thái thành: ${newStatus}`);

        // ✅ Cập nhật trong Drawer
        setSelectedReceipt((prev) => ({ ...prev, status: newStatus }));

        // ✅ Cập nhật trong danh sách bảng
        setReceipts((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r))
        );
      } else {
        message.error("Cập nhật trạng thái thất bại!");
      }
    } catch (error) {
      message.error("Không thể kết nối đến server!");
    }
    setLoading(false);
  };

  useEffect(() => {
    const debounceFn = _.debounce(() => {
      setDebouncedSearch(searchText);
    }, 500);
    debounceFn();
    return () => debounceFn.cancel();
  }, [searchText]);

  useEffect(() => {
    fetchReceipts();
  }, [debouncedSearch, statusFilterVal, sortOrder]);

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
          quantity:
            receipt.receipt_request_id?.quantity ||
            receipt.receipt_supply_id?.quantity ||
            "Không có dữ liệu",
          status: receipt.status,
          createdAt: converDateString(receipt.createdAt),
          updatedAt: converDateString(receipt.updatedAt),
          note:
            receipt.receipt_request_id?.note ||
            receipt.receipt_supply_id?.note ||
            "Không có ghi chú",
        })),
        { str2Percent: true }
      )
      .saveAs("DanhSachDonNhapKho.xlsx");
  };

  const columns = [
    {
      title: "Người Quản Lý",
      dataIndex: ["manager_id", "full_name"],
      key: "manager_id",
    },
    {
      title: "Loại Đơn Hàng",
      key: "receipt_type",
      render: (_, record) =>
        record.receipt_supply_id ? (
          <Tag color="blue">Cung cấp</Tag>
        ) : (
          <Tag color="green">Thu hàng</Tag>
        ),
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
        let color =
          status === "Chờ duyệt"
            ? "gold"
            : status === "Đã duyệt"
            ? "green"
            : "red";
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
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedReceipt(record);
            setIsDrawerOpen(true);
          }}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="fuel-storage-receipt-list">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h5 className="text-2xl font-bold text-gray-800">
          Quản lý Đơn Nhập Kho
        </h5>
        {/* <Button
          icon={<DownloadOutlined />}
          type="primary"
          className="bg-blue-600 text-white"
          onClick={handleExportFileExcel}
        >
          Xuất Excel
        </Button> */}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Tìm kiếm nâng cao..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 280 }}
        />
        <Select
          value={statusFilterVal}
          onChange={(val) => setStatusFilterVal(val)}
          placeholder="Lọc theo trạng thái"
          style={{ width: 180 }}
        >
          <Option value="">Tất cả trạng thái</Option>
          <Option value="Chờ duyệt">Chờ duyệt</Option>
          <Option value="Đã duyệt">Đã duyệt</Option>
          <Option value="Đã huỷ">Đã huỷ</Option>
        </Select>
        <Select
          value={sortOrder}
          onChange={(val) => setSortOrder(val)}
          style={{ width: 180 }}
        >
          <Option value="desc">Mới nhất</Option>
          <Option value="asc">Cũ nhất</Option>
        </Select>
        <Button
          icon={<DownloadOutlined />}
          type="primary"
          className="bg-blue-600 text-white"
          onClick={handleExportFileExcel}
        >
          Xuất Excel
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={receipts}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />

      {/* Drawer Chi tiết */}
      <DrawerComponent
        title="Chi tiết Đơn Nhập Kho"
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedReceipt(null);
        }}
        placement="right"
        width="30%"
      >
        {selectedReceipt ? (
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-black border-b pb-2">
              Thông tin chi tiết
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <p className="font-bold">Người Quản Lý:</p>
              <p>{selectedReceipt.manager_id?.full_name || "Không có"}</p>
              <p className="font-bold">Kho:</p>
              <p>{selectedReceipt.storage_id?.name_storage || "Không có"}</p>
              <p className="font-bold">Loại Đơn Hàng:</p>
              <p>
                {selectedReceipt.receipt_supply_id ? "Cung cấp" : "Thu hàng"}
              </p>
              <p className="font-bold">Số Lượng:</p>
              <p>
                {selectedReceipt.receipt_request_id?.quantity ||
                  selectedReceipt.receipt_supply_id?.quantity ||
                  "Không có"}
              </p>
              <p className="font-bold">Trạng Thái:</p>
              <Tag
                color={
                  selectedReceipt.status === "Chờ duyệt"
                    ? "gold"
                    : selectedReceipt.status === "Đã duyệt"
                    ? "green"
                    : "red"
                }
              >
                {selectedReceipt.status}
              </Tag>
              <p className="font-bold">Ngày Nhập Kho:</p>
              <p>{converDateString(selectedReceipt.createdAt) || "Không có"}</p>
              <p className="font-bold">Ngày Cập Nhật:</p>
              <p>{converDateString(selectedReceipt.updatedAt) || "Không có"}</p>
              <p className="font-bold">Ghi chú:</p>
              <p>
                {selectedReceipt.receipt_request_id?.note ||
                  selectedReceipt.receipt_supply_id?.note ||
                  "Không có"}
              </p>
            </div>

            {/* Nút duyệt/hủy */}
            <div className="text-center mt-4">
              <Space size="large">
                <Button
                  type="primary"
                  onClick={() =>
                    confirmUpdateStatus(selectedReceipt._id, "Đã duyệt")
                  }
                  disabled={
                    loading ||
                    selectedReceipt.status === "Đã duyệt" ||
                    selectedReceipt.status === "Đã huỷ"
                  }
                >
                  Duyệt
                </Button>
                <Button
                  danger
                  onClick={() =>
                    confirmUpdateStatus(selectedReceipt._id, "Đã huỷ")
                  }
                  disabled={
                    loading ||
                    selectedReceipt.status === "Đã huỷ" ||
                    selectedReceipt.status === "Đã duyệt"
                  }
                >
                  Hủy
                </Button>
              </Space>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">Đang tải chi tiết...</p>
        )}
      </DrawerComponent>
    </div>
  );
};

export default FuelStorageReceiptList;
