import React, { useState, useRef, useEffect } from "react";
import DrawerComponent from "../../../components/DrawerComponent/DrawerComponent";
import * as FuelSupplyRequestService from "../../../services/HistoryProvideOrderService";
import { SearchOutlined } from "@ant-design/icons";
import { IoDocumentText } from "react-icons/io5";
import { Button, Input, Table, Tag, Space } from "antd";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import Highlighter from "react-highlight-words";

import { HiOutlineDocumentSearch } from "react-icons/hi";

import * as ultils from "../../../ultils";
import { useTranslation } from "react-i18next";

const HistoryProvideOrder = () => {
  const { t } = useTranslation();

  const user = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);
  const searchInput = useRef(null);

  // State của view detail
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [viewDetailRequest, setViewDetailRequest] = useState(null);

  // Các state cho chức năng Search
  const [search, setSearch] = useState("");
  // Các state cho chức năng Search
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");

  const fetchGetAllRequests = async () => {
    const access_token = user?.access_token;
    const user_id = user?.id;

    return await FuelSupplyRequestService.getProvideOrderHistories(
      access_token,
      { user_id }
    );
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

  const { data, isLoading } = useQuery({
    queryKey: ["fuelRequests", user?.id],
    queryFn: fetchGetAllRequests,
  });

  const handleViewDetail = (request) => {
    setViewDetailRequest(request);
    setIsViewDrawerOpen(true);
  };

  const getStatusClasses = (status) => {
    if (status === "Hoàn thành" || status === "Đang xử lý") return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
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
      title: t("harvestRequest.name"),
      dataIndex: "fuel_name",
      key: "fuel_name",
      ...getColumnSearchProps("fuel_name"),
      sorter: (a, b) => a.fuel_name.localeCompare(b.fuel_name),
    },
    {
      title: (
        <div style={{ textAlign: "center" }}>
          {t("historyProvideOrder.quantity")}
        </div>
      ),
      dataIndex: "quantity",
      key: "quantity",
      className: "text-center",
      sorter: (a, b) => a.quantity - b.quantity,
      render: (quantity) => ultils.convertPrice(quantity),
    },
    {
      title: (
        <div style={{ textAlign: "center" }}>
          {t("historyProvideOrder.unitPrice")}
        </div>
      ),
      dataIndex: "price",
      key: "price",
      className: "text-center",
      sorter: (a, b) => a.price - b.price,
      render: (price) => ultils.convertPrice(price),
    },
    {
      title: (
        <div style={{ textAlign: "center" }}>
          {t("historyProvideOrder.totalPrice")}
        </div>
      ),
      dataIndex: "total_price",
      key: "total_price",
      className: "text-center",
      sorter: (a, b) => a.total_price - b.total_price, // Enable sorting
      render: (_, record) => ultils.convertPrice(record.total_price), // Calculate dynamically
    },
    {
      title: (
        <div style={{ textAlign: "center" }}>{t("harvestRequest.status")}</div>
      ),
      dataIndex: "status",
      key: "status",
      className: "text-center",
      render: (status) => {
        let displayText = status;
        let color = "orange"; // Mặc định là "Chờ duyệt"
        if (status === "Đã duyệt") {
          color = "green";
          displayText = t("status.approve");
        }
        if (status === "Hoàn Thành" || status === "Đang xử lý") {
          color = "yellow";
          displayText = t("status.completed"); // Hiển thị "Hoàn Thành" cho cả 2 status
        }
        if (status === "Đã huỷ") {
          color = "red";
          displayText = t("status.cancelled");
        }
        if (status === "Chờ duyệt") {
          displayText = t("status.pending");
        }

        return <Tag color={color}>{displayText}</Tag>;
      },
      onFilter: (value, record) => {
        // Kiểm tra xem giá trị status có phải là "Hoàn Thành" hay "Đang xử lý" không
        if (value === "Hoàn Thành") {
          return (
            record.status === "Hoàn Thành" || record.status === "Đang xử lý"
          );
        }
        console.log(value);
        return record.status.indexOf(value) === 0;
      },
      filters: [
        { text: t("status.pending"), value: "Chờ duyệt" },
        { text: t("status.approve"), value: "Đã duyệt" },
        { text: t("status.cancelled"), value: "Đã huỷ" },
        { text: t("status.completed"), value: "Hoàn Thành" },
      ],
    },
    {
      title: (
        <div style={{ textAlign: "center" }}>
          {" "}
          {t("historyProvideOrder.actions")}
        </div>
      ),
      key: "actions",
      className: "text-center",
      render: (_, record) => {
        const isPending = record.status === "Chờ duyệt";
        return (
          <Space size={8}>
            <Button
              type="default"
              icon={<HiOutlineDocumentSearch style={{ color: "dodgerblue" }} />}
              onClick={() => handleViewDetail(record)}
              size="middle"
            />
          </Space>
        );
      },
    },
  ];
  return (
    <div className="px-2">
      <div className="text-center font-bold text-2xl mb-5">
        {t("historyProvideOrder.title")}
      </div>

      <hr />
      {isLoading ? (
        <p className="text-center text-gray-500">
          {t("historyProvideOrder.loading")}
        </p>
      ) : (
        <div className="Main-Content">
          <Table
            columns={columns}
            dataSource={data}
            loading={isLoading}
            rowKey={(record) => record._id}
            pagination={{ pageSize: 6 }}
            scroll={{ x: "max-content" }}
          />
        </div>
      )}

      {/* Drawer View Detail */}
      <DrawerComponent
        title={t("historyProvideOrder.viewDetail")}
        isOpen={isViewDrawerOpen}
        placement="right"
        width={drawerWidth}
        onClose={() => setIsViewDrawerOpen(false)}
      >
        {viewDetailRequest ? (
          <div className="w-full p-6 bg-white rounded-md shadow">
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="block mb-1 font-semibold">
                  {t("historyProvideOrder.itemName")}
                </label>
                <input
                  type="text"
                  value={viewDetailRequest.fuel_name}
                  readOnly
                  className="border p-2 rounded w-full mb-1"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">
                  {t("historyProvideOrder.quantity")}
                </label>
                <input
                  type="number"
                  value={viewDetailRequest.quantity}
                  readOnly
                  className="border p-2 rounded w-full mb-1"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">
                  {t("historyProvideOrder.unitPrice")}
                </label>
                <input
                  type="number"
                  value={viewDetailRequest.price}
                  readOnly
                  className="border p-2 rounded w-full mb-1"
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold">
                  {t("historyProvideOrder.totalPrice")}
                </label>
                <input
                  type="text"
                  value={`${viewDetailRequest.total_price.toLocaleString(
                    "vi-VN"
                  )} VNĐ`}
                  readOnly
                  className="border p-2 rounded w-full mb-1"
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1 font-semibold">
                  {t("historyProvideOrder.note")}
                </label>
                <textarea
                  value={viewDetailRequest.note}
                  readOnly
                  className="w-full h-full border p-2 rounded"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="font-semibold">
                  {t("historyProvideOrder.status")}
                </label>
                <span
                  className={`px-4 py-2 rounded text-sm font-medium inline-block w-30 text-center whitespace-nowrap 
              ${getStatusClasses(viewDetailRequest.status)}`}
                >
                  {/* {viewDetailRequest.status} */}
                  {t("status.completed")}
                </span>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsViewDrawerOpen(false)}
                className="bg-gray-500 text-white font-bold px-4 py-2 rounded hover:bg-gray-600"
              >
                {t("historyProvideOrder.close")}
              </button>
            </div>
          </div>
        ) : (
          <p>{t("historyProvideOrder.noData")}</p>
        )}
      </DrawerComponent>
    </div>
  );
};

export default HistoryProvideOrder;
