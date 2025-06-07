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
      title: `Xác nhận ${
        newStatus === "Nhập kho thành công" ? "Duyệt Đơn" : "Hủy Đơn"
      }`,
      content: `Bạn có chắc chắn muốn ${
        newStatus === "Nhập kho thành công" ? "duyệt" : "hủy"
      } đơn này không?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
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
        message.success(`Đã cập nhật trạng thái thành: ${newStatus}`);

        setSelectedReceipt((prev) => ({ ...prev, status: newStatus }));
        setReceipts((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r))
        );
      } else {
        message.error("Cập nhật trạng thái thất bại!");
      }
    } catch (error) {
      message.error("Không thể kết nối đến server!");
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

  const excelColumns = [
    { title: "Người Quản Lý", dataIndex: "manager" },
    { title: "Loại Đơn Hàng", dataIndex: "receiptType" },
    { title: "Kho", dataIndex: "storage" },
    { title: "Trạng Thái", dataIndex: "status" },
    { title: "Ngày Nhập Kho", dataIndex: "createdAt" },
    { title: "Ngày Cập Nhật", dataIndex: "updatedAt" },
    { title: "Số lượng", dataIndex: "quantity" },
    { title: "Ghi chú", dataIndex: "note" },
  ];

  const handleExportFileExcel = () => {
    if (!receipts.length) {
      message.warning("Không có dữ liệu để xuất!");
      return;
    }

    const excel = new Excel();
    excel
      .addSheet("Danh sách Đơn Nhập Kho")
      .addColumns(excelColumns)
      .addDataSource(
        receipts.map((receipt) => ({
          manager: receipt.manager_id?.full_name || "Không có dữ liệu",
          storage: receipt.storage_id?.name_storage || "Không có dữ liệu",
          receiptType: receipt.receipt_supply_id ? "Cung cấp" : "Thu hàng",
          quantity:
            receipt.receipt_request_id?.quantity ||
            receipt.receipt_supply_id?.quantity ||
            "Không có dữ liệu",
          status: receipt.status,
          createdAt: converDateString(receipt.createdAt),
          updatedAt: converDateString(receipt.updatedAt),
          note:
            receipt.receipt_request_id?.note ||
            receipt.receipt_supply_id?.note ||
            "Không có ghi chú",
        })),
        { str2Percent: true }
      )
      .saveAs("DanhSachDonNhapKho.xlsx");
  };

  const columns = [
    {
      title: "Người Quản Lý",
      dataIndex: ["manager_id", "full_name"],
      key: "manager_id",
      align: "center",
      ...getColumnSearchProps("manager_id.full_name"),
      render: (_, record) => record.manager_id?.full_name || "Không rõ",
    },
    {
      title: "Loại Đơn Hàng",
      key: "receipt_type",
      align: "center",
      filters: [
        { text: "Cung cấp", value: "supply" },
        { text: "Thu hàng", value: "request" },
      ],
      onFilter: (value, record) => {
        if (value === "supply") return !!record.receipt_supply_id;
        if (value === "request") return !!record.receipt_request_id;
        return true;
      },
      render: (_, record) => (
        <Tag color={record.receipt_supply_id ? "blue" : "green"}>
          {record.receipt_supply_id ? "Cung cấp" : "Thu hàng"}
        </Tag>
      ),
    },
    {
      title: "Kho",
      dataIndex: ["storage_id", "name_storage"],
      key: "storage_id",
      align: "center",
      render: (text) => text || "Không có dữ liệu",
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      filters: [
        { text: "Chờ duyệt", value: "Chờ duyệt" },
        { text: "Nhập kho thành công", value: "Nhập kho thành công" },
        { text: "Đã huỷ", value: "Đã huỷ" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const colors = {
          "Chờ duyệt": "gold",
          "Nhập kho thành công": "blue",
          "Đã huỷ": "red",
        };
        return <Tag color={colors[status] || "default"}>{status}</Tag>;
      },
    },
    {
      title: "Ngày Nhập Kho",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (date) => (date ? converDateString(date) : "Không có dữ liệu"),
    },
    {
      title: "Ngày Cập Nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      align: "center",
      render: (date) => (date ? converDateString(date) : "Không có dữ liệu"),
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
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
          Quay lại
        </button>
        <h5 className="text-4xl font-bold text-gray-800 text-center flex-1 mr-6 ">
          Quản lý Đơn Nhập Kho
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
        title="Chi tiết Đơn Nhập Kho"
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
                  Người Quản Lý
                </div>
                <div className="col-span-6 p-3 border border-gray-300">
                  {selectedReceipt.manager_id?.full_name || "Không có"}
                </div>

                {/* Kho */}
                <div className="col-span-4 font-semibold p-3 bg-gray-100 border border-gray-300">
                  Kho
                </div>
                <div className="col-span-6 p-3 border border-gray-300">
                  {selectedReceipt.storage_id?.name_storage || "Không có"}
                </div>

                {/* Loại Đơn Hàng */}
                <div className="col-span-4 font-semibold p-3 bg-gray-100 border border-gray-300">
                  Loại Đơn Hàng
                </div>
                <div className="col-span-6 p-3 border border-gray-300">
                  {selectedReceipt.receipt_supply_id ? "Cung cấp" : "Thu hàng"}
                </div>

                {/* Số Lượng */}
                <div className="col-span-4 font-semibold p-3 bg-gray-100 border border-gray-300">
                  Số Lượng
                </div>
                <div className="col-span-6 p-3 border border-gray-300">
                  {selectedReceipt.receipt_request_id?.quantity ||
                    selectedReceipt.receipt_supply_id?.quantity ||
                    "Không có"}
                </div>

                {/* Trạng Thái */}
                <div className="col-span-4 font-semibold p-3 bg-gray-100 border border-gray-300">
                  Trạng Thái
                </div>
                <div className="col-span-6 p-3 border border-gray-300">
                  <Tag
                    color={
                      selectedReceipt.status === "Chờ duyệt"
                        ? "gold"
                        : selectedReceipt.status === "Đã duyệt"
                        ? "green"
                        : selectedReceipt.status === "Nhập kho thành công"
                        ? "blue"
                        : "red"
                    }
                  >
                    {selectedReceipt.status}
                  </Tag>
                </div>

                {/* Ngày Nhập Kho */}
                <div className="col-span-4 font-semibold p-3 bg-gray-100 border border-gray-300">
                  Ngày Nhập Kho
                </div>
                <div className="col-span-6 p-3 border border-gray-300">
                  {converDateString(selectedReceipt.createdAt) || "Không có"}
                </div>

                {/* Ngày Cập Nhật */}
                <div className="col-span-4 font-semibold p-3 bg-gray-100 border border-gray-300">
                  Ngày Cập Nhật
                </div>
                <div className="col-span-6 p-3 border border-gray-300">
                  {converDateString(selectedReceipt.updatedAt) || "Không có"}
                </div>

                {/* Ghi chú (Nếu có) */}
                {selectedReceipt.receipt_request_id?.note ||
                selectedReceipt.receipt_supply_id?.note ? (
                  <>
                    <div className="col-span-4 font-semibold p-3 bg-gray-100 border border-gray-300">
                      Ghi chú
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
                Duyệt
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
                Hủy
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
