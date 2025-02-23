import React, { useEffect, useRef, useState } from "react";
import { Table, Button, message, Space, Modal, Descriptions, Tag, Input, Select } from "antd";
import axios from "axios";
import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import Highlighter from "react-highlight-words";
import { converDateString } from "../../../../ultils";
import { Excel } from "antd-table-saveas-excel";

const FuelList = () => {
  const [fuels, setFuels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFuel, setSelectedFuel] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [isDeletedFilter, setIsDeletedFilter] = useState(null); // Filter by is_deleted
  const searchInput = useRef(null);

  const userRedux = useSelector((state) => state.user);
  const token = userRedux?.access_token || localStorage.getItem("access_token");

  // Fetch fuel data
  const fetchFuels = async () => {
    setLoading(true);
    try {
      if (!token) {
        message.error("Bạn chưa đăng nhập! Vui lòng đăng nhập lại.");
        setLoading(false);
        return;
      }

      const response = await axios.get("http://localhost:3001/api/fuel/getAll", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        // Sort by createdAt (newest first)
        const sortedFuels = response.data.requests
          .filter(item => item.createdAt) // Remove invalid data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setFuels(sortedFuels);
      } else {
        message.error("Lỗi khi lấy danh sách loại nhiên liệu!");
      }
    } catch (error) {
      message.error("Không thể kết nối đến server!");
      console.log(error)
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFuels();
  }, []);

  // Handle Search
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
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
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
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Tìm
          </Button>
          <Button onClick={() => clearFilters && handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Đặt lại
          </Button>
          <Button type="link" size="small" onClick={() => clearFilters && confirm()}>
            Đóng
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />,
    onFilter: (value, record) => record[dataIndex].toLowerCase().includes(value.toLowerCase()),
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  // Handle export to Excel
  const handleExportFileExcel = () => {
    if (!fuels.length) {
      message.warning("Không có dữ liệu để xuất!");
      return;
    }

    const excel = new Excel();
    excel
      .addSheet("Danh sách Loại Nhiên Liệu")
      .addColumns(columns.filter((col) => col.dataIndex !== "action")) // Exclude the "Action" column
      .addDataSource(
        fuels.map((fuel) => ({
          typeName: fuel.type_name,
          description: fuel.description,
          isDeleted: fuel.is_deleted ? "Đã xóa" : "Chưa xóa",
          createdAt: converDateString(fuel.createdAt),
          updatedAt: converDateString(fuel.updatedAt),
        }))
      )
      .saveAs("DanhSachLoaiNhienLieu.xlsx");
  };

  // Handle Modal for Fuel Details
  const showFuelDetails = (fuel) => {
    setSelectedFuel(fuel);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedFuel(null);
  };

  // Columns definition
  const columns = [
    {
      title: "Tên Loại Nhiên Liệu",
      dataIndex: "type_name",
      key: "type_name",
      ...getColumnSearchProps("type_name"),
      sorter: (a, b) => a.type_name.localeCompare(b.type_name),
    },
    {
      title: "Mô Tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Trạng Thái Xóa",
      dataIndex: "is_deleted",
      key: "is_deleted",
      filters: [
        { text: "Đã xóa", value: true },
        { text: "Chưa xóa", value: false },
      ],
      onFilter: (value, record) => record.is_deleted === value,
      render: (is_deleted) => (
        <Tag color={is_deleted ? "red" : "green"}>{is_deleted ? "Đã xóa" : "Chưa xóa"}</Tag>
      ),
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
      title: "Hành Động",
      key: "action",
      render: (_, record) => (
        <Button type="primary" icon={<EyeOutlined />} onClick={() => showFuelDetails(record)}>
          Xem
        </Button>
      ),
    },
  ];

  return (
    <div className="fuel-list">
      <h2>Danh sách Loại Nhiên Liệu</h2>

      <Button
        type="primary"
        className="mb-4 mt-4"
        onClick={handleExportFileExcel}
        style={{ backgroundColor: "black", borderColor: "black" }}
      >
        Xuất File
      </Button>

      <Table
        columns={columns}
        dataSource={fuels.filter((fuel) => (isDeletedFilter !== null ? fuel.is_deleted === isDeletedFilter : true))}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />

      <Modal title="Chi tiết Loại Nhiên Liệu" visible={isModalOpen} onCancel={handleCancel} footer={null}>
        {selectedFuel && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Tên Loại Nhiên Liệu">{selectedFuel.type_name}</Descriptions.Item>
            <Descriptions.Item label="Mô Tả">{selectedFuel.description}</Descriptions.Item>
            <Descriptions.Item label="Trạng Thái Xóa">
              <Tag color={selectedFuel.is_deleted ? "red" : "green"}>
                {selectedFuel.is_deleted ? "Đã xóa" : "Chưa xóa"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày Nhập Kho">{selectedFuel.createdAt ? converDateString(selectedFuel.createdAt) : "Không có dữ liệu"}</Descriptions.Item>
            <Descriptions.Item label="Ngày Cập Nhật">{selectedFuel.updatedAt ? converDateString(selectedFuel.updatedAt) : "Không có dữ liệu"}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default FuelList;
