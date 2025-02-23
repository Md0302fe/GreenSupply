import React, { useEffect, useRef, useState } from "react";
import { Table, Button, message, Space, Modal, Descriptions, Tag, Input } from "antd";
import axios from "axios";
import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import Highlighter from "react-highlight-words";
import { converDateString } from "../../../../ultils";
import { Excel } from "antd-table-saveas-excel";
const FuelStorageReceiptList = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  const userRedux = useSelector((state) => state.user);
  const token = userRedux?.access_token || localStorage.getItem("access_token");

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      if (!token) {
        message.error("Bạn chưa đăng nhập! Vui lòng đăng nhập lại.");
        setLoading(false);
        return;
      }

      const response = await axios.get("http://localhost:3001/api/fuel-storage/getAll", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        // 🟢 Sắp xếp theo ngày tạo (mới nhất trước)
        const sortedReceipts = response.data.data
            .filter(item => item.createdAt) // Loại bỏ dữ liệu lỗi
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setReceipts(sortedReceipts);
      } else {
        message.error("Lỗi khi lấy danh sách đơn nhập kho!");
      }
    } catch (error) {
      message.error("Không thể kết nối đến server!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  // 🔄 Cập nhật trạng thái đơn
  const updateReceiptStatus = async (id, newStatus) => {
    try {
        if (!token) {
            message.error("Bạn chưa đăng nhập!");
            return;
        }

        setLoading(true); // Chặn spam nút

        console.log("📌 Gửi request cập nhật trạng thái:", { id, newStatus });

        const response = await axios.put(
            `http://localhost:3001/api/fuel-storage/update/${id}`,
            { status: newStatus },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("✅ API Response:", response.data);

        if (response.data.success) {
            message.success(`Đã cập nhật trạng thái thành: ${newStatus}`);

            // 🔴 Cập nhật trạng thái của đơn ngay trong Modal
            setSelectedReceipt(prev => ({ ...prev, status: newStatus }));

            // 🔴 Đóng Modal ngay lập tức
            setIsModalOpen(false);

            // 🔄 Load lại danh sách đơn hàng
            fetchReceipts();
        } else {
            console.error("❌ API báo lỗi:", response.data);
            message.error("Lỗi khi cập nhật trạng thái!");
        }
    } catch (error) {
        console.error("❌ Lỗi API:", error);

        if (error.response) {
            console.error("🔴 Chi tiết lỗi:", error.response);
            message.error(`Lỗi API: ${error.response.status} - ${error.response.data.message || "Không rõ lỗi"}`);
        } else {
            message.error("Không thể kết nối đến server!");
        }
    }
    setLoading(false); // Kích hoạt lại nút
};


const handleExportFileExcel = () => {
  if (!receipts.length) {
    message.warning("Không có dữ liệu để xuất!");
    return;
  }

  const excel = new Excel();
  excel
    .addSheet("Danh sách Đơn Nhập Kho")
    .addColumns(columns.filter((col) => col.dataIndex !== "action")) // Bỏ cột "Hành động"
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

  // 🔍 Tìm kiếm
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleCancel = () => {
    setIsModalOpen(false); // Đóng Modal
    setSelectedReceipt(null); // Xóa dữ liệu đơn nhập kho đã chọn
};


  // 🔄 Reset tìm kiếm
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  // 🔍 Cấu hình tìm kiếm
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder="Tìm kiếm"
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button type="primary" onClick={() => handleSearch(selectedKeys, confirm, dataIndex)} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>
            Tìm
          </Button>
          <Button onClick={() => clearFilters && handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Đặt lại
          </Button>
          <Button type="link" size="small" onClick={() => close()}>
            Đóng
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />,
    onFilter: (value, record) => record?.manager_id?.full_name?.toLowerCase().includes(value.toLowerCase()),
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }} searchWords={[searchText]} autoEscape textToHighlight={text ? text.toString() : ""} />
      ) : (
        text
      ),
  });

  // 🔧 Cấu hình cột bảng
  const columns = [
    {
      title: "Người Quản Lý",
      dataIndex: ["manager_id", "full_name"],
      key: "manager_id",
      ...getColumnSearchProps("manager_id"),
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
      filters: [
        { text: "Chờ duyệt", value: "Chờ duyệt" },
        { text: "Đã duyệt", value: "Đã duyệt" },
        { text: "Đã huỷ", value: "Đã huỷ" },
      ],
      onFilter: (value, record) => record.status.includes(value),
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
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  },
  {
      title: "Ngày Cập Nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date) => (date ? converDateString(date) : "Không có dữ liệu"),
      sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
  },

    {
      title: "Hành động",
      dataIndex: "action",
      key: "action",
      render: (_, record) => (
        <Button type="primary" icon={<EyeOutlined />} onClick={() => showReceiptDetails(record)}>
          Xem
        </Button>
      ),
    },
  ];

  // 🟢 Hiển thị chi tiết đơn nhập kho
  const showReceiptDetails = (receipt) => {
    setSelectedReceipt(receipt);
    setIsModalOpen(true);
  };

  return (
    <div className="fuel-storage-receipt-list">
      
      <h2>Danh sách Đơn Nhập Kho</h2>
      <Button 
            type="primary" 
            className="mb-4 mt-4"
             onClick={handleExportFileExcel} 
             style={{ backgroundColor: "black", borderColor: "black"}} >Xuất File 
      </Button>

      <Table columns={columns} dataSource={receipts} loading={loading} rowKey="_id" pagination={{ pageSize: 10 }} />
      
      <Modal title="Chi tiết Đơn Nhập Kho" open={isModalOpen} onCancel={handleCancel} footer={null}>
    {selectedReceipt && (
        <>
            <Descriptions bordered column={1}>
                <Descriptions.Item label="Người Quản Lý">{selectedReceipt.manager_id?.full_name || "Không có dữ liệu"}</Descriptions.Item>
                <Descriptions.Item label="Kho">{selectedReceipt.storage_id?.name_storage || "Không có dữ liệu"}</Descriptions.Item>
                <Descriptions.Item label="Loại Đơn Hàng">
                    {selectedReceipt.receipt_supply_id ? "Cung cấp" : "Thu hàng"}
                </Descriptions.Item>
                <Descriptions.Item label="Số Lượng">
                    {selectedReceipt.receipt_request_id?.quantity || 
                     selectedReceipt.receipt_supply_id?.quantity || 
                    "Không có dữ liệu"}
               </Descriptions.Item>

                <Descriptions.Item label="Trạng Thái">  
                    <Tag color={selectedReceipt.status === "Chờ duyệt" ? "gold" : selectedReceipt.status === "Đã duyệt" ? "green" : "red"}>
                        {selectedReceipt.status || "Không có dữ liệu"}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày Nhập Kho">{selectedReceipt.createdAt ? converDateString(selectedReceipt.createdAt) : "Không có dữ liệu"}</Descriptions.Item>
                <Descriptions.Item label="Ngày Cập Nhật">{selectedReceipt.updatedAt ? converDateString(selectedReceipt.updatedAt) : "Không có dữ liệu"}</Descriptions.Item>
                <Descriptions.Item label="Ghi Chú">
                    {selectedReceipt.receipt_request_id?.note || 
                     selectedReceipt.receipt_supply_id?.note || 
                    "Không có ghi chú"}
               </Descriptions.Item>
            </Descriptions>

            {/* 🟢 Nút Duyệt & Hủy đơn */}
            {selectedReceipt && (
    <div style={{ textAlign: "center", marginTop: 16 }}>
        <Space size="large">
            <Button 
                type="primary" 
                onClick={() => updateReceiptStatus(selectedReceipt._id, "Đã duyệt")}
                disabled={loading || selectedReceipt.status === "Đã duyệt" || selectedReceipt.status === "Đã huỷ"} 
            >
                Duyệt
            </Button>
            <Button 
                type="default" 
                danger
                onClick={() => updateReceiptStatus(selectedReceipt._id, "Đã huỷ")}
                disabled={loading || selectedReceipt.status === "Đã huỷ" || selectedReceipt.status === "Đã duyệt"}
            >
                Hủy
            </Button>
        </Space>
    </div>
            )}
        </>
    )}
</Modal>


    </div>
  );
};

export default FuelStorageReceiptList;
