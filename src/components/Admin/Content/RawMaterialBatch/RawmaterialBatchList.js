import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Input,
  Space,
  Tag,
  Button,
  Modal,
  message,
  Form,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import Highlighter from "react-highlight-words";
import { toast } from "react-toastify";
import * as RawMaterialBatchServices from "../../../../services/RawMaterialBatch";
import Loading from "../../../LoadingComponent/Loading";
import DrawerComponent from "../../../DrawerComponent/DrawerComponent";

const statusColors = {
  "Đang chuẩn bị": "gold",
  "Đã duyệt": "green",
  "Đang xử lý": "blue",
  "Hoàn thành": "purple",
  "Đã xóa": "red",
};

const RawMaterialBatchList = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  // Drawer state
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Form cho chỉnh sửa
  const [form] = Form.useForm();

  // Search state
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [fuelBatchs, setFuelBatchs] = useState([]);
  const [loading, setLoading] = useState(false); 
  const searchInput = useRef(null);

  // Fetch danh sách lô nguyên liệu
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await RawMaterialBatchServices.getAllRawMaterialBatches();
        console.log(response);
        if (response) {
          setFuelBatchs(response);
        }
      } catch (error) {
        message.error("Lỗi khi tải danh sách lô nguyên liệu!");
      } finally {
        setLoading(false); // Kết thúc loading
      }
    };

  // Gọi API khi component mount hoặc khi có thay đổi
  useEffect(() => {
    fetchData();
  }, []);

  const tableData = Array.isArray(fuelBatchs)
    ? fuelBatchs.map((batch) => ({
        ...batch,
        key: batch._id,
        fuel_name: batch?.fuel_type_id?.fuel_type_id?.type_name,
      }))
    : [];
    console.log(tableData);

  // Search trong bảng
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
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Tìm kiếm`}
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
            style={{ width: 70 }}
          >
            Tìm
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 70 }}
          >
            Đặt lại
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => confirm()}
            style={{ padding: 0 }}
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
      record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
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

  const columns = [
    {
      title: "Mã lô",
      dataIndex: "batch_id",
      key: "batch_id",
      ...getColumnSearchProps("batch_id"),
    },
    {
      title: "Tên lô",
      dataIndex: "batch_name",
      key: "batch_name",
      ...getColumnSearchProps("batch_name"),
      sorter: (a, b) => a.batch_name.localeCompare(b.batch_name),
    },
    {
      title: "Loại nguyên liệu",
      dataIndex: "fuel_name",
      key: "fuel_name",
    },
    {
      title: "Số lượng (Kg)",
      dataIndex: "quantity",
      key: "quantity",
      sorter: (a, b) => a.quantity - b.quantity,
      render: (val) => `${val} Kg`,
    },
    {
      title: "Kho lưu trữ",
      dataIndex: "name_storage",
      key: "name_storage",
      render: (_, record) =>
        record?.fuel_type_id?.storage_id?.name_storage || "Không có",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      filters: Object.keys(statusColors).map((status) => ({
        text: status,
        value: status,
      })),
      onFilter: (value, record) => record.status === value,
      render: (stt) => <Tag color={statusColors[stt] || "default"}>{stt}</Tag>,
    },
    {
      title: "Hành động",
      key: "action",
      render: (record) => (
        <Space>
          <Button type="link" onClick={() => handleViewDetail(record)}>
            Xem chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  const handleViewDetail = (record) => {
    setSelectedBatch(record);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedBatch(null);
  };

  const confirmDelete = (record) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa lô nguyên liệu này?",
      okText: "Đồng ý",
      cancelText: "Hủy",
      onOk: () => {
        toast.success("Lô nguyên liệu đã được xóa!");
        fetchData();
      },
    });
  };

  return (
    <div className="raw-material-batch-list">
      <div className="flex justify-between items-center mb-4">
        <h5 className="text-2xl font-bold text-gray-800">
          Quản lý Lô Nguyên Liệu
        </h5>
        <Button
          type="primary"
          className="bg-blue-600 font-semibold text-white hover:bg-blue-700 py-3 rounded-md flex items-center gap-2 px-6"
          onClick={() => navigate("/system/admin/raw-material-batch")}
        >
          Tạo lô bổ sung
        </Button>
      </div>

      <Loading isPending={loading}>
        <Table columns={columns} dataSource={tableData} />
      </Loading>

      <DrawerComponent
        title="Chi tiết Lô Nguyên Liệu"
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        placement="right"
        width="30%"
      >
        {selectedBatch ? (
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-black border-b pb-2">
              Thông tin chi tiết
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <p className="font-bold text-black">Mã lô:</p>
              <p className="text-black">{selectedBatch.batch_id}</p>

              <p className="font-bold text-black">Tên lô:</p>
              <p className="text-black">{selectedBatch.batch_name}</p>

              <p className="font-bold text-black">Loại nguyên liệu:</p>
              <p className="text-black">{selectedBatch?.fuel_type_id?.fuel_type_id?.type_name || "N/A"}</p>

              <p className="font-bold text-black">Số lượng (Kg):</p>
              <p className="text-black">{selectedBatch.quantity} Kg</p>

              <p className="font-bold text-black">Kho lưu trữ:</p>
              <p className="text-black">
                {selectedBatch?.fuel_type_id?.storage_id?.name_storage || "Không có"}
              </p>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <p className="font-bold text-gray-700">Trạng thái:</p>
              <Tag
                color={statusColors[selectedBatch.status]}
                className="px-2 py-1 text-sm font-semibold"
              >
                {selectedBatch.status}
              </Tag>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        )}
      </DrawerComponent>
    </div>
  );
};

export default RawMaterialBatchList;
