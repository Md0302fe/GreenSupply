import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  message,
  Space,
  Tag,
  Drawer,
  Descriptions,
  Modal,
  Card,
  Row,
  Col,
  Input,
} from "antd";
import axios from "axios";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Excel } from "antd-table-saveas-excel";
import { converDateString } from "../../../../ultils";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Highlighter from "react-highlight-words";
import * as util from "../../../../ultils";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const FuelOrderStatus = () => {
  const { t } = useTranslation();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");

  const searchInput = useState(null);
  const userRedux = useSelector((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const defaultStatus = queryParams.get("status") || "";
  const [statusFilterVal, setStatusFilterVal] = useState(defaultStatus);
  const statusMap = {
    "Chờ Nhập Kho": "pending",
    "Đang xử lý": "processing",
    "Nhập kho thành công": "imported",
    "Nhập kho thất bại": "importFailed",
  };
  const colorMap = {
    pending: "gold",
    processing: "blue",
    imported: "green",
    importFailed: "red",
  };
  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = `${process.env.REACT_APP_API_URL}/orders/fuel-request/GetALLstatusSuccess`;
      if (filterType === "fuelRequests") {
        url = `${process.env.REACT_APP_API_URL}/orders/approved-fuel-requests`;
      } else if (filterType === "fuelSupplyOrders") {
        url = `${process.env.REACT_APP_API_URL}/orders/approved-fuel-supply-orders`;
      }

      const response = await axios.get(url);
      if (response.data.success) {
        const sortedOrders = response.data.data
          .map((order) => ({
            ...order,
            createdAt: new Date(order.createdAt),
          }))
          .sort((a, b) => b.createdAt - a.createdAt);
        if (statusFilterVal) {
          sortedOrders = sortedOrders.filter(
            (order) => order.status === statusFilterVal
          );
        }
        setOrders(sortedOrders);
      } else {
        message.error(t("fuelOrderStatus.fetchError"));
      }
    } catch (error) {
      message.error(t("fuelOrderStatus.serverError"));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [filterType, statusFilterVal]);

  const confirmCreateFuelStorageReceipt = (order) => {
    Modal.confirm({
      title: t("fuelOrderStatus.modalTitle"),
      content: t("fuelOrderStatus.modalContent"),
      okText: t("fuelOrderStatus.create"),
      cancelText: t("fuelOrderStatus.cancel"),
      onOk: () => createFuelStorageReceipt(order),
    });
  };

  const createFuelStorageReceipt = async (orderToCreate) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        message.error(t("fuelOrderStatus.notLoggedIn"));
        return;
      }

      if (!orderToCreate?._id || !orderToCreate.receipt_type) {
        message.error(t("fuelOrderStatus.invalidOrder"));
        return;
      }

      const payload =
        orderToCreate.receipt_type === "supply"
          ? { receipt_supply_id: orderToCreate._id }
          : { receipt_request_id: orderToCreate._id };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/fuel-storage/create`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${userRedux.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        message.success(t("fuelOrderStatus.createSuccess"));
        // setOrders((prevOrders) =>
        //   prevOrders.filter((order) => order._id !== orderToCreate._id)
        // );
        fetchOrders();
      } else {
        message.error(
          `${t("fuelOrderStatus.createFailPrefix")} ${response.data.message}`
        );
      }
    } catch (error) {
      message.error(t("fuelOrderStatus.createFail"));
    }
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
          placeholder={`Tìm ${dataIndex}`}
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
            Reset
          </Button>
          <Button type="link" size="small" onClick={close}>
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
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
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
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const tableData = orders?.map((order) => ({
    ...order,
    key: order._id,
    customerName: order?.supplier_id?.full_name,
  }));

  const columns = [
    {
      title: t("fuelOrderStatus.columns.customer"),
      dataIndex: "customerName",
      key: "customerName",
      ...getColumnSearchProps("customerName"),
      sorter: (a, b) => a.customerName.localeCompare(b.customerName),
      align: "center",
    },
    {
      title: t("fuelOrderStatus.columns.fuelType"),
      dataIndex: "fuel_name",
      key: "fuel_name",
    },
    {
      title: <div className="text-center">{t("fuelOrderStatus.columns.totalPrice")}</div>,
      dataIndex: "total_price",
      key: "total_price",
      align: "center",
      render: (value) => (
        <div style={{ textAlign: "center", width: "100%" }}>
          {util.convertPrice(value)} đ
        </div>
      ),
    },
    {
      title: <div className="text-center">{t("fuelOrderStatus.columns.status")}</div>,
      dataIndex: "status",
      key: "status",
      align: "center",
      filters: [
        { text: t("status.pending"), value: "Chờ Nhập Kho" },
        { text: t("status.processing"), value: "Đang xử lý" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const key = statusMap[status];
        return (
          <div style={{ textAlign: "center", width: "100%" }}>
            <Tag color={colorMap[key] || "default"}>
              {t(`status.${key}`) || status}
            </Tag>
          </div>
        );
      },
    },
    {
      title: <div className="text-center">{t("fuelOrderStatus.columns.action")}</div>,
      key: "action",
      align: "center",
      render: (_, record) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button
            type="link"
            onClick={() => {
              setSelectedOrder(record);
              setIsDrawerOpen(true);
            }}
          >
            <HiOutlineDocumentSearch style={{ fontSize: "24px" }} />
          </Button>
          <Button
            type="default"
            onClick={() => confirmCreateFuelStorageReceipt(record)}
            disabled={record.status === "Đang xử lý"}
          >
            {t("fuelOrderStatus.createReceiptBtn")}
          </Button>
        </div>
      ),
    },
  ];

  const excelColumns = [
    { title: "Khách Hàng", dataIndex: "customerName" },
    { title: "Loại Nguyên liệu", dataIndex: "fuel_name" },
    { title: "Giá Tiền", dataIndex: "price" },
    { title: "Số Lượng", dataIndex: "quantity" },
    { title: "Tổng Giá", dataIndex: "total_price" },
    { title: "Trạng Thái", dataIndex: "status" },
    { title: "Loại Đơn Hàng", dataIndex: "receiptType" },
  ];

  const handleExportFileExcel = () => {
    if (!orders.length) {
      message.warning(t("fuelOrderStatus.serverError"));
      return;
    }

    const excel = new Excel();
    excel
      .addSheet("Danh sách đơn hàng")
      .addColumns(excelColumns)
      .addDataSource(
        orders.map((order) => ({
          customerName: order.supplier_id?.full_name || "Không có dữ liệu",
          fuel_name: order.fuel_name || "Không có dữ liệu",
          price: order.price || "Không có dữ liệu",
          quantity: order.quantity || "Không có dữ liệu",
          total_price: order.total_price || "Không có dữ liệu",
          status: order.status || "Không có dữ liệu",
          receiptType:
            order.receipt_type === "supply" ? "Cung cấp" : "Thu hàng",
        })),
        { str2Percent: true }
      )
      .saveAs("DanhSachDonHangChoNhapKho.xlsx");
  };

  return (
    <div style={{ padding: 0 }}>
      {/* Tiêu đề và nút quay lại */}
      <div
        style={{ marginBottom: 24, marginTop: 24 }}
        className="flex items-center justify-between"
      >
        {/* Nút quay lại bên trái */}
        <Button
          onClick={() => navigate(-1)}
          type="primary"
          className="flex items-center justify-center md:justify-start text-white font-semibold transition duration-300 shadow-sm px-2 md:px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded-md min-w-[20px] md:min-w-[100px]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 md:h-4 md:w-4 md:mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H3m0 0l6-6m-6 6l6 6" />
          </svg>
          <span className="hidden md:inline">{t("fuelOrderStatus.back")}</span>
        </Button>

        {/* Tiêu đề ở giữa */}
        <h2 className="text-center font-bold text-[16px] md:text-4xl flex-grow mx-4 mt-1 mb-1">
          {t("fuelOrderStatus.title")}
        </h2>

        {/* Phần tử trống bên phải để cân bằng với nút bên trái */}
        <div className="min-w-[20px] md:min-w-[100px]"></div>
      </div>

      {/* Nút xuất Excel ở góc phải dưới tiêu đề */}
      <div className="flex justify-end mb-1">
        <Button
          icon={<DownloadOutlined />}
          type="primary"
          className="bg-blue-600 text-white"
          onClick={handleExportFileExcel}
        >
          {t("export_excel")}
        </Button>
      </div>

      <div
        style={{
          marginBottom: 24,
          background: "#fafafa",
          padding: 16,
          borderRadius: 8,
        }}
      >
        {/* Nút danh sách nằm trên cùng bên phải */}
        <div className="flex justify-end mb-3">
          <Button
            type="primary"
            className="bg-blue-600"
            onClick={() =>
              navigate("/system/admin/warehouse-receipt?status=Chờ duyệt")
            }
          >
            {t("fuelOrderStatus.receiptList")}
          </Button>
        </div>

        {/* Label + Filter buttons */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="mb-3">{t("fuelOrderStatus.filterLabel")}</h3>
            <div className="flex flex-col md:flex-row gap-2">
              <Button
                type={filterType === "all" ? "primary" : "default"}
                onClick={() => setFilterType("all")}
              >
                {t("fuelOrderStatus.allOrders")}
              </Button>
              <Button
                type={filterType === "fuelRequests" ? "primary" : "default"}
                onClick={() => setFilterType("fuelRequests")}
              >
                {t("fuelOrderStatus.requestOrders")}
              </Button>
              <Button
                type={filterType === "fuelSupplyOrders" ? "primary" : "default"}
                onClick={() => setFilterType("fuelSupplyOrders")}
              >
                {t("fuelOrderStatus.supplyOrders")}
              </Button>
            </div>
          </div>
        </div>
      </div>


      <div style={{ background: "#fff", padding: 16, borderRadius: 8 }}>
        <h3 style={{ marginBottom: 12 }}>{t("fuelOrderStatus.orderList")}</h3>
        <Table
          columns={columns}
          dataSource={tableData}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 6 }}
          scroll={{ x: "max-content" }}
        />
      </div>

      {/* Drawer Chi tiết */}
      <Drawer
        title={t("fuelOrderStatus.orderDetail")}
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedOrder(null);
        }}
        placement="right"
        width={drawerWidth}
      >
        {selectedOrder ? (
          <Descriptions bordered column={1}>
            <Descriptions.Item label={t("fuelOrderStatus.columns.customer")}>
              {selectedOrder.supplier_id?.full_name ||
                t("fuelOrderStatus.noData")}
            </Descriptions.Item>

            <Descriptions.Item label={t("fuelOrderStatus.columns.fuelType")}>
              {selectedOrder.fuel_name}
            </Descriptions.Item>

            <Descriptions.Item label={t("fuelOrderStatus.quantity")}>
              {selectedOrder.quantity}
            </Descriptions.Item>

            <Descriptions.Item label={t("fuelOrderStatus.price")}>
              {selectedOrder.price}
            </Descriptions.Item>

            <Descriptions.Item label={t("fuelOrderStatus.columns.totalPrice")}>
              {selectedOrder.total_price}
            </Descriptions.Item>

            <Descriptions.Item label={t("fuelOrderStatus.receiptType")}>
              {selectedOrder.receipt_type === "supply"
                ? t("fuelOrderStatus.supply")
                : t("fuelOrderStatus.request")}
            </Descriptions.Item>

            <Descriptions.Item label={t("fuelOrderStatus.columns.status")}>
              {t(`status.${statusMap[selectedOrder.status]}`) ||
                selectedOrder.status}
            </Descriptions.Item>

            <Descriptions.Item label={t("fuelOrderStatus.createdAt")}>
              {converDateString(selectedOrder.createdAt)}
            </Descriptions.Item>

            <Descriptions.Item label={t("fuelOrderStatus.updatedAt")}>
              {converDateString(selectedOrder.updatedAt)}
            </Descriptions.Item>

            <Descriptions.Item label={t("fuelOrderStatus.note")}>
              {selectedOrder.note || t("fuelOrderStatus.noData")}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <p className="text-center text-gray-500">
            {t("fuelOrderStatus.loading")}
          </p>
        )}
        <div className="flex justify-end mt-4">
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="bg-gray-500 text-white font-bold px-4 py-2 rounded hover:bg-gray-600"
          >
            Đóng
          </button>
        </div>
      </Drawer>
    </div>
  );
};

export default FuelOrderStatus;
