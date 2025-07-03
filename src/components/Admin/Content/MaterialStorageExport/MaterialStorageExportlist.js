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
      align: "center",
      render: (text) => (
        <div style={{ textAlign: "left" }}>{text || "Không rõ"}</div>
      ),
    },
    {
      title: (
        <div style={{ textAlign: "left", width: "100%" }}>
          {t("materialExportList.productionRequest")}
        </div>
      ),
      key: "production_request",
      align: "left",
      render: (_, record) => (
        <div style={{}}>
          {record?.production_request_id?.request_name || "Không rõ"}
        </div>
      ),
    },
    {
      title: (
        <div style={{ textAlign: "left", width: "100%" }}>
          {t("materialExportList.batch")}
        </div>
      ),
      key: "batch",
      align: "left",
      render: (_, record) => (
        <div style={{}}>{record?.batch_id?.batch_name || "Không rõ"}</div>
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
        {
          text: t("status.pending"),
          value: "Chờ duyệt",
        },
        {
          text: t("status.completed"),
          value: "Hoàn thành",
        },
      ],
      onFilter: (value, record) => record.status === value,
      filteredValue: statusFilter ? [statusFilter] : null,
      render: (status) => {
        let color = "";
        switch (status) {
          case "Chờ duyệt":
            color = "orange";
            break;
          case "Đã duyệt":
            color = "green";
            break;
          case "Đã hủy":
            color = "red";
            break;
          case "Hoàn thành":
            color = "blue";
            break;
          case "Đang xử lý":
            color = "yellow";
            break;
          default:
            color = "default";
        }

        return (
          <div style={{ textAlign: "center" }}>
            <Tag color={color}>
              {t(`status.${statusMap[status] || status}`)}
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
        <div style={{ display: "flex", justifyContent: "center" }}>
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
    // Cập nhật filter trạng thái
    if (filters.status) {
      setStatusFilter(filters.status[0] || "");
    } else {
      setStatusFilter("");
    }

    // Cập nhật sortOrder theo createdAt hoặc export_name nếu muốn
    if (sorter.order) {
      // sorter.order là 'ascend' hoặc 'descend'
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
          setIsDrawerOpen(true); // ✅ mở drawer
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
      <div
        className="flex items-center justify-between my-8"
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
          <span className="hidden md:inline">{t("common.back")}</span>
        </Button>

        {/* Tiêu đề ở giữa */}
        <h2 className="text-center flex items-center justify-center gap-2 font-bold text-[20px] md:text-2xl flex-grow mx-4 mt-1 mb-1 text-gray-800">
          <FaFileExport></FaFileExport>
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
        {selectedExport ? (
          <Descriptions
            bordered
            column={1}
            labelStyle={{ width: "40%", fontWeight: "600" }}
            contentStyle={{ width: "60%" }}
          >
            <Descriptions.Item label={t("materialExportList.createdBy")}>
              {selectedExport?.user_id?.full_name || "Không rõ"}
            </Descriptions.Item>
            <Descriptions.Item
              label={t("materialExportList.productionRequest")}
            >
              {selectedExport?.production_request_id?.request_name ||
                t("common.no_data")}
            </Descriptions.Item>
            <Descriptions.Item label={t("materialExportList.batchName")}>
              {selectedExport?.batch_id?.batch_name || t("common.no_data")}
            </Descriptions.Item>
            <Descriptions.Item label={t("materialExportList.batchId")}>
              {selectedExport?.batch_id?.batch_id || t("common.no_data")}
            </Descriptions.Item>
            <Descriptions.Item label={t("materialExportList.exportName")}>
              {selectedExport?.export_name || t("common.no_data")}
            </Descriptions.Item>
            <Descriptions.Item label={t("materialExportList.exportType")}>
              {selectedExport?.type_export || t("common.no_data")}
            </Descriptions.Item>
            <Descriptions.Item label={t("materialExportList.status")}>
              <Tag color={statusColors[selectedExport.status] || "default"}>
                {t(`status.${statusMap[selectedExport.status]}`) || selectedExport.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t("materialExportList.createdDate")}>
              {new Date(selectedExport.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label={t("materialExportList.note")}>
              {selectedExport?.note || t("common.no_data")}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <p className="text-center">Đang tải dữ liệu...</p>
        )}

        {/* Nút phê duyệt và từ chối (nếu trạng thái là "Chờ duyệt") */}
        <div className="flex flex-row justify-space-between gap-2.5 lg:gap-4 mt-4">
          {selectedExport?.status === "Chờ duyệt" && (
            <>
              <Button
                type="primary"
                onClick={handleAccept}
                className="bg-blue-600 text-white font-bold px-2 lg:px-4 py-2 rounded hover:bg-blue-700 w-full md:w-auto"
              >
                {t("common.approve")}
              </Button>
              <Button
                danger
                onClick={handleReject}
                className="bg-red-600 text-red font-bold px-2 lg:px-4 py-2 rounded hover:bg-red-700 w-full md:w-auto"
              >
                {t("common.reject")}
              </Button>
            </>
          )}
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="bg-gray-500 text-white font-bold px-2 md:px-4 py-1 rounded hover:bg-gray-600 w-full md:w-auto"
          >
            {t("common.close")}
          </button>
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
