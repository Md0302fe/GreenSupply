import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  Button,
  message,
  Space,
  Tag,
  Select,
  Input,
  Modal,
  Popover,
} from "antd";
import {
  EyeOutlined,
  SearchOutlined,
  DownloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useSelector } from "react-redux";
import { converDateString } from "../../../../ultils";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { Excel } from "antd-table-saveas-excel";
import _ from "lodash";
import DrawerComponent from "../../../DrawerComponent/DrawerComponent";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const { Option } = Select;

const FuelStorageReceiptList = () => {
  const { t } = useTranslation();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilterVal, setStatusFilterVal] = useState("");
  const [sortOrder] = useState("desc");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [receiptTypeFilter, setReceiptTypeFilter] = useState("");
  const [originalReceipts, setOriginalReceipts] = useState([]);
  const [showTypeFilter, setShowTypeFilter] = useState(false);

  const searchInput = useRef(null);
  const [searchedColumn, setSearchedColumn] = useState("");

  const userRedux = useSelector((state) => state.user);
  const token = userRedux?.access_token || localStorage.getItem("access_token");
  const navigate = useNavigate();
  const statusMap = {
    "Chờ duyệt": "pending",
    "Đang xử lý": "processing",
    "Nhập kho thành công": "imported",
    "Nhập kho thất bại": "importFailed",
    "Đã huỷ": "cancelled",
  };
  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/fuel-storage/getAll`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            search: debouncedSearch,
            status: statusFilterVal,
            sortOrder,
          },
        }
      );
      if (response.data.success) {
        const rawData = response.data.data; // 👉 khai báo biến đúng chỗ
        setOriginalReceipts(rawData);
        applyFilters(rawData);
      } else {
        message.error("Lỗi khi lấy danh sách đơn nhập kho!");
      }
    } catch (error) {
      message.error("Không thể kết nối đến server!");
    }
    setLoading(false);
  };

  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("status");
    if (status) {
      setStatusFilterVal(status);
    }
  }, [location.search]);

  const applyFilters = (data) => {
    let filtered = [...data];

    // Lọc theo loại đơn hàng
    if (receiptTypeFilter === "supply") {
      filtered = filtered.filter((item) => item.receipt_supply_id);
    } else if (receiptTypeFilter === "request") {
      filtered = filtered.filter((item) => item.receipt_request_id);
    }

    // Lọc theo trạng thái (đã có)
    if (statusFilterVal) {
      filtered = filtered.filter((item) => item.status === statusFilterVal);
    }

    // Lọc theo người quản lý (đã có)
    if (debouncedSearch) {
      filtered = filtered.filter((item) =>
        item.manager_id?.full_name
          ?.toLowerCase()
          .includes(debouncedSearch.toLowerCase())
      );
    }

    setReceipts(filtered);
  };

  useEffect(() => {
    applyFilters(originalReceipts);
  }, [receiptTypeFilter, statusFilterVal, debouncedSearch]);

  const confirmUpdateStatus = (id, newStatus) => {
    Modal.confirm({
      title: t(
        `fuelStorage.confirmTitle.${
          newStatus === "Nhập kho thành công" ? "approve" : "cancel"
        }`
      ),
      content: t(
        `fuelStorage.confirmContent.${
          newStatus === "Nhập kho thành công" ? "approve" : "cancel"
        }`
      ),
      okText: t("fuelStorage.confirm.okText"),
      cancelText: t("fuelStorage.confirm.cancelText"),
      onOk: () => updateReceiptStatus(id, newStatus),
    });
  };

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
            onClick={() => {
              clearFilters && handleReset(clearFilters);
              confirm();
            }}
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
      record.manager_id?.full_name
        ? record.manager_id.full_name
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : false,
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <span style={{ backgroundColor: "#ffc069", padding: 0 }}>{text}</span>
      ) : (
        text
      ),
  });

  const updateReceiptStatus = async (id, newStatus) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/fuel-storage/update/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        message.success(t("fuelStorage.updateSuccess", { status: newStatus }));
        setSelectedReceipt((prev) => ({ ...prev, status: newStatus }));
        setReceipts((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r))
        );
      } else {
        message.error(t("fuelStorage.updateFail"));
      }
    } catch {
      message.error(t("fuelStorage.serverError"));
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
    fetchReceipts();
  }, [debouncedSearch, statusFilterVal, sortOrder]);

  const handleExportFileExcel = () => {
    if (!receipts.length) {
      message.warning(t("fuelStorage.noDataToExport"));
      return;
    }
    const excel = new Excel();
    excel
      .addSheet("Danh sách Đơn Nhập Kho")
      .addColumns([
        { title: t("fuelStorage.columns.manager"), dataIndex: "manager" },
        {
          title: t("fuelStorage.columns.receiptType"),
          dataIndex: "receiptType",
        },
        { title: t("fuelStorage.columns.storage"), dataIndex: "storage" },
        { title: t("fuelStorage.columns.status"), dataIndex: "status" },
        { title: t("fuelStorage.columns.createdAt"), dataIndex: "createdAt" },
        { title: t("fuelStorage.columns.updatedAt"), dataIndex: "updatedAt" },
        { title: t("fuelStorage.columns.quantity"), dataIndex: "quantity" },
        { title: t("fuelStorage.columns.note"), dataIndex: "note" },
      ])
      .addDataSource(
        receipts.map((r) => ({
          manager: r.manager_id?.full_name || t("fuelStorage.noDataShort"),
          storage: r.storage_id?.name_storage || t("fuelStorage.noDataShort"),
          receiptType: r.receipt_supply_id
            ? t("fuelStorage.receiptType.supply")
            : t("fuelStorage.receiptType.request"),
          status: r.status,
          createdAt: converDateString(r.createdAt),
          updatedAt: converDateString(r.updatedAt),
          quantity:
            r.receipt_request_id?.quantity ||
            r.receipt_supply_id?.quantity ||
            t("fuelStorage.noDataShort"),
          note:
            r.receipt_request_id?.note ||
            r.receipt_supply_id?.note ||
            t("fuelStorage.columns.note"),
        })),
        { str2Percent: true }
      )
      .saveAs("DanhSachDonNhapKho.xlsx");
  };

  const columns = [
    {
      title: t("fuelStorage.columns.manager"),
      dataIndex: ["manager_id", "full_name"],
      key: "manager_id",
      render: (_, record) =>
        record.manager_id?.full_name || t("fuelStorage.unknown"),
    },
    {
      title: t("fuelStorage.columns.receiptType"),
      key: "receipt_type",
      render: (_, record) => (
        <Tag color={record.receipt_supply_id ? "blue" : "green"}>
          {record.receipt_supply_id
            ? t("fuelStorage.receiptType.supply")
            : t("fuelStorage.receiptType.request")}
        </Tag>
      ),
    },
    {
      title: t("fuelStorage.columns.storage"),
      dataIndex: ["storage_id", "name_storage"],
      key: "storage_id",
      render: (text) => text || t("fuelStorage.noDataShort"),
    },
    {
      title: t("fuelStorage.columns.status"),
      dataIndex: "status",
      key: "status",
      render: (statusLabel) => {
        const statusKey = statusMap[statusLabel];
        const statusColors = {
          pending: "gold",
          processing: "orange",
          imported: "blue",
          importFailed: "volcano",
          cancelled: "red",
        };
        return (
          <Tag color={statusColors[statusKey] || "default"}>{t(`status.${statusKey}`) || statusKey}</Tag>
        );
      },
    },
    {
      title: t("fuelStorage.columns.createdAt"),
      dataIndex: "createdAt",
      render: (date) =>
        date ? converDateString(date) : t("fuelStorage.noDataShort"),
    },
    {
      title: t("fuelStorage.columns.updatedAt"),
      dataIndex: "updatedAt",
      render: (date) =>
        date ? converDateString(date) : t("fuelStorage.noDataShort"),
    },
    {
      title: t("fuelStorage.columns.action"),
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedReceipt(record);
            setIsDrawerOpen(true);
          }}
        >
          <HiOutlineDocumentSearch style={{ fontSize: 24 }} />
        </Button>
      ),
    },
  ];

  return (
    <div className="fuel-storage-receipt-list">
      {/* Tiêu đề */}
      <div className="flex justify-between items-center mb-4">
        {/* Nút Quay lại */}
        <button
          onClick={() => navigate(-1)}
          className="flex mb-4 items-center bg-blue-500 text-white font-semibold py-1 px-3 rounded-md shadow-sm hover:bg-blue-600 transition duration-300"
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
          {t("fuelStorage.back")}
        </button>
        <h5 className="text-4xl font-bold text-gray-800 text-center flex-1 mr-6 ">
          {t("fuelStorage.title")}
        </h5>
      </div>

      {/* Nút Xuất Excel */}
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

      <Table
        columns={columns}
        dataSource={receipts}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 6 }}
      />

      {/* Drawer Chi tiết */}
      <DrawerComponent
        title={t("fuelStorage.drawerTitle")}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedReceipt(null);
        }}
        placement="right"
        width="30%"
      >
        {selectedReceipt ? (
          <div className="">
            {/* Tiêu đề */}
            {/* <h2 className="text-xl font-bold uppercase text-gray-800 text-center mb-4">
              Thông tin chi tiết
            </h2> */}

            {/* Bảng hiển thị dữ liệu */}
            <div className="border border-gray-300 rounded-lg p-4">
              <div className="grid grid-cols-10 gap-0">
                {/* Người Quản Lý */}
                <div className="col-span-4 font-semibold p-3 bg-gray-100 border border-gray-300">
                  {t("fuelStorage.columns.manager")}
                </div>
                <div className="col-span-6 p-3 border border-gray-300">
                  {selectedReceipt.manager_id?.full_name ||
                    t("fuelStorage.noDataShort")}
                </div>

                {/* Kho */}
                <div className="col-span-4 font-semibold p-3 bg-gray-100 border border-gray-300">
                  {t("fuelStorage.columns.storage")}
                </div>
                <div className="col-span-6 p-3 border border-gray-300">
                  {selectedReceipt.storage_id?.name_storage ||
                    t("fuelStorage.noDataShort")}
                </div>

                {/* Loại Đơn Hàng */}
                <div className="col-span-4 font-semibold p-3 bg-gray-100 border border-gray-300">
                  {t("fuelStorage.columns.receiptType")}
                </div>
                <div className="col-span-6 p-3 border border-gray-300">
                  {selectedReceipt.receipt_supply_id
                    ? t("fuelStorage.receiptType.supply")
                    : t("fuelStorage.receiptType.request")}
                </div>

                {/* Số Lượng */}
                <div className="col-span-4 font-semibold p-3 bg-gray-100 border border-gray-300">
                  {t("fuelStorage.columns.quantity")}
                </div>
                <div className="col-span-6 p-3 border border-gray-300">
                  {selectedReceipt.receipt_request_id?.quantity ||
                    selectedReceipt.receipt_supply_id?.quantity ||
                    t("fuelStorage.noDataShort")}
                </div>

                {/* Trạng Thái */}
                <div className="col-span-4 font-semibold p-3 bg-gray-100 border border-gray-300">
                  {t("fuelStorage.columns.status")}
                </div>
                <div className="col-span-6 p-3 border border-gray-300">
                  <Tag
                    color={
                      selectedReceipt.status === t("fuelStorage.status.pending")
                        ? "gold"
                        : selectedReceipt.status ===
                          t("fuelStorage.status.completed")
                        ? "blue"
                        : selectedReceipt.status ===
                          t("fuelStorage.status.cancelled")
                        ? "red"
                        : "default"
                    }
                  >
                    {selectedReceipt.status}
                  </Tag>
                </div>

                {/* Ngày Nhập Kho */}
                <div className="col-span-4 font-semibold p-3 bg-gray-100 border border-gray-300">
                  {t("fuelStorage.columns.createdAt")}
                </div>
                <div className="col-span-6 p-3 border border-gray-300">
                  {converDateString(selectedReceipt.createdAt) ||
                    t("fuelStorage.noDataShort")}
                </div>

                {/* Ngày Cập Nhật */}
                <div className="col-span-4 font-semibold p-3 bg-gray-100 border border-gray-300">
                  {t("fuelStorage.columns.updatedAt")}
                </div>
                <div className="col-span-6 p-3 border border-gray-300">
                  {converDateString(selectedReceipt.updatedAt) ||
                    t("fuelStorage.noDataShort")}
                </div>

                {/* Ghi chú */}
                {selectedReceipt.receipt_request_id?.note ||
                selectedReceipt.receipt_supply_id?.note ? (
                  <>
                    <div className="col-span-4 font-semibold p-3 bg-gray-100 border border-gray-300">
                      {t("fuelStorage.columns.note")}
                    </div>
                    <div className="col-span-6 p-3 border border-gray-300 whitespace-pre-wrap">
                      {selectedReceipt.receipt_request_id?.note ||
                        selectedReceipt.receipt_supply_id?.note}
                    </div>
                  </>
                ) : null}
              </div>
            </div>

            {/* Nút Duyệt / Hủy */}
            <div className="flex justify-center gap-4 mt-6">
              <Button
                type="primary"
                className="px-6 py-2 text-lg"
                onClick={() =>
                  confirmUpdateStatus(
                    selectedReceipt._id,
                    "Nhập kho thành công"
                  )
                }
                disabled={
                  loading ||
                  selectedReceipt.status === "Đã duyệt" ||
                  selectedReceipt.status === "Nhập kho thành công" ||
                  selectedReceipt.status === "Đã huỷ"
                }
              >
                {t("fuelStorage.approve")}
              </Button>
              <Button
                danger
                className="px-6 py-2 text-lg"
                onClick={() =>
                  confirmUpdateStatus(selectedReceipt._id, "Đã huỷ")
                }
                disabled={
                  loading ||
                  selectedReceipt.status === "Đã huỷ" ||
                  selectedReceipt.status === "Đã duyệt"
                }
              >
                {t("common.cancel")}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">Đang tải chi tiết...</p>
        )}
      </DrawerComponent>
    </div>
  );
};

export default FuelStorageReceiptList;
