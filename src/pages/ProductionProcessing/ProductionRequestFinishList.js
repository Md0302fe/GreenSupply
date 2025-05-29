import React, { useEffect, useState, useRef } from "react";
import { Table, Input, Space, Tag, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import Highlighter from "react-highlight-words";
import { toast } from "react-toastify";
import axios from "axios";
import { convertDateStringV1 } from "../../ultils";
import Loading from "../../components/LoadingComponent/Loading";
import DrawerComponent from "../../components/DrawerComponent/DrawerComponent";
import * as ProductionRequestServices from "../../services/ProductionRequestServices";
import { useNavigate } from "react-router-dom";

import { HiOutlineDocumentSearch } from "react-icons/hi";
import { FaGear } from "react-icons/fa6";

// Hàm lấy danh sách nhiên liệu
export const getAllFuelType = async () => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/fuel-management/getAll`
  );
  return res?.data; // Giả sử { success, requests: [...] }
};

const statusColors = {
  "Đang sản xuất": "gold",
  "Đang xử lý": "blue",
  "Đã Hoàn Thành": "purple",
  "Đã duyệt": "green",
  "Vô hiệu hóa": "gray",
};

const ProductionRequestList = () => {
  const user = useSelector((state) => state.user);

  // State quản lý Drawer & chế độ Edit
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();
  // Search
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  // 1. FETCH danh sách đơn (GET)
  const fetchProductionRequests = async () => {
    const access_token = user?.access_token;
    const dataRequest = {};
    const res = await ProductionRequestServices.getAll({
      access_token,
      dataRequest,
    });
    // Giả sử BE trả về { success, status, requests }
    return res.requests; // Mảng requests
  };

  const {
    isLoading,
    data,
    error,
    isError,
    refetch: refetchRequests,
  } = useQuery({
    queryKey: ["production_requests"],
    queryFn: fetchProductionRequests,
    retry: false,
  });

  if (isError) {
    console.log("Lỗi:", error);
  }

  const tableData = Array.isArray(data)
    ? data
        .filter(
          (req) => req.status === "Đã duyệt" || req.status === "Đang sản xuất"
        )
        .map((req) => ({ ...req, key: req._id }))
    : [];

  // Search
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
      <div
        style={{
          padding: 8,
          backgroundColor: "#f9f9f9",
          borderRadius: 4,
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
          width: 220,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder="Tìm kiếm"
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
            borderRadius: 4,
          }}
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
            onClick={() => clearFilters && confirm()}
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

  // Cấu hình cột
  const columns = [
    {
      title: "Tên đơn",
      dataIndex: "request_name",
      key: "request_name",
      ...getColumnSearchProps("request_name"),
      sorter: (a, b) => a.request_name.localeCompare(b.request_name),
    },
    {
      title: <div className="text-center">K.l Thành phẩm (Kg)</div>,
      dataIndex: "product_quantity",
      key: "product_quantity",
      align: "center",
      className: "text-center",
      sorter: (a, b) => a.product_quantity - b.product_quantity,
      render: (val) => `${val}`,
    },
    {
      title: <div className="text-center">K.l Nguyên liệu (Kg)</div>,
      dataIndex: "material_quantity",
      key: "material_quantity",
      align: "center",
      className: "text-center",
      sorter: (a, b) => a.material_quantity - b.material_quantity,
      render: (val) => `${val}`,
    },
    {
      title: <div className="text-center">Ngày bắt đầu</div>,
      dataIndex: "production_date",
      key: "production_date",
      align: "center",
      className: "text-center",
      sorter: (a, b) =>
        new Date(a.production_date) - new Date(b.production_date),
      render: (date) => convertDateStringV1(date),
    },
    {
      title: <div className="text-center">Ngày kết thúc</div>,
      dataIndex: "end_date",
      key: "end_date",
      align: "center",
      className: "text-center",
      sorter: (a, b) => new Date(a.end_date) - new Date(b.end_date),
      render: (date) => convertDateStringV1(date),
    },
    {
      title: <div className="text-center">Trạng thái</div>,
      dataIndex: "status",
      key: "status",
      align: "center",
      className: "text-center",
      filters: [
        { text: "Đang sản xuất", value: "Đang sản xuất" },
        { text: "Đã duyệt", value: "Đã duyệt" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (stt) => <Tag color={statusColors[stt] || "default"}>{stt}</Tag>,
    },
    {
      title: <div className="text-center">Hành động</div>,
      key: "action",
      align: "center",
      className: "text-center",
      render: (record) => (
        <div className="flex justify-center items-center gap-2">
          <div
            className=" text-black gap-2 cursor-pointer hover:bg-gray-200  rounded-lg transition-all duration-200 "
            onClick={() => handleViewDetail(record)}
          >
            <Button
              icon={<HiOutlineDocumentSearch style={{ color: "dodgerblue" }} />}
              size="middle"
            />
          </div>
          {/* có thể tạo quy trình nhanh */}
          {record?.status === "Đã duyệt" && (
            <div className="flex justify-center gap-4">
              <Button
                icon={
                  <FaGear className="text-green-600 transition-transform duration-300 group-hover:rotate-180" />
                }
                className="px-6 py-2 text-lg group"
                onClick={() => navigate(`create/${record._id}`)}
              ></Button>
            </div>
          )}
        </div>
      ),
    },
  ];

  // Mở Drawer (Xem / Chỉnh sửa)
  const handleViewDetail = (record) => {
    setSelectedRequest(record);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedRequest(null);
  };

  return (
    <div className="production-request-list">
      <div className="my-4">
        <div className="absolute">
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
        </div>
        <h5 className="content-title font-bold text-2xl text-center">
          Danh Sách Yêu Cầu Chờ Tạo Quy Trình
        </h5>
      </div>

      <Loading isPending={isLoading}>
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={{ pageSize: 4 }}
        />
      </Loading>

      <DrawerComponent
        title="Chi tiết đơn sản xuất"
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        placement="right"
        width="40%"
      >
        {/* Chế độ XEM CHI TIẾT */}
        {selectedRequest && (
          <div className="">
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="grid grid-cols-2 gap-0">
                <div className="bg-gray-100 font-semibold p-3 border border-gray-300 text-left">
                  Tên đơn
                </div>
                <div className="p-3 border border-gray-300">
                  {selectedRequest.request_name}
                </div>

                <div className="bg-gray-100 font-semibold p-3 border border-gray-300 text-left">
                  Loại đơn
                </div>
                <div className="p-3 border border-gray-300">
                  {selectedRequest.request_type}
                </div>

                <div className="bg-gray-100 font-semibold p-3 border border-gray-300 text-left">
                  Nhiên liệu (ID)
                </div>
                <div className="p-3 border border-gray-300">
                  {selectedRequest.material}
                </div>

                <div className="bg-gray-100 font-semibold p-3 border border-gray-300 text-left">
                  Thành phẩm (Kg)
                </div>
                <div className="p-3 border border-gray-300">
                  {selectedRequest.product_quantity} Kg
                </div>

                <div className="bg-gray-100 font-semibold p-3 border border-gray-300 text-left">
                  Nguyên liệu (Kg)
                </div>
                <div className="p-3 border border-gray-300">
                  {selectedRequest.material_quantity} Kg
                </div>

                <div className="bg-gray-100 font-semibold p-3 border border-gray-300 text-left">
                  Ngày sản xuất
                </div>
                <div className="p-3 border border-gray-300">
                  {convertDateStringV1(selectedRequest.production_date)}
                </div>

                <div className="bg-gray-100 font-semibold p-3 border border-gray-300 text-left">
                  Ngày kết thúc
                </div>
                <div className="p-3 border border-gray-300">
                  {convertDateStringV1(selectedRequest.end_date)}
                </div>

                <div className="bg-gray-100 font-semibold p-3 border border-gray-300 text-left">
                  Trạng thái
                </div>
                <div className="p-3 border border-gray-300">
                  <Tag
                    color={statusColors[selectedRequest.status] || "default"}
                  >
                    {selectedRequest.status}
                  </Tag>
                </div>

                {selectedRequest.note && (
                  <>
                    <div className="bg-gray-100 font-semibold p-3 border border-gray-300 text-left">
                      Ghi chú
                    </div>
                    <div className="p-3 border border-gray-300 whitespace-pre-wrap">
                      {selectedRequest.note}
                    </div>
                  </>
                )}
              </div>
            </div>
            {/* Nếu đã duyệt thì có thể tạo quy trình */}
            {selectedRequest.status === "Đã duyệt" && (
              <div className="flex justify-center gap-4 mt-6">
                <Button
                  type="primary"
                  className="px-6 py-2 text-lg"
                  onClick={() => navigate(`create/${selectedRequest._id}`)}
                >
                  Tạo quy trình
                </Button>
              </div>
            )}
          </div>
        )}
      </DrawerComponent>
    </div>
  );
};

export default ProductionRequestList;
