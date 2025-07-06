import { useSelector } from "react-redux";
import Highlighter from "react-highlight-words";
import { useQuery } from "@tanstack/react-query";
import { SearchOutlined } from "@ant-design/icons";
import Loading from "../../../LoadingComponent/Loading";
import React, { useState, useRef, useEffect } from "react";
import DrawerComponent from "../../../DrawerComponent/DrawerComponent";
import { Input, Space, Tag, Button } from "antd";
import * as MaterialServices from "../../../../services/MaterialStorageExportService";
import { HiOutlineDocumentSearch } from "react-icons/hi";

import TableHistories from "./TableHistories";
import { converDateString } from "../../../../ultils";
import { useTranslation } from "react-i18next";

import { FaFileExport } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const statusColors = {
  "Đã duyệt": "green",
  "Hoàn thành": "green",
  "Đã xóa": "red",
};

const RawMaterialBatchList = () => {
  const { t } = useTranslation();

  const user = useSelector((state) => state.user);
  // Loading status
  const [loadingDetails, setIsLoadDetails] = useState(false);
  // selected Row
  const [rowSelected, setRowSelected] = useState("");

  // Drawer state
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navigate = useNavigate();

  // Search state
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const statusMap = {
    "Chờ duyệt": "pending",
    "Đã duyệt": "approve",
    "Đã huỷ": "cancelled",
    "Đã hủy": "cancelled",
    "Hoàn thành": "completed",
    "Đang xử lý": "processing",
    "thất bại": "failed",
    "Vô hiệu hóa": "disable",
    "Nhập kho thành công": "imported",
  };
  // Details State
  const [stateDetailsBatch, setStateDetailsBatch] = useState({
    production_request_id: {},
    batch_id: "",
    user_id: "",
    export_name: "",
    type_export: "",
    note: "",
    status: "",
    createdAt: "",
    is_deleted: false,
    batch_history: {},
  });

  // GET ALL PRODUCT FROM DB
  const fetchBatchHistories = async () => {
    const access_token = user?.access_token;
    const res = await MaterialServices.getAllBatchStorageExportHistory(
      access_token
    );
    return res;
  };

  const queryBatchHistories = useQuery({
    queryKey: ["batch_histories"],
    queryFn: fetchBatchHistories,
  });
  const { isLoading, data } = queryBatchHistories;

  const tableData = Array.isArray(data?.requests)
    ? data?.requests?.map((batch) => ({
        ...batch,
        key: batch._id,
        batch_id: batch.material_export_id?.batch_id?.batch_id || "",
        batch_name: batch.material_export_id?.batch_id?.batch_name || "",
        type_export: batch.material_export_id?.type_export || "",
        status: batch.material_export_id?.status || "",
      }))
    : [];

  // Fetch : Get User Details
  const fetchGetUserDetails = async ({ storage_export_id, access_token }) => {
    const res = await MaterialServices.getAllBatchStorageExportHistoryDetail(
      storage_export_id,
      access_token
    );
    // Get respone từ api và gán vào state update details

    if (res?.data) {
      console.log("res?.data => ", res?.data.batch);
      const batchData = res?.data.batch.material_export_id;
      setStateDetailsBatch({
        production_request_id: batchData?.production_request_id,
        batch_id: batchData?.batch_id,
        user_id: batchData?.user_id,
        export_name: batchData?.export_name,
        type_export: batchData?.type_export,
        note: batchData?.note,
        status: batchData?.status,
        is_deleted: batchData?.is_deleted,
        batch_history: res?.data.batch,
      });
    }

    setIsLoadDetails(false);
    return res;
  };
  console.log("stateDetailsBatch => ", stateDetailsBatch);
  console.log(
    "stateDetailsBatch?.batch_id?.createdAt => ",
    stateDetailsBatch?.batch_id?.createdAt
  );
  // Handle each time rowSelected was call
  useEffect(() => {
    if (rowSelected) {
      if (isDrawerOpen) {
        setIsLoadDetails(true);
        fetchGetUserDetails({
          storage_export_id: rowSelected,
          access_token: user?.access_token,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelected, isDrawerOpen]);

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
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={t("common.search")}
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
      title: t("batchHistory.batchId"),
      dataIndex: "batch_id",
      key: "batch_id",
      ...getColumnSearchProps("batch_id"),
    },
    {
      title: t("batchHistory.batchName"),
      dataIndex: "batch_name",
      key: "batch_name",
      ...getColumnSearchProps("batch_name"),
      sorter: (a, b) => a.batch_name.localeCompare(b.batch_name),
    },
    {
      title: <div className="text-center">{t("batchHistory.exportType")}</div>,
      dataIndex: "type_export",
      key: "type_export",
      className: "text-center",
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
        { text: t("status.completed"), value: "Hoàn thành" },
        { text: t("status.cancelled"), value: "Đã huỷ" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (statusLabel) => {
        const statusKey = statusMap[statusLabel];
        const statusColors = {
          pending: "gold",
          processing: "orange",
          completed: "blue",
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
      title: <div className="text-center">{t("common.action")}</div>,
      key: "action",
      className: "text-center",
      render: (record) => (
        <Space>
          <Button
            type="link"
            icon={
              <HiOutlineDocumentSearch
                style={{ fontSize: "20px", color: "dodgerblue" }}
              />
            }
            onClick={() => handleViewDetail(record)}
          ></Button>
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

  console.log(
    "stateDetailsBatch.batch?.createdAt -> ",
    stateDetailsBatch.batch?.createdAt
  );

  return (
    <div className="raw-material-batch-list md:px-8 ">
      <div className="flex items-center justify-between my-8">
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
          <span className="hidden md:inline">{t("common.back")}</span>
        </Button>

        {/* Tiêu đề ở giữa */}
        <h2 className="text-center flex items-center justify-center gap-2 font-bold text-[20px] md:text-2xl flex-grow mx-4 mt-1 mb-1 text-gray-800">
          <FaFileExport></FaFileExport>
          {t("batchHistory.title")}
        </h2>

        {/* Phần tử trống bên phải để cân bằng với nút bên trái */}
        <div className="min-w-[20px] md:min-w-[100px]"></div>
      </div>

      <Loading isPending={isLoading || loadingDetails}>
        <TableHistories
          // Props List
          columns={columns}
          isLoading={isLoading}
          data={tableData}
          setRowSelected={setRowSelected}
          pagination={{ pageSize: 6 }}
          onRow={(record, rowIndex) => {
            return {
              onClick: (event) => {
                setRowSelected(record._id);
              },
            };
          }}
          scroll={{ x: "max-content" }}
        ></TableHistories>
      </Loading>

      <DrawerComponent
        title={t("batchHistory.detailTitle")}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        placement="right"
        width={drawerWidth}
      >
        <Loading isPending={loadingDetails}>
          {/* Form cập nhật đơn thu Nguyên liệu */}
          <div className="w-full bg-gray-100 p-0 lg:p-6">
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
              <div className="space-y-4">
                {/* Tên đơn */}
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    {t("batchHistory.requestName")}
                  </label>
                  <input
                    type="text"
                    name="request_name"
                    maxLength="50"
                    placeholder={t("batchHistory.requestNamePlaceholder")}
                    value={stateDetailsBatch?.batch_id.batch_name || ""}
                    className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                  />
                </div>

                {/* Tên Lô */}
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    {t("materialBatch.batchName")}
                  </label>
                  <input
                    type="text"
                    name="request_name"
                    maxLength="50"
                    placeholder={t("batchHistory.batchNamePlaceholder")}
                    value={stateDetailsBatch.export_name || ""}
                    className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                  />
                </div>

                {/* Ảnh Nguyên liệu */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 min-h-[20vh]">
                  {/* Tiêu đề */}
                  <div className="w-full md:w-1/4 text-gray-800 font-semibold">
                    {t("batchHistory.image")}
                  </div>

                  {/* Hiển thị hình ảnh */}
                  {stateDetailsBatch?.fuel_image && (
                    <div className="w-full md:w-1/2">
                      <img
                        src={stateDetailsBatch.fuel_image}
                        alt="Hình ảnh Nguyên liệu"
                        className="w-full h-auto max-h-[300px] object-contain rounded-lg shadow-md border border-gray-300"
                      />
                    </div>
                  )}
                </div>

                {/* Số lượng cần thu */}
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    {t("batchHistory.totalQuantity")}
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    placeholder={t("common.enterQuantity")}
                    value={stateDetailsBatch?.batch_id?.quantity}
                    onChange={() => {}}
                    className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                  />
                </div>

                {/* Mức độ ưu tiên */}
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    {t("batchHistory.exportType")}
                  </label>
                  <input
                    type="text"
                    name="type_export"
                    min="1"
                    placeholder={t("batchHistory.exportType")}
                    value={stateDetailsBatch?.type_export}
                    onChange={() => {}}
                    className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                  />
                </div>

                {/* Ngày tạo lô */}
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    {t("batchHistory.createdDate")}
                  </label>
                  <input
                    type="text"
                    name="type_export"
                    min="1"
                    placeholder={t("batchHistory.createdDate")}
                    value={converDateString(
                      stateDetailsBatch?.batch_id?.createdAt
                    )}
                    className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                  />
                </div>

                {/* Trạng thái phiếu xuất */}
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    {t("batchHistory.status")}
                  </label>
                  <div className="p-2 w-full border border-gray-300 rounded inline-block">
                    <Tag
                      color={
                        statusColors[stateDetailsBatch.status] || "default"
                      }
                    >
                      {t(`status.${statusMap[stateDetailsBatch.status]}`) ||
                        stateDetailsBatch.status}
                    </Tag>
                  </div>
                </div>

                {/* Ngày tạo lô */}
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    {t("batchHistory.exportDate")}
                  </label>
                  <input
                    type="text"
                    name="type_export"
                    min="1"
                    placeholder={t("batchHistory.exportDate")}
                    value={converDateString(
                      stateDetailsBatch?.batch_history?.createdAt
                    )}
                    className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                  />
                </div>

                {/* Ghi chú */}
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    {t("batchHistory.note")}
                  </label>
                  <textarea
                    name="note"
                    placeholder={t("batchHistory.note")}
                    rows="3"
                    value={stateDetailsBatch?.note}
                    className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </Loading>
        <div className="flex justify-end mt-4">
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="bg-gray-500 text-white font-bold px-4 py-2 rounded hover:bg-gray-600"
          >
            Đóng
          </button>
        </div>
      </DrawerComponent>
    </div>
  );
};

export default RawMaterialBatchList;
