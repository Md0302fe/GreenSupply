import React, { useEffect, useState } from "react";
import { Table, Button, message, Descriptions, Tag, Input, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import { useSelector } from "react-redux";
import _ from "lodash";

import Loading from "../../../LoadingComponent/Loading";
import DrawerComponent from "../../../DrawerComponent/DrawerComponent"; // ✅ dùng Drawer thay vì Modal

const { Option } = Select;

const statusColors = {
  "Chờ duyệt": "gold",
  "Đã duyệt": "green",
  "Từ chối": "red",
};

const MaterialStorageExportList = () => {
  const [exports, setExports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedExport, setSelectedExport] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [debouncedSearch, setDebouncedSearch] = useState("");


  const userRedux = useSelector((state) => state.user);
  const token = userRedux?.access_token || localStorage.getItem("access_token");

  const fetchExports = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/material-storage-export/getAllRawMaterialBatch`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            search: searchText,
            type_export: typeFilter,
            sortOrder: sortOrder,
          },
        }
      );

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

  const showExportDetails = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/material-storage-export/getRawMaterialBatchById/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSelectedExport(response.data.export);
        setIsDrawerOpen(true); // ✅ mở drawer
      } else {
        message.error("Không tìm thấy đơn xuất kho!");
      }
    } catch (error) {
      message.error("Lỗi khi lấy chi tiết đơn xuất kho!");
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
    fetchExports();
  }, [debouncedSearch, typeFilter, sortOrder]);

  const columns = [
    {
      title: "Người Tạo đơn",
      key: "created_by",
      render: (_, record) => record?.user_id?.full_name || "Không rõ",
    },
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
      title: "Đơn sản xuất",
      key: "created_by",
      render: (_, record) => record?.production_request_id?.request_name || "Không rõ",
    },
    {
      title: "Lô nguyên liệu",
      key: "created_by",
      render: (_, record) => record?.batch_id?.batch_name || "Không rõ",
    },
    
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={statusColors[status] || "default"}>{status}</Tag>
      ),
    },
    {
      title: "Hành động",
      dataIndex: "action",
      key: "action",
      render: (_, record) => (
        <Button type="link" onClick={() => showExportDetails(record._id)}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="material-storage-export-list">
      <div className="flex justify-between items-center mb-4">
        <h5 className="text-2xl font-bold text-gray-800">
          Quản lý Đơn Xuất Kho
        </h5>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Tìm kiếm theo tên xuất kho..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 250 }}
        />

        <Select
          onChange={(value) => setTypeFilter(value)}
          value={typeFilter}
          placeholder="Lọc theo loại xuất kho"
          style={{ width: 200 }}
        >
          <Option value="">Tất cả</Option>
          <Option value="Đơn sản xuất">Đơn sản xuất</Option>
        </Select>

        <Select
          onChange={(value) => setSortOrder(value)}
          value={sortOrder}
          style={{ width: 200 }}
        >
          <Option value="desc">Mới nhất</Option>
          <Option value="asc">Cũ nhất</Option>
        </Select>
      </div>

      <Loading isPending={loading}>
        <Table
          columns={columns}
          dataSource={exports}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </Loading>

      {/* ✅ Drawer hiển thị chi tiết */}
      <DrawerComponent
        title="Chi tiết Đơn Xuất Kho"
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedExport(null);
        }}
        placement="right"
        width="30%"
      >
        {selectedExport ? (
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-black border-b pb-2">
              Thông tin chi tiết
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <p className="font-bold text-black">Người tạo đơn:</p>
              <p className="text-black">
                {selectedExport?.user_id?.full_name || "Không rõ"}
              </p>
              <p className="font-bold text-black">Đơn sản xuất:</p>
              <p className="text-black">
                {selectedExport?.production_request_id?.request_name ||
                  "Không có"}
              </p>
              <p className="font-bold text-black">Lô nguyên liệu:</p>
              <p className="text-black">
                {selectedExport?.batch_id?.batch_name || "Không có"}
              </p>
              <p className="font-bold text-black">Tên Xuất Kho:</p>
              <p className="text-black">{selectedExport.export_name}</p>

              <p className="font-bold text-black">Loại Xuất Kho:</p>
              <p className="text-black">{selectedExport.type_export}</p>

              <p className="font-bold text-black">Trạng Thái:</p>
              <Tag
                color={statusColors[selectedExport.status]}
                className="px-2 py-1 text-sm font-semibold"
              >
                {selectedExport.status}
              </Tag>

              <p className="font-bold text-black">Ghi chú:</p>
              <p className="text-black">
                {selectedExport.note || "Không có ghi chú"}
              </p>
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

export default MaterialStorageExportList;
