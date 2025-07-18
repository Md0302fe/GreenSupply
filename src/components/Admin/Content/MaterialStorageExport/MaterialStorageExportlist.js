import React, { useEffect, useState } from "react";
import { Table, Button, message, Descriptions, Tag, Input, Space } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import axios from "axios";
import { useSelector } from "react-redux";
import _ from "lodash";
import { useMutationHooks } from "../../../../hooks/useMutationHook";
import Loading from "../../../LoadingComponent/Loading";
import DrawerComponent from "../../../DrawerComponent/DrawerComponent";
import * as MaterialServices from "../../../../services/MaterialStorageExportService";
import * as RawMaterialBatches from "../../../../services/RawMaterialBatch";
import { useLocation, useNavigate } from "react-router-dom";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import Highlighter from "react-highlight-words";
import { useTranslation } from "react-i18next";
import ButtonComponent from "../../../ButtonComponent/ButtonComponent";
import { FaFileExport } from "react-icons/fa6";

const statusColors = {
  "Chờ duyệt": "gold",
  "Đã duyệt": "green",
  "Hoàn thành": "blue",
};

const MaterialStorageExportList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [exports, setExports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedExport, setSelectedExport] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showSearchInput, setShowSearchInput] = useState(false); // Quản lý việc hiển thị thanh tìm kiếm nhỏ
  const [showStatusFilter, setShowStatusFilter] = useState(false); // Quản lý việc hiển thị lọc trạng thái
  const [searchedColumn, setSearchedColumn] = useState("");
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
            search: debouncedSearch,
            status: statusFilter,
            sortOrder: sortOrder,
          },
        }
      );
      if (response.data.success) {
        setExports(response.data.exports);
      } else {
        message.error(t("messages.fetchExportListError"));
      }
    } catch (error) {
      message.error(t("messages.connectionError"));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (location.state?.createdSuccess) {
      message.success(t("messages.createSuccess"));

      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const debounceFn = _.debounce(() => {
      setDebouncedSearch(searchText);
    }, 500);

    debounceFn();
    return () => debounceFn.cancel();
  }, [searchText]);

  useEffect(() => {
    fetchExports();
  }, [debouncedSearch, statusFilter, sortOrder]);

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

  const getColumnSearchProps = (dataIndex, placeholder) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          placeholder={placeholder || `Tìm kiếm ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
          autoFocus
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => {
              clearFilters();
              setSearchText("");
              fetchExports();
            }}
            size="small"
            style={{ width: 70 }}
          >
            Đặt lại
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
              setShowSearchInput(false);
            }}
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
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : false,
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setShowSearchInput(true);
      } else {
        setShowSearchInput(false);
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

  const columns = [
    {
      title: (
        <div style={{ textAlign: "left", width: "100%" }}>
          {t("materialExportList.exportType")}
        </div>
      ),
      dataIndex: "type_export",
      key: "type_export",
      align: "left",
      // ...getColumnSearchProps("type_export", "Tìm loại xuất kho"),
      // sorter: (a, b) => a.type_export?.localeCompare(b.type_export),
      render: (text) => <span>{text || "Không rõ"}</span>,
    },
    {
      title: (
        <div style={{ textAlign: "left", width: "100%" }}>
          {t("materialExportList.exportName")}
        </div>
      ),
      key: "exportName",
      align: "left",
      ...getColumnSearchProps(
        ["exportName", "export_name"],
        "Tìm yêu cầu sản xuất"
      ),
      sorter: (a, b) =>
        (a?.export_name || "").localeCompare(b?.export_name || ""),
      render: (_, record) => <span>{record?.export_name || "Không rõ"}</span>,
    },
    {
      title: (
        <div style={{ textAlign: "left", width: "100%" }}>
          {t("materialExportList.batch")}
        </div>
      ),
      key: "batch",
      align: "left",
      ...getColumnSearchProps(["batch_id", "batch_name"], "Tìm lô nguyên liệu"),
      sorter: (a, b) =>
        (a.batch_id?.batch_name || "").localeCompare(
          b.batch_id?.batch_name || ""
        ),
      render: (_, record) => (
        <span>{record?.batch_id?.batch_name || "Không rõ"}</span>
      ),
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>
          {t("materialExportList.status")}
        </div>
      ),
      dataIndex: "status",
      key: "status",
      align: "center",
      filters: [
        { text: t("status.pending"), value: "Chờ duyệt" },
        { text: t("status.completed"), value: "Hoàn thành" },
        { text: t("status.cancelled"), value: "Đã hủy" },
      ],
      onFilter: (value, record) => record.status === value,
      filteredValue: statusFilter ? [statusFilter] : null,
      // sorter: (a, b) => a.status.localeCompare(b.status),
      render: (status) => {
        const color = statusColors[status] || "default";
        return (
          <div className="flex justify-center">
            <Tag color={color}>
              {t(`status.${statusMap[status]}`) || status}
            </Tag>
          </div>
        );
      },
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>
          {t("common.action")}
        </div>
      ),
      key: "action",
      align: "center",
      render: (_, record) => (
        <div className="flex justify-center">
          <Button
            type="link"
            icon={
              <HiOutlineDocumentSearch
                style={{ fontSize: "20px", color: "dodgerblue" }}
              />
            }
            onClick={() => showExportDetails(record._id)}
          />
        </div>
      ),
    },
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    if (filters.status) {
      setStatusFilter(filters.status[0] || "");
    } else {
      setStatusFilter("");
    }

    if (sorter.order) {
      setSortOrder(sorter.order === "ascend" ? "asc" : "desc");
    }
  };

  // Accept Request
  const mutationAccept = useMutationHooks(async (data) => {
    const response = await MaterialServices.handleAcceptMaterialExport(data);
    return response;
  });
  const { isPending, isSuccess, data } = mutationAccept;

  const handleAccept = async () => {
    try {
      await mutationAccept.mutateAsync({
        access_token: userRedux?.access_token,
        storage_export_id: selectedExport._id,
      });

      const batchId = selectedExport?.batch_id?._id;

      if (batchId) {
        await RawMaterialBatches.updateRawMaterialBatchStatus(
          batchId,
          "Đã xuất kho",
          userRedux?.access_token
        );
      }

      message.success(t("messages.approveSuccess"));
      setIsDrawerOpen(false);
      fetchExports();
    } catch (error) {
      console.error("Lỗi khi duyệt đơn:", error);
      message.error(t("messages.approveError"));
    }
  };

  const showExportDetails = (id) => {
    setLoading(true);
    axios
      .get(
        `${process.env.REACT_APP_API_URL}/material-storage-export/getRawMaterialBatchById/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        if (response.data.success) {
          setSelectedExport(response.data.export);
          setIsDrawerOpen(true); // mở drawer
        } else {
          message.error(t("messages.notFound"));
        }
      })
      .catch(() => message.error(t("messages.fetchDetailError")))
      .finally(() => setLoading(false));
  };

  // Reject Request
  const mutationReject = useMutationHooks(async (data) => {
    const response = await MaterialServices.handleRejectMaterialExport(data);
    return response;
  });

  const {
    isPending: isPendingDelete,
    isSuccess: isSuccessDelete,
    data: dataDelete,
  } = mutationReject;

  const handleReject = () => {
    mutationReject.mutate({
      access_token: userRedux?.access_token,
      storage_export_id: selectedExport._id,
    });
  };

  useEffect(() => {
    if (isSuccessDelete) {
      if (dataDelete?.success) {
        message.success(t("messages.deleteSuccess"));
        setIsDrawerOpen(false);
      } else {
        message.error(t("messages.deleteError"));
        setIsDrawerOpen(false);
      }
      fetchExports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessDelete, dataDelete]);

  return (
    <div className="material-storage-export-list md:px-8  ">
      {/* Tiêu đề và nút quay lại */}
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
          {/* <FaFileExport></FaFileExport> */}
          {t("materialExportList.title")}
        </h2>

        {/* Phần tử trống bên phải để cân bằng với nút bên trái */}
        <div className="min-w-[20px] md:min-w-[100px]"></div>
      </div>

      <Loading isPending={loading}>
        <Table
          columns={columns}
          dataSource={exports}
          rowKey="_id"
          pagination={{ pageSize: 6 }}
          onChange={handleTableChange}
          scroll={{ x: "max-content" }}
        />
      </Loading>

      {/* ✅ Drawer hiển thị chi tiết */}
      <DrawerComponent
        title={t("materialExportList.detailTitle")}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedExport(null);
        }}
        placement="right"
        width={drawerWidth}
      >
        <div className="w-full p-6 bg-white rounded-md shadow min-w-[400px]">
          {selectedExport ? (
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block font-semibold mb-1">
                  {t("materialExportList.createdBy")}
                </label>
                <input
                  type="text"
                  disabled
                  value={
                    selectedExport?.user_id?.full_name || t("common.no_data")
                  }
                  className="border p-2 rounded w-full bg-gray-100"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  {t("materialExportList.exportName")}
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedExport?.export_name || t("common.no_data")}
                  className="border p-2 rounded w-full bg-gray-100"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  {t("materialExportList.batchName")}
                </label>
                <input
                  type="text"
                  disabled
                  value={
                    selectedExport?.batch_id?.batch_name || t("common.no_data")
                  }
                  className="border p-2 rounded w-full bg-gray-100"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  {t("materialExportList.batchId")}
                </label>
                <input
                  type="text"
                  disabled
                  value={
                    selectedExport?.batch_id?.batch_id || t("common.no_data")
                  }
                  className="border p-2 rounded w-full bg-gray-100"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">
                    {t("materialExportList.exportType")}
                  </label>
                  <input
                    type="text"
                    disabled
                    value={selectedExport?.type_export || t("common.no_data")}
                    className="border p-2 rounded w-full bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    {t("materialExportList.status")}
                  </label>
                  <div className="border p-2 rounded w-full bg-gray-100">
                    <Tag
                      color={statusColors[selectedExport.status] || "default"}
                    >
                      {t(`status.${statusMap[selectedExport.status]}`) ||
                        selectedExport.status}
                    </Tag>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  {t("materialExportList.createdDate")}
                </label>
                <input
                  type="text"
                  disabled
                  value={
                    selectedExport?.createdAt
                      ? new Date(selectedExport.createdAt).toLocaleString()
                      : t("common.no_data")
                  }
                  className="border p-2 rounded w-full bg-gray-100"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  {t("materialExportList.note")}
                </label>
                <textarea
                  disabled
                  value={selectedExport?.note || t("common.no_data")}
                  className="border p-2 rounded w-full bg-gray-100"
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">{t("common.loading")}</p>
          )}

          <div className="flex justify-end gap-2.5 mt-6">
            {selectedExport?.status === "Chờ duyệt" && (
              <>
                <ButtonComponent type="approve-order" onClick={handleAccept} />
                <ButtonComponent type="cancel-order" onClick={handleReject} />
              </>
            )}
            <ButtonComponent
              type="close"
              onClick={() => setIsDrawerOpen(false)}
            />
          </div>
        </div>
      </DrawerComponent>

      {/* messageContainer */}
      <messageContainer
        hideProgressBar={false}
        position="top-right"
        newestOnTop={false}
        pauseOnFocusLoss
        autoClose={3000}
        closeOnClick
        pauseOnHover
        theme="light"
        rtl={false}
        draggable
      />
    </div>
  );
};

export default MaterialStorageExportList;
