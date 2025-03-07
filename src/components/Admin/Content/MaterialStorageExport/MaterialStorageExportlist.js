import React, { useEffect, useState } from "react";
import { Table, Button, message, Modal, Descriptions, Tag, Input, Select } from "antd";
import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import { useSelector } from "react-redux";

const { Option } = Select;

const MaterialStorageExportList = () => {
  const [exports, setExports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExport, setSelectedExport] = useState(null);
  const [searchText, setSearchText] = useState(""); // 🟢 Tìm kiếm
  const [typeFilter, setTypeFilter] = useState(""); // 🟢 Lọc
  const [sortOrder, setSortOrder] = useState("desc"); // 🟢 Sắp xếp

  const userRedux = useSelector((state) => state.user);
  const token = userRedux?.access_token || localStorage.getItem("access_token");

  // 📌 Gọi API getAll với search, filter, sort
  const fetchExports = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/material-storage-export/getAllRawMaterialBatch`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: searchText,
          type_export: typeFilter,
          sortOrder: sortOrder,
        },
      });

      if (response.data.success) {
        setExports(response.data.exports);
      } else {
        message.error("Lỗi khi lấy danh sách đơn xuất kho!");
      }
    } catch (error) {
      message.error("Không thể kết nối đến server!");
    }
    setLoading(false);
  };

  // 📌 Gọi API getDetails
  const showExportDetails = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/material-storage-export/getRawMaterialBatchById/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSelectedExport(response.data.export);
        setIsModalOpen(true);
      } else {
        message.error("Không tìm thấy đơn xuất kho!");
      }
    } catch (error) {
      message.error("Lỗi khi lấy chi tiết đơn xuất kho!");
    }
    setLoading(false);
  };

  // 🔄 Gọi API mỗi khi searchText, typeFilter hoặc sortOrder thay đổi
  useEffect(() => {
    fetchExports();
  }, [searchText, typeFilter, sortOrder]);

  // Cấu hình cột cho bảng
  const columns = [
    {
      title: "Tên Xuất Kho",
      dataIndex: "export_name",
      key: "export_name",
    },
    {
      title: "Loại Xuất Kho",
      dataIndex: "type_export",
      key: "type_export",
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
      title: "Hành động",
      dataIndex: "action",
      key: "action",
      render: (_, record) => (
        <Button type="link"  onClick={() => showExportDetails(record._id)}>
          Xem chi tiết
        </Button>
          
      ),
    },
  ];

  return (
    <div>
      <h2>Danh sách Đơn Xuất Kho</h2>

      {/* 🔍 Tìm kiếm + Bộ lọc loại xuất kho + Sắp xếp */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <Input
          placeholder="Tìm kiếm theo tên xuất kho..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 250 }}
        />

        <Select onChange={(value) => setTypeFilter(value)} value={typeFilter} placeholder="Lọc theo loại xuất kho" style={{ width: 200 }}>
          <Option value="">Tất cả</Option>
          <Option value="Đơn sản xuất">Đơn sản xuất</Option>
          {/* <Option value="Đơn vận chuyển">Đơn vận chuyển</Option> */}
        </Select>

        <Select onChange={(value) => setSortOrder(value)} value={sortOrder} style={{ width: 200 }}>
          <Option value="desc">Mới nhất </Option>
          <Option value="asc">Cũ nhất </Option>
        </Select>
      </div>

      <Table columns={columns} dataSource={exports} loading={loading} rowKey="_id" pagination={{ pageSize: 10 }} />

      {/* Modal hiển thị chi tiết */}
      <Modal title="Chi tiết Đơn Xuất Kho" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
        {selectedExport && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Tên Xuất Kho">{selectedExport.export_name}</Descriptions.Item>
            <Descriptions.Item label="Loại Xuất Kho">{selectedExport.type_export}</Descriptions.Item>
            <Descriptions.Item label="Trạng Thái">
              <Tag color={selectedExport.status === "Chờ duyệt" ? "gold" : selectedExport.status === "Đã duyệt" ? "green" : "red"}>
                {selectedExport.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ghi Chú">{selectedExport.note || "Không có ghi chú"}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default MaterialStorageExportList;
