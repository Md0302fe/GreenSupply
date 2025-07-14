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
  Form,
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
import { GoPackageDependencies } from "react-icons/go";
import ButtonComponent from "../../../ButtonComponent/ButtonComponent";

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
  const [receiptTypeFilter, setReceiptTypeFilter] = useState("1");
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
            receipt_type: receiptTypeFilter,
          },
        }
      );
      if (response.data.success) {
        const rawData = response.data.data.map((item) => ({
          ...item,
          manager: item.manager_id?.full_name || "",
        }));
        setOriginalReceipts(rawData);
        setReceipts(rawData);
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

  useEffect(() => {
    fetchReceipts();
  }, [debouncedSearch, statusFilterVal, sortOrder, receiptTypeFilter]);

  const confirmUpdateStatus = (id, newStatus) => {
    Modal.confirm({
      title: t(
        `fuelStorage.confirmTitle.${newStatus === "Nhập kho thành công" ? "approve" : "cancel"
        }`
      ),
      content: t(
        `fuelStorage.confirmContent.${newStatus === "Nhập kho thành công" ? "approve" : "cancel"
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
      title: (
        <div className="text-center">{t("fuelStorage.columns.manager")}</div>
      ),
      dataIndex: "manager", // thêm alias cho search
      key: "manager",
      className: "text-center",
      ...getColumnSearchProps("manager"),
      render: (_, record) =>
        record.manager_id?.full_name || "Admin",
    },
    {
      title: (
        <div className="text-center">
          {t("fuelStorage.columns.receiptType")}
        </div>
      ),
      key: "receipt_type",
      className: "text-center",
      render: (_, record) => {
        if (record.receipt_type === "1") {
          if (record.receipt_request_id) {
            return (
              <Tag color="green">{t("fuelStorage.receiptType.request")}</Tag>
            );
          }
          if (record.receipt_supply_id) {
            return (
              <Tag color="blue">{t("fuelStorage.receiptType.supply")}</Tag>
            );
          }
          return <Tag color="default">{t("fuelStorage.receiptType.raw")}</Tag>;
        } else if (record.receipt_type === "2") {
          return (
            <Tag color="purple">{t("fuelStorage.receiptType.product")}</Tag>
          );
        } else {
          return <Tag color="gray">{t("fuelStorage.receiptType.unknown")}</Tag>;
        }
      },
    },
    {
      title: (
        <div className="text-center">{t("fuelStorage.columns.storage")}</div>
      ),
      dataIndex: ["storage_id", "name_storage"],
      key: "storage_id",
      className: "text-center",
      render: (text) => text || t("fuelStorage.noDataShort"),
    },
    {
      title: (
        <div className="text-center">{t("fuelStorage.columns.status")}</div>
      ),
      dataIndex: "status",
      key: "status",
      className: "text-center",
      filters: [
        { text: t("status.pending"), value: "Chờ duyệt" },
        { text: t("status.processing"), value: "Đang xử lý" },
        { text: t("status.imported"), value: "Nhập kho thành công" },
        { text: t("status.importFailed"), value: "Nhập kho thất bại" },
        { text: t("status.cancelled"), value: "Đã huỷ" },
      ],
      onFilter: (value, record) => record.status === value,
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
          <Tag color={statusColors[statusKey] || "default"}>
            {t(`status.${statusKey}`) || statusKey}
          </Tag>
        );
      },
    },
    {
      title: (
        <div className="text-center">{t("fuelStorage.columns.createdAt")}</div>
      ),
      dataIndex: "createdAt",
      className: "text-center",
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (date) =>
        date ? converDateString(date) : t("fuelStorage.noDataShort"),
    },
    {
      title: (
        <div className="text-center">{t("fuelStorage.columns.updatedAt")}</div>
      ),
      dataIndex: "updatedAt",
      className: "text-center",
      sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
      render: (date) =>
        date ? converDateString(date) : t("fuelStorage.noDataShort"),
    },
    {
      title: t("fuelStorage.columns.action"),
      key: "action",
      className: "text-center",
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
    <div className="fuel-storage-receipt-list md:px-8">
      {/* Tiêu đề */}
      <div
        style={{ marginBottom: 24, marginTop: 24 }}
        className="flex items-center justify-between"
      >
        {/* Nút quay lại bên trái */}
        <Button
          onClick={() => navigate(-1)}
          type="primary"
          className="flex items-center justify-center md:justify-start text-white font-semibold transition duration-300 shadow-sm px-2 md:px-3 py-1 bg-black hover:opacity-70 rounded-md min-w-[20px] md:min-w-[100px]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 md:h-4 md:w-4 md:mr-1"
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
          <span className="hidden md:inline">{t("fuelStorage.back")}</span>
        </Button>

        {/* Title căn giữa */}
        <h5 className="text-center flex items-center justify-center gap-2 font-bold text-2xl md:text-2xl flex-grow mx-4 text-gray-800">
          <GoPackageDependencies></GoPackageDependencies>
          {t("fuelStorage.title")}
        </h5>

        {/* Phần tử trống bên phải để cân bằng nút quay lại */}
        <div className="min-w-[20px] md:min-w-[100px]"></div>
      </div>

      <div
        style={{
          marginBottom: 24,
          background: "#fafafa",
          padding: 16,
          borderRadius: 8,
        }}
      >
        {/* Label + Filter buttons */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex flex-col md:flex-row gap-2">
              <Button
                type={receiptTypeFilter === "1" ? "primary" : "default"}
                onClick={() => setReceiptTypeFilter("1")}
              >
                {t("fuelStorage.receiptType.raw")}
              </Button>
              <Button
                type={receiptTypeFilter === "2" ? "primary" : "default"}
                onClick={() => setReceiptTypeFilter("2")}
              >
                {t("fuelStorage.receiptType.product")}
              </Button>
            </div>
          </div>
        </div>
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
        scroll={{ x: "max-content" }}
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
        width={drawerWidth}
      >
        {selectedReceipt ? (
          <Form layout="vertical" disabled>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Người quản lý - full width */}
              <Form.Item label={t("fuelStorage.columns.manager")} className="col-span-1 lg:col-span-2 !mb-0">
                <Input
                  value={
                    selectedReceipt.manager_id?.full_name ||
                    t("fuelStorage.noDataShort")
                  }
                />
              </Form.Item>

              {/* Tên nguyên liệu - full width */}
              <Form.Item label={t("fuelProvide.fuelName")} className="col-span-1 lg:col-span-2 !mb-0">
                <Input
                  value={
                    selectedReceipt.receipt_request_id?.fuel_name ||
                    selectedReceipt.receipt_supply_id?.fuel_name ||
                    t("fuelStorage.noDataShort")
                  }
                />
              </Form.Item>

              {/* Loại đơn hàng */}
              <Form.Item label={t("fuelStorage.columns.receiptType")} className="!mb-0">
                <Input
                  value={
                    selectedReceipt.receipt_supply_id
                      ? t("fuelStorage.receiptType.supply")
                      : t("fuelStorage.receiptType.request")
                  }
                />
              </Form.Item>

              {/* Kho */}
              <Form.Item label={t("fuelStorage.columns.storage")}className="!mb-0">
                <Input
                  value={
                    selectedReceipt.storage_id?.name_storage ||
                    t("fuelStorage.noDataShort")
                  }
                />
              </Form.Item>

              {/* Đơn giá */}
              <Form.Item label={t("fuelProvide.price")}className="!mb-0">
                <Input
                  value={
                    selectedReceipt.receipt_request_id?.price !== undefined
                      ? selectedReceipt.receipt_request_id.price.toLocaleString() + " VNĐ"
                      : selectedReceipt.receipt_supply_id?.price !== undefined
                        ? selectedReceipt.receipt_supply_id.price.toLocaleString() + " VNĐ"
                        : t("fuelStorage.noDataShort")
                  }
                />
              </Form.Item>

              {/* Số lượng */}
              <Form.Item label={t("fuelStorage.columns.quantity")}className="!mb-0">
                <Input
                  value={
                    selectedReceipt.receipt_request_id?.quantity ||
                    selectedReceipt.receipt_supply_id?.quantity ||
                    t("fuelStorage.noDataShort")
                  }
                />
              </Form.Item>

              {/* Tổng giá và Trạng thái - cùng hàng trên màn hình lớn */}
                {/* Thành tiền */}
                <Form.Item label={t("fuelProvide.totalPrice")} className="!mb-0">
                  <Input
                    value={
                      selectedReceipt.receipt_request_id?.total_price !== undefined
                        ? selectedReceipt.receipt_request_id.total_price.toLocaleString() + " VNĐ"
                        : selectedReceipt.receipt_supply_id?.total_price !== undefined
                          ? selectedReceipt.receipt_supply_id.total_price.toLocaleString() + " VNĐ"
                          : t("fuelStorage.noDataShort")
                    }
                  />
                </Form.Item>

                {/* Trạng thái */}
                {selectedReceipt?.status && (
                  <Form.Item label={t("fuelStorage.columns.status")} className="!mb-0">
                    <div className="w-full h-[32px] border border-gray-300 rounded px-2 flex items-center justify-center">
                      <Tag
                        color={{
                          pending: "gold",
                          processing: "orange",
                          imported: "blue",
                          importFailed: "volcano",
                          cancelled: "red",
                        }[
                          {
                            "Chờ duyệt": "pending",
                            "Đang xử lý": "processing",
                            "Nhập kho thành công": "imported",
                            "Nhập kho thất bại": "importFailed",
                            "Đã huỷ": "cancelled",
                          }[selectedReceipt.status] || "default"
                        ]}
                      >
                        {t(
                          `status.${{
                            "Chờ duyệt": "pending",
                            "Đang xử lý": "processing",
                            "Nhập kho thành công": "imported",
                            "Nhập kho thất bại": "importFailed",
                            "Đã huỷ": "cancelled",
                          }[selectedReceipt.status]}`
                        ) || selectedReceipt.status}
                      </Tag>
                    </div>
                  </Form.Item>
                )}

              {/* Địa chỉ */}
              <Form.Item label={t("fuelProvide.address")} className="col-span-1 lg:col-span-2 !mb-0">
                <Input
                  value={
                    selectedReceipt.receipt_request_id?.address ||
                    selectedReceipt.receipt_supply_id?.address ||
                    t("fuelStorage.noDataShort")
                  }
                />
              </Form.Item>

              {/* Ngày tạo và cập nhật - shared row */}
              <Form.Item label={t("fuelStorage.columns.createdAt")}className="!mb-0">
                <Input value={converDateString(selectedReceipt.createdAt)} />
              </Form.Item>
              <Form.Item label={t("fuelStorage.columns.updatedAt")}className="!mb-0">
                <Input value={converDateString(selectedReceipt.updatedAt)} />
              </Form.Item>

              {/* Ghi chú - nếu có */}
              {(selectedReceipt.receipt_request_id?.note ||
                selectedReceipt.receipt_supply_id?.note) && (
                  <Form.Item
                    label={t("fuelStorage.columns.note")}
                    className="col-span-1 lg:col-span-2 !mb-0"
                  >
                    <Input.TextArea
                      value={
                        selectedReceipt.receipt_request_id?.note ||
                        selectedReceipt.receipt_supply_id?.note
                      }
                      rows={3}
                    />
                  </Form.Item>
                )}
            </div>
          </Form>

        ) : (
          <p className="text-center text-gray-500">
            {t("fuelStorage.loadingDetails")}
          </p>
        )}

        {/* Nút hành động */}
        <div className="flex justify-end gap-3 mt-4">
          <ButtonComponent
            type="approve-order"
            onClick={() =>
              confirmUpdateStatus(selectedReceipt?._id, "Nhập kho thành công")
            }
            disabled={
              loading ||
              !selectedReceipt ||
              ["Đã duyệt", "Nhập kho thành công", "Đã huỷ"].includes(
                selectedReceipt.status
              )
            }
          />

          <ButtonComponent
            type="cancel-order"
            onClick={() =>
              confirmUpdateStatus(selectedReceipt?._id, "Đã huỷ")
            }
            disabled={
              loading ||
              !selectedReceipt ||
              ["Đã duyệt", "Nhập kho thành công", "Đã huỷ"].includes(
                selectedReceipt.status
              )
            }
          />
          <ButtonComponent type="close" onClick={() => setIsDrawerOpen(false)} />
        </div>
      </DrawerComponent>

    </div>
  );
};

export default FuelStorageReceiptList;
