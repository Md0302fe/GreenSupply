import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  Input,
  Space,
  Tag,
  Button,
  Form,
  InputNumber,
  DatePicker,
  Select,
  message,
  Modal, // Thêm import Modal
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useQuery, useMutation } from "@tanstack/react-query";
import Highlighter from "react-highlight-words";
import moment from "moment";
import axios from "axios";
import dayjs from "dayjs";
import { convertDateStringV1 } from "../../../../ultils";
import Loading from "../../../LoadingComponent/Loading";
import DrawerComponent from "../../../DrawerComponent/DrawerComponent";
import * as ProductionRequestServices from "../../../../services/ProductionRequestServices";
import { VscChecklist } from "react-icons/vsc";
import { useNavigate } from "react-router-dom";
import { AiFillEdit } from "react-icons/ai";
import ButtonComponent from "../../../ButtonComponent/ButtonComponent";

import { HiOutlineDocumentSearch } from "react-icons/hi";
import { MdDelete } from "react-icons/md";
import { useTranslation } from "react-i18next";
// Hàm lấy danh sách Nguyên liệu
export const getAllFuelType = async () => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/fuel-management/getAll`
  );
  return res?.data; // Giả sử { success, requests: [...] }
};

const statusColors = {
  "Chờ duyệt": "gold",
  "Đang sản xuất": "blue",
  "Đã Hoàn Thành": "purple",
  "Đã duyệt": "green",
  "Vô hiệu hóa": "gray",
};

const ProductionRequestList = () => {
  const user = useSelector((state) => state.user);
  const statusMap = {
    "Chờ duyệt": "pending",
    "Đã duyệt": "approve",
    "Đã huỷ": "cancelled",
    "Đã hủy": "cancelled",
    "Hoàn Thành": "completed",
    "Đang xử lý": "processing",
    "thất bại": "failed",
    "Vô hiệu hóa": "disable",
    "Nhập kho thành công": "imported",
    "Đang sản xuất": "in_production",
  };
  const { t } = useTranslation();
  // State quản lý Drawer & chế độ Edit
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form để bind data khi chỉnh sửa
  const [form] = Form.useForm();
  useEffect(() => {
    if (selectedRequest && isEditMode) {
      form.setFieldsValue({
        request_name: selectedRequest.request_name,
        request_type: selectedRequest.request_type,
        material: selectedRequest.material_id || selectedRequest.material,
        product_quantity: selectedRequest.product_quantity,
        material_quantity: selectedRequest.material_quantity,
        loss_percentage: selectedRequest.loss_percentage,
        priority: selectedRequest.priority,
        production_date: dayjs(selectedRequest.production_date),
        end_date: dayjs(selectedRequest.end_date),
        status: selectedRequest.status,
        note: selectedRequest.note,
      });
    }
  }, [selectedRequest, isEditMode, form]);

  const navigate = useNavigate();

  // Search
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  // Danh sách Nguyên liệu
  const [fuelLoading, setFuelLoading] = useState(false);
  const [fuelTypes, setFuelTypes] = useState([]);

  // Lấy danh sách Nguyên liệu 1 lần
  useEffect(() => {
    const fetchFuelTypes = async () => {
      setFuelLoading(true);
      try {
        const data = await getAllFuelType();
        setFuelTypes(data.requests || []);
      } catch (error) {
        message.error(t("message.fuel_load_error"));
      } finally {
        setFuelLoading(false);
      }
    };
    fetchFuelTypes();
  }, []);

  // 1. FETCH danh sách đơn (GET)
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
    ? data.map((req) => ({ ...req, key: req._id }))
    : [];

  // 2. MUTATION cập nhật (PATCH)
  const mutationUpdate = useMutation({
    mutationFn: ProductionRequestServices.updateProductionRequest,
    onSuccess: (dataResponse) => {
      if (dataResponse?.success) {
        message.success(
          t("productionRequestManagement.messages.update_success")
        );
        refetchRequests();
        setIsEditMode(false);
        setIsDrawerOpen(false);
      } else {
        message.error(t("productionRequestManagement.messages.update_fail"));
      }
    },
    onError: (err) => {
      console.log("Update error:", err);
      message.error(t("productionRequestManagement.messages.update_error"));
    },
  });

  // 3. Mutation xóa
  const mutationDelete = useMutation({
    mutationFn: ProductionRequestServices.deleteProductionRequest,
    onSuccess: (dataResponse) => {
      if (dataResponse?.success) {
        message.success(
          t("productionRequestManagement.messages.delete_success")
        );
        refetchRequests(); // gọi lại để cập nhật danh sách
      } else {
        message.error(t("productionRequestManagement.messages.delete_fail"));
      }
    },
    onError: (err) => {
      console.log("Delete error:", err);
      message.error(t("productionRequestManagement.messages.delete_error"));
    },
  });

  //  “duyệt” (chỉ đổi trạng thái)

  const handleApprove = (record) => {
    ProductionRequestServices.changeStatus({
      access_token: user?.access_token,
      id: record._id,
    })
      .then((res) => {
        if (res?.success) {
          message.success(
            t("productionRequestManagement.messages.approve_success")
          );
          refetchRequests();
          setIsDrawerOpen(false);
        } else {
          message.error(t("productionRequestManagement.messages.approve_fail"));
        }
      })
      .catch((err) => {
        console.log(err);
        message.error(t("productionRequestManagement.messages.approve_error"));
      });
  };

  // Hàm gọi API xóa
  const handleDelete = (record) => {
    mutationDelete.mutate({
      id: record._id,
      token: user?.access_token,
    });
  };

  // Hàm hiển thị popup confirm
  const confirmDelete = (record) => {
    Modal.confirm({
      title: t("modal.delete_confirm_title"),
      content: t("modal.delete_confirm_content"),
      okText: t("common.ok"),
      cancelText: t("common.cancel"),
      onOk: () => handleDelete(record),
    });
  };

  // Tìm tồn kho Nguyên liệu hiện tại
  const getAvailableFuel = () => {
    const materialId = form.getFieldValue("material");
    if (!materialId) return 0;
    const found = fuelTypes.find((ft) => ft._id === materialId);
    return found ? found.quantity : 0;
  };

  // Tính toán nguyên liệu khi thay đổi số lượng thành phẩm
  const handleProductQuantityChange = (value) => {
    if (!value || value < 1) {
      form.setFieldsValue({ material_quantity: 0 });
      return;
    }
    // ví dụ: needed = product / 0.9
    const needed = Math.ceil(value / 0.9);

    const available = getAvailableFuel();
    if (available > 0 && needed > available) {
      // Vượt quá
      const maxProduction = Math.floor(available * 0.9);
      message.warning(t("warning.over_fuel", { max: maxProduction }));
      form.setFieldsValue({
        product_quantity: maxProduction,
        material_quantity: Math.ceil(maxProduction / 0.9),
      });
      return;
    }
    // set needed
    form.setFieldsValue({ material_quantity: needed });
  };

  // Khi đổi loại Nguyên liệu -> tính lại
  const handleFuelChange = () => {
    const productQty = form.getFieldValue("product_quantity");
    if (productQty) {
      handleProductQuantityChange(productQty);
    }
  };

  // Không cho chọn ngày sản xuất ở quá khứ
  const disabledProductionDate = (current) => {
    return current && current < moment().startOf("day");
  };

  // Không cho chọn ngày kết thúc trước ngày sản xuất
  const disabledEndDate = (current) => {
    const productionDate = form.getFieldValue("production_date");
    if (!productionDate) {
      return current && current < moment().startOf("day");
    }
    return current && current.isBefore(productionDate, "day");
  };

  // Khi bấm Lưu
  const handleSaveUpdate = () => {
    form
      .validateFields()
      .then((values) => {
        // Chuyển DatePicker -> ISO
        if (values.production_date) {
          values.production_date = values.production_date.toISOString();
        }
        if (values.end_date) {
          values.end_date = values.end_date.toISOString();
        }

        // Gọi API update
        mutationUpdate.mutate({
          id: selectedRequest._id,
          token: user?.access_token,
          dataUpdate: values,
        });
      })
      .catch((err) => {
        console.log("Validate Failed:", err);
      });
  };

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
          width: 260,
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
  useEffect(() => {
    const production = form.getFieldValue("production_date");
    const end = form.getFieldValue("end_date");

    if (production && end) {
      const diff = dayjs(end).diff(dayjs(production), "day");
      if (diff < 1) {
        form.setFieldsValue({ end_date: null });
        message.warning("Ngày kết thúc phải sau ngày sản xuất ít nhất 1 ngày.");
      }
    }
  }, [form.getFieldValue("production_date")]);
  // Cấu hình cột
  const columns = [
    {
      title: t("table.request_name"),
      dataIndex: "request_name",
      key: "request_name",
      ...getColumnSearchProps("request_name"),
      sorter: (a, b) => a.request_name.localeCompare(b.request_name),
    },

    {
      title: <div className="text-center">{t("table.material_quantity")}</div>,
      dataIndex: "material_quantity",
      key: "material_quantity",
      align: "center",
      className: "text-center",
      sorter: (a, b) => a.material_quantity - b.material_quantity,
      render: (val) => `${val} `,
    },
    {
      title: <div className="text-center">{t("table.product_quantity")}</div>,
      dataIndex: "product_quantity",
      key: "product_quantity",
      align: "center",
      className: "text-center",
      sorter: (a, b) => a.product_quantity - b.product_quantity,
      render: (val) => `${val}`,
    },
    {
      title: <div className="text-center">{t("table.production_date")}</div>,
      dataIndex: "production_date",
      key: "production_date",
      align: "center",
      className: "text-center",
      sorter: (a, b) =>
        new Date(a.production_date) - new Date(b.production_date),
      render: (date) => convertDateStringV1(date),
    },
    {
      title: <div className="text-center">{t("table.end_date")}</div>,
      dataIndex: "end_date",
      key: "end_date",
      align: "center",
      className: "text-center",
      sorter: (a, b) => new Date(a.end_date) - new Date(b.end_date),
      render: (date) => convertDateStringV1(date),
    },
    {
      title: <div className="text-center">{t("table.status")}</div>,
      dataIndex: "status",
      align: "center",
      className: "text-center",
      key: "status",
      filters: [
        { text: t("status.pending"), value: "Chờ duyệt" },
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
      title: <div className="text-center">{t("table.actions")}</div>,
      key: "action",
      render: (record) => {
        const isPending = record.status === "Chờ duyệt";

        return (
          <div className="flex justify-center items-center gap-2">
            {/* Xem chi tiết: Luôn hiển thị */}
            <Button
              icon={<HiOutlineDocumentSearch style={{ color: "dodgerblue" }} />}
              size="middle"
              onClick={() => handleViewDetail(record)}
              className="hover:bg-gray-200"
            />

            {/* Chỉ hiển thị nút Sửa nếu trạng thái là Chờ duyệt */}
            {isPending && (
              <Button
                type="link"
                icon={<AiFillEdit style={{ color: "#0e79c7" }} />}
                className="hover:bg-gray-200"
                onClick={() => {
                  setSelectedRequest(record);
                  setIsEditMode(true);
                  setIsDrawerOpen(true);
                }}
              />
            )}

            {/* Chỉ hiển thị nút Xoá nếu trạng thái là Chờ duyệt */}
            {isPending && (
              <Button
                icon={<MdDelete style={{ color: "red" }} />}
                onClick={() => confirmDelete(record)}
                loading={mutationDelete.isLoading}
                size="middle"
              />
            )}
          </div>
        );
      },
    },
  ];

  // Mở Drawer (Xem / Chỉnh sửa)
  const handleViewDetail = (record) => {
    setSelectedRequest(record);
    setIsDrawerOpen(true);
    setIsEditMode(false);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedRequest(null);
    setIsEditMode(false);
  };

  console.log("fuelTypes => ", fuelTypes)
  // Bấm “Chỉnh sửa”
  const handleEdit = () => {
    setIsEditMode(true);

    form.setFieldsValue({
      request_name: selectedRequest?.request_name,
      request_type: selectedRequest?.request_type,
      product_quantity: selectedRequest?.product_quantity,
      material_quantity: selectedRequest?.material_quantity,
      loss_percentage: selectedRequest?.loss_percentage,
      priority: selectedRequest?.priority,
      production_date: selectedRequest?.production_date
        ? dayjs(selectedRequest.production_date).startOf("day")
        : null,
      end_date: selectedRequest?.end_date
        ? dayjs(selectedRequest.end_date).startOf("day")
        : null,
      status: selectedRequest?.status,
      note: selectedRequest?.note,
      material: selectedRequest?.material,
    });
  };

  // Bấm “Hủy”
  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  console.log("selectedRequest => ", selectedRequest);

  return (
    <div className="production-request-list">
      <div className="flex items-center justify-between my-6">
        {/* Nút quay lại bên trái */}
        <button
          onClick={() => navigate(-1)}
          type="button"
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
        </button>

        {/* Tiêu đề căn giữa */}
        <h2 className="flex items-center justify-center text-center gap-2 font-bold text-[20px] md:text-2xl flex-grow mx-2 mt-1 mb-1 text-gray-800">
          <VscChecklist></VscChecklist>
          {t("productionRequestManagement.title")}
        </h2>

        {/* Phần tử trống để cân bằng layout với nút bên trái */}
        <div className="min-w-[20px] md:min-w-[100px]"></div>
      </div>

      {/* Notifications Tạo Quy Trình */}
      <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm space-y-2 mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <p>{t("notification.after_approve")}</p>
          <p
            className="font-semibold text-black bg-yellow-300 px-2 py-2 rounded-lg cursor-pointer 
       shadow-sm hover:bg-yellow-400 hover:shadow-md transition duration-200 ease-in-out text-center"
            onClick={() => navigate("/system/admin/production-processing")}
          >
            {t("notification.production_queue")}
          </p>
        </div>
      </div>

      <Loading isPending={isLoading || fuelLoading}>
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={{ pageSize: 6 }}
          scroll={{ x: "max-content" }}
        />
      </Loading>

      {/* Cập nhật form */}
      <DrawerComponent
        title={
          isEditMode
            ? t("productionRequestManagement.update_title")
            : t("productionRequestManagement.detail_title")
        }
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        placement="right"
        width={drawerWidth}
      >
        {/* ====================== VIEW MODE ====================== */}
        {selectedRequest && !isEditMode && (
          <Form layout="vertical">
            {/* Block 1: các trường dài */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Tên đơn - full width */}
              <Form.Item
                label={t("form.request_name")}
                className="!mb-0 lg:col-span-3"
              >
                <Input value={selectedRequest.request_name} disabled />
              </Form.Item>

              {/* Loại đơn + Trạng thái (2 cột) */}
              <Form.Item label={t("form.request_type")} className="!mb-0">
                <Input value={selectedRequest.request_type} disabled />
              </Form.Item>
              <Form.Item label={t("form.status")} className="!mb-0">
                <div className="border border-gray-300 rounded px-2 py-1 h-[32px] flex items-center">
                  <Tag
                    color={statusColors[selectedRequest.status] || "default"}
                  >
                    {t(`status.${statusMap[selectedRequest.status]}`)}
                  </Tag>
                </div>
              </Form.Item>
              {/* chừa 1 slot trống để đủ 3 cột */}
              <div />

              {/* Nguyên liệu - full width */}
              <Form.Item
                label={t("form.material")}
                className="!mb-0 lg:col-span-3"
              >
                <Input value={selectedRequest?.material?.fuel_type_id?.type_name} disabled />
              </Form.Item>
            </div>

            {/* Block 2: nhóm 3-cột cho các field số & có thể nằm ngang */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Form.Item label={t("form.product_quantity")} className="!mb-0">
                <Input
                  value={`${selectedRequest.product_quantity} Kg`}
                  disabled
                />
              </Form.Item>

              <Form.Item label={t("form.material_quantity")} className="!mb-0">
                <Input
                  value={`${selectedRequest.material_quantity} Kg`}
                  disabled
                />
              </Form.Item>

              <Form.Item label={t("form.loss_percentage")} className="!mb-0">
                <Input value={`${selectedRequest.loss_percentage}%`} disabled />
              </Form.Item>

              <Form.Item label={t("form.priority")} className="!mb-0">
                <Input value={selectedRequest.priority} disabled />
              </Form.Item>

              <Form.Item label={t("form.production_date")} className="!mb-0">
                <Input
                  value={convertDateStringV1(selectedRequest.production_date)}
                  disabled
                />
              </Form.Item>

              <Form.Item label={t("form.end_date")} className="!mb-0">
                <Input
                  value={convertDateStringV1(selectedRequest.end_date)}
                  disabled
                />
              </Form.Item>
            </div>

            {/* Ghi chú nếu có */}
            {selectedRequest.note && (
              <Form.Item
                label={t("form.note")}
                className="lg:col-span-3 !mb-0 mt-4"
              >
                <Input.TextArea
                  value={selectedRequest.note}
                  rows={3}
                  disabled
                />
              </Form.Item>
            )}

            {/* Nút hành động */}
            <div className="flex justify-end gap-3 mt-6 flex-wrap">
              {selectedRequest.status === "Chờ duyệt" && (
                <ButtonComponent
                  type="approve"
                  onClick={() => handleApprove(selectedRequest)}
                />
              )}
              <ButtonComponent
                type="close"
                onClick={() => setIsDrawerOpen(false)}
              />
            </div>
          </Form>
        )}

        {/* ====================== EDIT MODE ====================== */}
        {selectedRequest && isEditMode && (
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              padding: "16px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
            }}
          >
            <Form form={form} layout="vertical">
              {/* Block 1: trường dài */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Tên đơn */}
                <Form.Item
                  label={t("form.request_name")}
                  name="request_name"
                  rules={[
                    { required: true, message: t("validate.request_name") },
                  ]}
                  className="lg:col-span-3"
                >
                  <Input />
                </Form.Item>

                {/* Loại đơn & Trạng thái (nếu muốn để ngang) */}
                <Form.Item label={t("form.request_type")} name="request_type">
                  {/* giữ disabled như cũ */}
                  <Input disabled />
                </Form.Item>

                <Form.Item label={t("form.status")} name="status">
                  <Select disabled>
                    <Select.Option value="Chờ duyệt">
                      {t("status.pending")}
                    </Select.Option>
                    <Select.Option value="Đang xử lý">
                      {t("status.processing")}
                    </Select.Option>
                    <Select.Option value="Từ chối">
                      {t("status.reject")}
                    </Select.Option>
                    <Select.Option value="Đã huỷ">
                      {t("status.canceled")}
                    </Select.Option>
                    <Select.Option value="Đã Hoàn Thành">
                      {t("status.completed")}
                    </Select.Option>
                    <Select.Option value="Đang sản xuất">
                      {t("status.in_production")}
                    </Select.Option>
                  </Select>
                </Form.Item>

                {/* chừa 1 slot trống để cân cột */}
                <div />

                {/* Nguyên liệu */}
                <Form.Item
                  label={t("form.material")}
                  name="material"
                  rules={[{ required: true, message: t("validate.material") }]}
                  className="lg:col-span-3"
                >
                  <Select
                    placeholder={t("placeholder.select_material")}
                  >
                    {fuelTypes.map((fuel) => (
                      <Select.Option key={fuel._id} value={fuel._id}>
                        {fuel.fuel_type_id?.type_name} (Tồn: {fuel.quantity} Kg) 
                      </Select.Option>

                    ))}
                  </Select>
                </Form.Item>
              </div>

              {/* Block 2: nhóm 3-cột cho các trường số & có thể nằm ngang */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {/* Thành phẩm */}
                <Form.Item
                  label={t("form.product_quantity")}
                  name="product_quantity"
                  rules={[
                    { required: true, message: t("form.product_quantity") },
                  ]}
                >
                  <InputNumber
                    className="w-full"
                    min={1}
                    onChange={handleProductQuantityChange}
                  />
                </Form.Item>

                {/* Nguyên liệu */}
                <Form.Item
                  label={t("form.material_quantity")}
                  name="material_quantity"
                >
                  <InputNumber className="w-full" disabled />
                </Form.Item>

                {/* Tỉ lệ hao hụt */}
                <Form.Item
                  label={t("form.loss_percentage")}
                  name="loss_percentage"
                  rules={[
                    { required: true, message: t("validate.loss_percentage") },
                  ]}
                >
                  <InputNumber
                    className="w-full"
                    min={0}
                    max={100}
                    formatter={(value) => `${value}%`}
                    parser={(value) => value.replace("%", "")}
                  />
                </Form.Item>

                {/* Ưu tiên */}
                <Form.Item
                  label={t("form.priority")}
                  name="priority"
                  rules={[{ required: true, message: t("validate.priority") }]}
                >
                  <Select className="w-full">
                    <Select.Option value={3}>{t("common.high")}</Select.Option>
                    <Select.Option value={2}>
                      {t("common.medium")}
                    </Select.Option>
                    <Select.Option value={1}>{t("common.low")}</Select.Option>
                  </Select>
                </Form.Item>

                {/* Ngày sản xuất */}
                <Form.Item
                  label={t("form.production_date")}
                  name="production_date"
                  rules={[
                    { required: true, message: t("form.production_date") },
                  ]}
                >
                  <DatePicker
                    format="DD/MM/YYYY"
                    className="w-full"
                    disabledDate={disabledProductionDate}
                  />
                </Form.Item>

                {/* Ngày kết thúc */}
                <Form.Item
                  label={t("form.end_date")}
                  name="end_date"
                  dependencies={["production_date"]}
                  rules={[
                    {
                      required: true,
                      message: t("form.end_date"),
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const start = getFieldValue("production_date");
                        if (start && value) {
                          const diff = dayjs(value).diff(dayjs(start), "day");
                          if (diff < 1) {
                            return Promise.reject(
                              new Error(
                                "Ngày kết thúc phải sau ngày sản xuất ít nhất 1 ngày"
                              )
                            );
                          }
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <DatePicker
                    format="DD/MM/YYYY"
                    className="w-full"
                    disabledDate={disabledEndDate}
                  />
                </Form.Item>
              </div>

              {/* Ghi chú */}
              <Form.Item label={t("form.note")} name="note" className="mt-4">
                <Input.TextArea rows={3} />
              </Form.Item>
            </Form>

            <div className="flex justify-end gap-3 mt-2">
              <ButtonComponent
                type="update"
                onClick={handleSaveUpdate}
                loading={mutationUpdate.isLoading}
              />
              <ButtonComponent
                type="close"
                onClick={() => setIsDrawerOpen(false)}
                disabled={mutationUpdate.isLoading}
              />
            </div>
          </div>
        )}
      </DrawerComponent>
    </div>
  );
};

export default ProductionRequestList;
