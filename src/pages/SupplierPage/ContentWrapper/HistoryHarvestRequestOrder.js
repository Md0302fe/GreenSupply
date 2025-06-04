import React, { useState, useRef, useEffect } from "react";

import DrawerComponent from "../../../components/DrawerComponent/DrawerComponent";
import * as harverstRequestService from "../../../services/HarvestRequestService";
import { Input, Button, Table, Tag, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { IoDocumentText } from "react-icons/io5";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";

import { HiOutlineDocumentSearch } from "react-icons/hi";

import * as ultils from "../../../ultils"

const HistoryHarvestRequestOrder = () => {
  const user = useSelector((state) => state.user);

  // State của view detail
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [viewDetailRequest, setViewDetailRequest] = useState(null);

  const searchInput = useRef(null);

  // Các state cho chức năng Search
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");

  // GET ALL PRODUCT FROM DB
  const getHavestRequestHistory = async () => {
    const access_token = user?.access_token;
    const user_id = user?.id;

    const res = await harverstRequestService.getHarvestRequestHistory(
      access_token, user_id
    );
    return res;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["harvestRequests"],
    queryFn: getHavestRequestHistory,
  });

  const handleViewDetail = (request) => {
    setViewDetailRequest(request);
    setIsViewDrawerOpen(true);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Tìm kiếm ${dataIndex}`}
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
          <Button type="link" size="small" onClick={() => close()}>
            Đóng
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
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
      title: "Yêu cầu",
      dataIndex: "fuel_name",
      key: "fuel_name",
      ...getColumnSearchProps("fuel_name"),
      sorter: (a, b) => a.fuel_name.localeCompare(b.fuel_name),
    },
    {
      title: <div style={{ textAlign: "center" }}>Số lượng</div>,
      dataIndex: "quantity",
      key: "quantity",
      className: "text-center",
      sorter: (a, b) => a.quantity - b.quantity,
      render: (quantity) => ultils.convertPrice(quantity)

    },
    {
      title: <div style={{ textAlign: "center" }}>Giá mỗi Kg</div>,
      dataIndex: "price",
      key: "price",
      className: "text-center",
      sorter: (a, b) => a.price - b.price,
      render: (price) => ultils.convertPrice(price)
    },
    {
      title: <div style={{ textAlign: "center" }}>Tổng giá (VNĐ)</div>,
      dataIndex: "total_price",
      key: "total_price",
      className: "text-center",
      sorter: (a, b) => a.total_price - b.total_price,
      render: (total_price) => ultils.convertPrice(total_price),
    },
    {
      title: <div style={{ textAlign: "center" }}>Trạng thái</div>,
      dataIndex: "status",
      key: "status",
      className: "text-center",
      render: (status) => {
        let color = "orange"; // Default for "Chờ duyệt"
        if (status === "Đã duyệt") color = "green";
        if (status === "Đã huỷ") color = "red";
        return <Tag color={color}>{status}</Tag>;
      },
      onFilter: (value, record) => record.status.indexOf(value) === 0,
      filters: [
        { text: "Chờ duyệt", value: "Chờ duyệt" },
        { text: "Đã duyệt", value: "Đã duyệt" },
        { text: "Đã huỷ", value: "Đã huỷ" },
      ],
    },
    {
      title: <div style={{ textAlign: "center" }}>Hành động</div>,
      key: "actions",
      className: "text-center",
      render: (_, record) => (
        <Space>
          {/* <Button
                icon={<AiFillEdit />}
                onClick={() => handleEdit(record)}
                disabled={record.status !== "Chờ duyệt"}
                size="middle"
            />
            <Button
                icon={<MdDelete />}
                onClick={() => handleCancelClick(record._id, record.status)}
                disabled={record.status !== "Chờ duyệt"}
                size="middle"
            /> */}
          <Button
            icon={<HiOutlineDocumentSearch style={{ color: "dodgerblue" }} />}
            onClick={() => handleViewDetail(record)}
            size="middle"
          />
        </Space>
      ),
    },
  ];

  const getStatusClasses = (status) => {
    if (status === "Hoàn thành") return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  };
  const [isMobile, setIsMobile] = useState(() => {
      if (typeof window !== "undefined") {
        return window.innerWidth < 768;
      }
      return false;
    });
  
    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };
  
      handleResize(); // cập nhật ngay khi component mount
  
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);
  const drawerWidth = isMobile ? "100%" : "40%";
  return (
    <div className="px-2">
      <div className="text-center font-bold text-2xl mb-5">
        LỊCH SỬ YÊU CẦU THU NGUYÊN LIỆU
      </div>

      <hr />

      {isLoading ? (
        <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
      ) : (
        <div>
          <Table
            columns={columns}
            dataSource={data}
            loading={isLoading}
            rowKey={(record) => record._id}
            pagination={{ pageSize: 6 }}
            scroll={{ x: "max-content" }}
          />
          {/* Drawer View Detail */}
          <DrawerComponent
            title="Chi tiết yêu cầu thu nguyên liệu"
            isOpen={isViewDrawerOpen}
            placement="right"
            width={drawerWidth}
            onClose={() => setIsViewDrawerOpen(false)}
          >
            {viewDetailRequest ? (
              <div className="w-full p-6 bg-white rounded-md shadow">
                <div className="grid grid-cols-1 gap-4 mb-4">
                  {/* Tên yêu cầu */}
                  <div>
                    <label className="block mb-1 font-semibold">
                      Tên yêu cầu
                    </label>
                    <input
                      type="text"
                      value={viewDetailRequest.fuel_name}
                      readOnly
                      className="border p-2 rounded w-full mb-1"
                    />
                  </div>

                  {/* Số lượng */}
                  <div>
                    <label className="block mb-1 font-semibold">
                      Số lượng (kg)
                    </label>
                    <input
                      type="number"
                      value={viewDetailRequest.quantity}
                      readOnly
                      className="border p-2 rounded w-full mb-1"
                    />
                  </div>

                  {/* Giá mỗi đơn vị */}
                  <div>
                    <label className="block mb-1 font-semibold">
                      Giá mỗi đơn vị (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={viewDetailRequest.price}
                      readOnly
                      className="border p-2 rounded w-full mb-1"
                    />
                  </div>

                  {/* Tổng giá */}
                  <div>
                    <label className="block mb-1 font-semibold">Tổng giá</label>
                    <input
                      type="text"
                      value={
                        viewDetailRequest.total_price.toLocaleString("vi-VN") +
                        " VNĐ"
                      }
                      readOnly
                      className="border p-2 rounded w-full mb-1"
                    />
                  </div>

                  {/* Địa chỉ */}
                  <div>
                    <label className="block mb-1 font-semibold">
                      Địa chỉ lấy hàng
                    </label>
                    <input
                      type="text"
                      value={viewDetailRequest.address}
                      readOnly
                      className="border p-2 rounded w-full h-auto mb-1"
                    />
                  </div>

                  {/* Ghi chú */}
                  <div className="">
                    <label className="block mb-1 font-semibold">Ghi chú</label>
                    <textarea
                      value={viewDetailRequest.note}
                      readOnly
                      className="w-full h-auto border p-2 rounded"
                    />
                  </div>

                  {/* Trạng thái */}
                  <div className="flex items-center gap-2 mb-2">
                    <label className="font-semibold">Trạng thái:</label>
                    <span
                      className={`px-4 py-2 rounded text-sm font-medium inline-block w-30 text-center whitespace-nowrap ${getStatusClasses(
                        viewDetailRequest.status
                      )}`}
                    >
                      {viewDetailRequest.status}
                    </span>
                  </div>
                </div>

                {/* Nút đóng */}
                <div className="flex justify-start">
                  <button
                    onClick={() => setIsViewDrawerOpen(false)}
                    className="bg-gray-500 text-white font-bold px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <p>Không có dữ liệu.</p>
            )}
          </DrawerComponent>
        </div>
      )}
    </div>
  );
};

export default HistoryHarvestRequestOrder;
