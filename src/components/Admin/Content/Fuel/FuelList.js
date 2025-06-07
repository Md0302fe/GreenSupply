import React, { useEffect, useRef, useState } from "react";
import {
  Table,
  Button,
  message,
  Space,
  Modal,
  Descriptions,
  Tag,
  Input,
  Drawer,
} from "antd";
import axios from "axios";
import {
  DownloadOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import Highlighter from "react-highlight-words";
import { Excel } from "antd-table-saveas-excel";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { Tooltip } from "antd";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const FuelList = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const [fuels, setFuels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFuel, setSelectedFuel] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [isDeletedFilter, setIsDeletedFilter] = useState(null); // Filter by is_deleted
  const searchInput = useRef(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [editingFuel, setEditingFuel] = useState(null);
  const [updateData, setUpdateData] = useState({
    type_name: "",
    description: "",
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUpdateDrawerOpen, setIsUpdateDrawerOpen] = useState(false);

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

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/fuel/getAll`
      );
      if (response.data.success) {
        const transformedFuels = response.data.requests.map((item) => ({
          _id: item._id,
          type_name: item.fuel_type_id?.type_name || "Không có dữ liệu",
          description: item.fuel_type_id?.description || "Không có mô tả",
          is_deleted: item.is_deleted,
          quantity: item.quantity,
          storage_id: item.storage_id,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }));
        console.log("Danh sách Nguyên liệu:", transformedFuels);
        setFuels(transformedFuels);
      } else {
        message.error("Lỗi khi lấy danh sách loại Nguyên liệu!");
      }
    } catch (error) {
      message.error("Không thể kết nối đến server!");
      console.log(error);
    }
    setLoading(false);
  };
  const openUpdateModal = (fuel) => {
    setEditingFuel(fuel);
    setUpdateData({ type_name: fuel.type_name, description: fuel.description });
    setIsUpdateModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      if (updateData.type_name.trim() === "") {
        toast.error("Tên Nguyên liệu không được để trống");
        return;
      }

      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/fuel/update/${editingFuel._id}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        message.success("Cập nhật thành công!");
        setFuels((prev) =>
          prev.map((fuel) =>
            fuel._id === editingFuel._id ? { ...fuel, ...updateData } : fuel
          )
        );
        setIsUpdateDrawerOpen(false); // Đóng Drawer cập nhật
      } else {
        message.error("Cập nhật thất bại!");
      }
    } catch (error) {
      message.error("Lỗi kết nối đến server!");
    }
  };

  const handleCancelFuel = async (id) => {
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/fuel/cancel/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        message.success("Đã chuyển Nguyên liệu vào trạng thái Đã xóa!");
        setFuels((prev) =>
          prev.map((fuel) =>
            fuel._id === id ? { ...fuel, is_deleted: true } : fuel
          )
        );
      } else {
        message.error("Hủy thất bại!");
      }
    } catch (error) {
      message.error("Lỗi kết nối đến server!");
    }
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
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder="Tìm kiếm"
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
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
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Đặt lại
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => clearFilters && confirm()}
          >
            Đóng
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toLowerCase().includes(value.toLowerCase()),
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
  console.log("fuels => ", fuels);
  // Handle export to Excel
  const handleExportFileExcel = () => {
    if (!fuels.length) {
      message.warning("Không có dữ liệu để xuất!");
      return;
    }

    const excel = new Excel();
    const exportColumns = [
      { title: "Tên Loại Nguyên liệu", dataIndex: "type_name" },
      { title: "Mô Tả", dataIndex: "description" },
      { title: "Trạng Thái", dataIndex: "is_deleted" },
      { title: "Số Lượng", dataIndex: "quantity" },
    ];

    const exportData = fuels.map((fuel) => ({
      type_name: fuel.type_name,
      description: fuel.description,
      is_deleted: fuel.is_deleted ? "Đã xóa" : "Chưa xóa",
      quantity: fuel.quantity,
    }));

    excel
      .addSheet("Danh sách Loại Nguyên liệu")
      .addColumns(exportColumns)
      .addDataSource(exportData)
      .saveAs("DanhSachLoaiNhienLieu.xlsx");
  };

  const openUpdateDrawer = (fuel) => {
    setEditingFuel(fuel);
    setUpdateData({
      type_name: fuel.type_name,
      description: fuel.description,
      quantity: fuel.quantity,
    });
    setIsUpdateDrawerOpen(true); // Mở Drawer cập nhật
  };
  const showFuelDetails = (fuel) => {
    console.log("Dữ liệu Nguyên liệu:", fuel); // Debug dữ liệu
    setSelectedFuel(fuel);
    setIsDrawerOpen(true);
  };

  // Columns definition
  const columns = [
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>
          Tên Loại Nguyên liệu
        </div>
      ),
      // title: "Tên Loại Nguyên liệu",
      dataIndex: "type_name",
      key: "type_name",
      ...getColumnSearchProps("type_name"),
      sorter: (a, b) => a.type_name.localeCompare(b.type_name),
      align: "center",
    },
    {
      title: <div style={{ textAlign: "center", width: "100%" }}>Mô Tả</div>,

      dataIndex: "description",
      key: "description",
      width: "40%",
      align: "center",
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>
          Số Lượng Trong Kho
        </div>
      ),
      dataIndex: "quantity",
      key: "quantity",
      sorter: (a, b) => a.quantity - b.quantity,
      align: "center",
      render: (text) => <div style={{ textAlign: "center" }}>{text}</div>,
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>Trạng Thái</div>
      ),
      dataIndex: "is_deleted",
      key: "is_deleted",
      filters: [
        { text: "Đã xóa", value: true },
        { text: "Chưa xóa", value: false },
      ],
      onFilter: (value, record) => record.is_deleted === value,
      align: "center",
      render: (is_deleted) => (
        <div style={{ textAlign: "center" }}>
          <Tag color={is_deleted ? "red" : "green"}>
            {is_deleted ? "Đã xóa" : "Chưa xóa"}
          </Tag>
        </div>
      ),
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>Hành Động</div>
      ),
      key: "action",
      align: "center",
      render: (_, record) => (
        <div style={{ textAlign: "center" }}>
          <Space>
            {/* Nút Xem chi tiết */}
            <Button
              type="link"
              icon={<HiOutlineDocumentSearch style={{ fontSize: "24px" }} />}
              onClick={() => showFuelDetails(record)}
            ></Button>
            {/* Nút Chỉnh sửa */}
            <Button
              type="link"
              icon={<EditOutlined style={{ fontSize: "20px" }} />}
              onClick={() => openUpdateDrawer(record)}
            ></Button>
          </Space>
        </div>
      ),
    },
  ];

  return (
    <div className="fuel-list">
      <div className="flex items-center justify-between mb-4">
        <Button
          onClick={() => navigate(-1)}
          type="primary"
          className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded-md shadow-sm transition duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12H3m0 0l6-6m-6 6l6 6"
            />
          </svg>
          Quay lại
        </Button>
        <h2 className="text-center text-4xl flex-1 font-bold text-gray-800 mt-2">
          Danh Sách Loại Nguyên Liệu
        </h2>
      </div>
      <div className="flex justify-end">
        <Button
          type="primary"
          className="mb-4 mt-4"
          icon={<DownloadOutlined />}
          onClick={handleExportFileExcel}
          style={{ backgroundColor: "#1e90ff", borderColor: "#1e90ff" }}
        >
          {t("export_excel")}
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={fuels?.filter((fuel) =>
          isDeletedFilter !== null ? fuel.is_deleted === isDeletedFilter : true
        )}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />

      <Drawer
        title="Chi tiết Loại Nguyên liệu"
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedFuel(null);
        }}
        placement="right"
        width={400}
      >
        {selectedFuel ? (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Tên Loại Nguyên liệu">
              {selectedFuel.type_name || "Không có dữ liệu"}
            </Descriptions.Item>
            <Descriptions.Item label="Mô Tả">
              {selectedFuel.description || "Không có mô tả"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng Thái Xóa">
              <Tag color={selectedFuel.is_deleted ? "red" : "green"}>
                {selectedFuel.is_deleted ? "Đã xóa" : "Chưa xóa"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Số Lượng">
              {selectedFuel.quantity ?? "Không có"}
            </Descriptions.Item>
            <Descriptions.Item label="Kho Lưu Trữ">
              {selectedFuel.storage_id ?? "Không có"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày Tạo">
              {new Date(selectedFuel.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Cập Nhật Lần Cuối">
              {new Date(selectedFuel.updatedAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <p>Đang tải dữ liệu...</p>
        )}
      </Drawer>

      <Drawer
        title="Cập nhật Loại Nguyên liệu"
        open={isUpdateDrawerOpen}
        onClose={() => {
          setIsUpdateDrawerOpen(false);
          setEditingFuel(null);
        }}
        placement="right"
        width={400}
      >
        {editingFuel ? (
          <div>
            <Input
              value={updateData.type_name}
              onChange={(e) =>
                setUpdateData({ ...updateData, type_name: e.target.value })
              }
              placeholder="Tên Loại Nguyên liệu"
              className="mb-2"
            />
            <Input.TextArea
              value={updateData.description}
              onChange={(e) =>
                setUpdateData({ ...updateData, description: e.target.value })
              }
              placeholder="Mô Tả"
              className="mb-2"
            />
            <Input
              value={updateData.quantity}
              type="number"
              onChange={(e) =>
                setUpdateData({ ...updateData, quantity: e.target.value })
              }
              placeholder="Số Lượng"
              className="mb-2"
            />
            <Space style={{ marginTop: "10px" }}>
              <Button onClick={() => setIsUpdateDrawerOpen(false)}>Hủy</Button>
              <Button type="primary" onClick={handleUpdate}>
                Lưu
              </Button>
            </Space>
          </div>
        ) : (
          <p>Đang tải dữ liệu...</p>
        )}
      </Drawer>
    </div>
  );
};

export default FuelList;
