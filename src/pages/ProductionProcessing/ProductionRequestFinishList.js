import React, { useEffect, useState, useRef } from "react";
import { Table, Input, Space, Tag, Button, Form } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import Highlighter from "react-highlight-words";
import axios from "axios";
import { convertDateStringV1 } from "../../ultils";
import Loading from "../../components/LoadingComponent/Loading";
import DrawerComponent from "../../components/DrawerComponent/DrawerComponent";
import * as ProductionRequestServices from "../../services/ProductionRequestServices";
import { FcTodoList } from "react-icons/fc";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { HiOutlineDocumentSearch } from "react-icons/hi";
import { FaG, FaGear } from "react-icons/fa6";
import { Trans, useTranslation } from "react-i18next";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";

// Hàm lấy danh sách Nguyên liệu
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
  const { t } = useTranslation();
  const statusMap = {
    "Đã duyệt": "approve",
    "Đang sản xuất": "in_production",
    "Đã Hoàn Thành": "completed",
    "Đang xử lý": "processing",
    "Vô hiệu hóa": "disabled",
  };
  const user = useSelector((state) => state.user);

  // State quản lý Drawer & chế độ Edit
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();
  // Search
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [filteredStatus, setFilteredStatus] = useState(null);
  const location = useLocation();


  // 1. FETCH danh sách kế hoạch (GET)
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
      .filter((req) => {
        if (filteredStatus) {
          return req.status === filteredStatus;
        }
        return req.status === "Đã duyệt" || req.status === "Đang sản xuất";
      })
      .map((req) => ({ ...req, key: req._id }))
    : [];

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const statusFromURL = queryParams.get("status");

    if (statusFromURL) {
      setFilteredStatus(statusFromURL);
    }
  }, [location.search]);


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
          placeholder={t("common.search")}
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
            {t("common.search")}
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 70 }}
          >
            {t("common.reset")}
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => clearFilters && confirm()}
            style={{ padding: 0 }}
          >
            {t("common.close")}
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
      title: t("form.request_name"),
      dataIndex: "request_name",
      key: "request_name",
      ...getColumnSearchProps("request_name"),
      sorter: (a, b) => a.request_name.localeCompare(b.request_name),
    },
    {
      title: <div className="text-center">{t("form.product_quantity")}</div>,
      dataIndex: "product_quantity",
      key: "product_quantity",
      align: "center",
      className: "text-center",
      sorter: (a, b) => a.product_quantity - b.product_quantity,
      render: (val) => `${val}`,
    },
    {
      title: <div className="text-center">{t("form.material_quantity")}</div>,
      dataIndex: "material_quantity",
      key: "material_quantity",
      align: "center",
      className: "text-center",
      sorter: (a, b) => a.material_quantity - b.material_quantity,
      render: (val) => `${val}`,
    },
    {
      title: <div className="text-center">{t("form.production_date")}</div>,
      dataIndex: "production_date",
      key: "production_date",
      align: "center",
      className: "text-center",
      sorter: (a, b) =>
        new Date(a.production_date) - new Date(b.production_date),
      render: (date) => convertDateStringV1(date),
    },
    {
      title: <div className="text-center">{t("form.end_date")}</div>,
      dataIndex: "end_date",
      key: "end_date",
      align: "center",
      className: "text-center",
      sorter: (a, b) => new Date(a.end_date) - new Date(b.end_date),
      render: (date) => convertDateStringV1(date),
    },
    {
      title: <div className="text-center">{t("form.status")}</div>,
      dataIndex: "status",
      key: "status",
      align: "center",
      className: "text-center",
      filters: [
        { text: t("status.in_production"), value: "Đang sản xuất" },
        { text: t("status.approve"), value: "Đã duyệt" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (stt) => (
        <Tag color={statusColors[stt] || "default"}>
          {t(`status.${statusMap[stt]}`) || stt}
        </Tag>
      ),
    },
    {
      title: <div className="text-center">{t("common.action")}</div>,
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
    <div className="production-request-list px-8">
      <div className="mt-2 mb-2">
        <div className="flex items-center justify-between my-6">
          {/* Nút quay lại responsive */}
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

          {/* Tiêu đề căn giữa */}
          <h5 className="text-center flex items-center justify-center gap-2 font-bold text-[18px] md:text-2xl flex-grow mx-4">
            <FcTodoList></FcTodoList>
            {t("page.title")}
          </h5>

          {/* Phần tử trống bên phải để cân bằng layout */}
          <div className="min-w-[20px] md:min-w-[100px]"></div>
        </div>
      </div>
      {/* Notifications Tạo Quy Trình */}
      <div className="space-y-2 text-sm my-4 ">
        <div className="flex flex-wrap items-center gap-2 ">
          <p className="">
            <Trans i18nKey="hint.create_plan_process">
              + Tạo quy trình
              <span className="font-medium text-blue-600 ml-1">(đơn)</span> bằng
              cách click vào biểu tượng
            </Trans>
          </p>
          <span className="text-green-600 inline-block cursor-pointer">
            <FaGear />
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <p className="">
            <Trans i18nKey="hint.create_batch_process">
              + Tạo quy trình
              <span className="font-medium text-green-600 ml-1">
                (tổng hợp)
              </span>{" "}
              bằng cách chọn vào nút
            </Trans>
          </p>
          <button
            className="font-semibold text-white bg-green-600 px-2 py-1 rounded cursor-pointer"
            onClick={() =>
              navigate(
                "/system/admin/production-processing/consolidated-create"
              )
            }
          >
            {t("action.create_batch_process")}
          </button>
        </div>
      </div>

      <Loading isPending={isLoading}>
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={{ pageSize: 5 }}
          scroll={{ x: "max-content" }}
        />
      </Loading>

      <DrawerComponent
        title={t("drawer.detail_title")}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        placement="right"
        width={drawerWidth}
      >
        {selectedRequest && (
          <div>
            <Form layout="vertical" disabled>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Tên đơn - chiếm toàn dòng */}
                <Form.Item
                  label={t("form.request_name")}
                  className="!mb-0 lg:col-span-2"
                >
                  <Input value={selectedRequest.request_name} />
                </Form.Item>

                {/* Nguyên liệu - chiếm toàn dòng */}
                <Form.Item
                  label={t("form.material_id")}
                  className="!mb-0 lg:col-span-2"
                >
                  <Input value={selectedRequest.material} />
                </Form.Item>

                {/* Loại đơn */}
                <Form.Item label={t("form.request_type")} className="!mb-0">
                  <Input value={selectedRequest.request_type} />
                </Form.Item>

                {/* Trạng thái */}
                <Form.Item label={t("form.status")} className="!mb-0">
                  <div className="border border-gray-300 rounded px-2 py-1 h-[40px] flex items-center">
                    <Tag color={statusColors[selectedRequest.status] || "default"}>
                      {t(`status.${statusMap[selectedRequest.status]}`) || selectedRequest.status}
                    </Tag>
                  </div>
                </Form.Item>

                <Form.Item label={t("form.product_quantity")} className="!mb-0">
                  <Input value={`${selectedRequest.product_quantity} Kg`} />
                </Form.Item>

                <Form.Item label={t("form.material_quantity")} className="!mb-0">
                  <Input value={`${selectedRequest.material_quantity} Kg`} />
                </Form.Item>

                <Form.Item label={t("form.loss_percentage")} className="!mb-0">
                  <Input value={`${selectedRequest.loss_percentage ?? 0}%`} />
                </Form.Item>

                <Form.Item label={t("form.priority")} className="!mb-0">
                  <Input value={selectedRequest.priority ?? "-"} />
                </Form.Item>

                <Form.Item label={t("form.production_date")} className="!mb-0">
                  <Input value={convertDateStringV1(selectedRequest.production_date)} />
                </Form.Item>

                <Form.Item label={t("form.end_date")} className="!mb-0">
                  <Input value={convertDateStringV1(selectedRequest.end_date)} />
                </Form.Item>

                {selectedRequest.note && (
                  <Form.Item label={t("form.note")} className="lg:col-span-2 !mb-0">
                    <Input.TextArea value={selectedRequest.note} rows={3} />
                  </Form.Item>
                )}
              </div>
            </Form>

            {/* Nút hành động */}
            <div className="flex justify-end items-center gap-4 mt-6">
              {selectedRequest.status === "Đã duyệt" && (
                <ButtonComponent type="create-process" onClick={() => navigate(`create/${selectedRequest._id}`)} />
              )}
              <ButtonComponent type="close" onClick={() => setIsDrawerOpen(false)} />
            </div>
          </div>
        )}
      </DrawerComponent>
    </div>
  );
};

export default ProductionRequestList;
