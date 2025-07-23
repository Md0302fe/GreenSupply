import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  Tag,
  Button,
  message,
  Space,
  Drawer,
  Descriptions,
  Form,
  Input,
} from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import { VscPackage } from "react-icons/vsc";
import ButtonComponent from "../../../ButtonComponent/ButtonComponent";

import { useSelector } from "react-redux";
import { Modal } from "antd";
import _ from "lodash";
import { useTranslation } from "react-i18next";

const PackageCategoryList = () => {
  const { t } = useTranslation();

  const [categories, setCategories] = useState([]); // Dữ liệu gốc
  const [filteredCategories, setFilteredCategories] = useState([]); // Dữ liệu đã lọc
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [form] = Form.useForm();

  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilterVal, setStatusFilterVal] = useState("");

  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const token = user?.access_token || localStorage.getItem("access_token");

  // Fetch Categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/package-material/box-categories?includeInactive=true`
      );
      if (res.data.success) {
        const sortedCategories = res.data.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setCategories(sortedCategories);
        setFilteredCategories(sortedCategories); // Cập nhật filteredCategories khi tải dữ liệu
      } else {
        message.error("Không thể lấy danh sách loại Nguyên Liệu.");
      }
    } catch {
      message.error("Lỗi khi kết nối tới server.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (category) => {
    setSelectedCategory(category);
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (category) => {
    setSelectedCategory(category);
    form.setFieldsValue({
      categories_name: category.categories_name,
      Descriptions: category.Descriptions,
    });
    setIsEditDrawerOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/package-material/box-categories/${selectedCategory._id}`,
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success) {
        message.success(t("packageCategory.messages.update_success"));
        setIsEditDrawerOpen(false);
        fetchCategories(); // Tải lại dữ liệu sau khi chỉnh sửa
      } else {
        message.error(t("packageCategory.messages.update_fail"));
      }
    } catch (err) {
      message.error(t("packageCategory.messages.update_error"));
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: t("packageCategory.messages.delete_confirm"),
      content: t("packageCategory.messages.delete_message"),
      okText: t("packageCategory.status_deleted"),
      okType: "danger",
      cancelText: t("packageCategory.edit.cancel"),
      onOk: async () => {
        try {
          const res = await axios.delete(
            `${process.env.REACT_APP_API_URL}/package-material/box-categories/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (res.data.success) {
            message.success(t("packageCategory.messages.delete_success"));
            fetchCategories(); // Tải lại danh sách sau khi xóa
          } else {
            message.error(t("packageCategory.messages.delete_fail"));
          }
        } catch (err) {
          if (err.response?.status === 401) {
            message.error(t("packageCategory.messages.unauthorized"));
          } else {
            message.error(t("packageCategory.messages.delete_error"));
          }
        }
      },
    });
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText(""); // Reset lại tìm kiếm
    setDebouncedSearch(""); // Reset lại debounced search
    setFilteredCategories(categories); // Reset lại danh sách về gốc
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
            {t("packageCategory.search.search")}
          </Button>
          <Button
            onClick={() => {
              clearFilters && handleReset(clearFilters);
              confirm();
            }}
            size="small"
            style={{ width: 90 }}
          >
            {t("packageCategory.search.reset")}
          </Button>
          <Button type="link" size="small" onClick={close}>
            {t("packageCategory.search.close")}
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record.categories_name
        ? record.categories_name
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase())
        : false,
  });

  const columns = [
    {
      title: (
        <div style={{ textAlign: "left", width: "100%" }}>
          {t("packageCategory.name")}
        </div>
      ),
      dataIndex: "categories_name",
      key: "categories_name",
      align: "center",
      ...getColumnSearchProps("categories_name"),
    },
    {
      title: (
        <div style={{ textAlign: "left", width: "100%" }}>
          {t("packageCategory.description")}
        </div>
      ),
      dataIndex: "Descriptions",
      key: "Descriptions",
      align: "center",
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>
          {t("packageCategory.totalQuantity")}
        </div>
      ),
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      render: (text) => <div style={{ textAlign: "center" }}>{text}</div>,
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>
          {t("packageCategory.status")}
        </div>
      ),
      dataIndex: "is_delete",
      key: "is_delete",
      align: "center",
      filters: [
        { text: t("packageCategory.status_active"), value: "false" },
        { text: t("packageCategory.status_deleted"), value: "true" },
      ],
      onFilter: (value, record) => record.is_delete.toString() === value,
      render: (val) => (
        <div style={{ textAlign: "center", width: "100%" }}>
          <Tag color={val ? "orange" : "green"}>
            {val
              ? t("packageCategory.status_deleted")
              : t("packageCategory.status_active")}
          </Tag>
        </div>
      ),
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>
          {t("packageCategory.actions")}
        </div>
      ),
      key: "action",
      align: "center", // Căn giữa tất cả các cột
      render: (_, record) => (
        <div style={{ textAlign: "center", width: "100%" }}>
          <Space>
            <Button
              type="link"
              icon={<HiOutlineDocumentSearch style={{ fontSize: 20 }} />}
              disabled={record.is_delete}
              onClick={() => !record.is_delete && handleViewDetails(record)}
            />
            <Button
              type="link"
              icon={<EditOutlined style={{ fontSize: 18 }} />}
              disabled={record.is_delete}
              title={
                record.is_delete
                  ? "Không thể chỉnh sửa mục đã ngừng sử dụng"
                  : "Chỉnh sửa"
              }
              onClick={() => !record.is_delete && openEditDrawer(record)}
            />
            <Button
              type="link"
              icon={<DeleteOutlined style={{ fontSize: 18, color: record.is_delete ? "gray" : "red" }} />}
              disabled={record.is_delete}
              title={
                record.is_delete
                  ? "Không thể ngừng sử dụng mục đã ngừng sử dụng"
                  : "Ngừng sử dụng"
              }
              onClick={() => !record.is_delete && handleDelete(record._id)}
            />
          </Space>
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  // Debounce Search
  useEffect(() => {
    const debounceFn = _.debounce(() => {
      setDebouncedSearch(searchText);
    }, 500);
    debounceFn();
    return () => debounceFn.cancel();
  }, [searchText]);

  // Apply filters (Search and Status Filter)
  const applyFilters = (data) => {
    let filtered = [...data];

    if (statusFilterVal) {
      filtered = filtered.filter(
        (item) => item.is_delete.toString() === statusFilterVal
      );
    }

    if (debouncedSearch) {
      filtered = filtered.filter((item) =>
        item.categories_name
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase())
      );
    }

    setFilteredCategories(filtered); // Set danh sách đã lọc
  };

  useEffect(() => {
    applyFilters(categories); // Lọc lại dữ liệu khi có thay đổi
  }, [debouncedSearch, statusFilterVal, categories]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-2">
        {/* Nút quay lại bên trái */}
        <button
          onClick={() => navigate("/system/admin/feature_material_category")}
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
          <span className="hidden md:inline">{t("packageCategory.back")}</span>
        </button>

        {/* Tiêu đề căn giữa */}
        <div className="flex items-center justify-center gap-2">
          <VscPackage className="size-8"></VscPackage>
          <h2 className="text-center font-bold text-[18px] md:text-2xl flex-grow text-gray-800">
            {t("packageCategory.title")}
          </h2>
        </div>

        {/* Phần tử trống bên phải để cân bằng nút quay lại */}
        <div className="min-w-[20px] md:min-w-[100px]"></div>
      </div>

      <div className="flex justify-end mb-1">
        <Button
          type="primary"
          onClick={() => navigate("/system/admin/box-categories/create")}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow mb-2"
        >
          {t("packageCategory.create")}
        </Button>
      </div>

      <Table
        dataSource={filteredCategories} // Dùng danh sách đã lọc
        columns={columns}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
      />

      {/* Drawer xem chi tiết */}
      <Drawer
        title={t("packageCategory.details.title")}
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedCategory(null);
        }}
        width={400}
      >
        {selectedCategory ? (
          <Form layout="vertical" disabled>
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Tên loại đóng gói */}
              <Form.Item
                label={t("packageCategory.details.name")}
                className="!mt-0 md:col-span-2"
              >
                <Input value={selectedCategory.categories_name} />
              </Form.Item>

              {/* Mô tả */}
              <Form.Item
                label={t("packageCategory.details.description")}
                className="!mt-0 md:col-span-2"
              >
                <Input.TextArea
                  rows={3}
                  value={
                    selectedCategory.Descriptions || t("fuelStorage.noData")
                  }
                />
              </Form.Item>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:col-span-2">
                {/* Số lượng */}
                <Form.Item
                  label={t("packageCategory.details.quantity")}
                  className="!mt-0"
                >
                  <Input value={selectedCategory.quantity} />
                </Form.Item>

                {/* Trạng thái */}
                <Form.Item
                  label={t("packageCategory.details.status")}
                  className="!mt-0"
                >
                  <div className="border border-gray-300 rounded px-2 py-1 h-[32px] flex items-center">
                    <Tag color={selectedCategory.is_delete ? "orange" : "green"}>
                      {selectedCategory.is_delete
                        ? t("packageCategory.status_deleted")
                        : t("packageCategory.actions")}
                    </Tag>
                  </div>
                </Form.Item>
              </div>

              {/* Ngày tạo & cập nhật - cùng hàng */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:col-span-2">
                <Form.Item
                  label={t("packageCategory.details.created")}
                  className="!mt-0"
                >
                  <Input
                    value={new Date(selectedCategory.createdAt).toLocaleString()}
                  />
                </Form.Item>
                <Form.Item
                  label={t("packageCategory.details.updated")}
                  className="!mt-0"
                >
                  <Input
                    value={new Date(selectedCategory.updatedAt).toLocaleString()}
                  />
                </Form.Item>
              </div>
            </div>
          </Form>
        ) : (
          <p className="text-center text-gray-500">
            {t("packageCategory.details.loading")}
          </p>
        )}

        {/* Nút đóng */}
        <div className="flex justify-end mt-2">
          <ButtonComponent type="close" onClick={() => setIsDrawerOpen(false)} />
        </div>
      </Drawer>

      {/* Drawer chỉnh sửa */}
      <Drawer
        title={t("packageCategory.edit.title")}
        width={400}
        onClose={() => setIsEditDrawerOpen(false)}
        open={isEditDrawerOpen}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditSubmit}
          initialValues={{
            categories_name: "",
            Descriptions: "",
          }}
        >
          <Form.Item
            label={t("packageCategory.edit.name")}
            name="categories_name"
            rules={[
              {
                required: true,
                message: t("packageCategory.edit.validate_name"),
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={t("packageCategory.details.description")}
            name="Descriptions"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <div className="flex justify-end mt-2 gap-2">
            <ButtonComponent type="update" />
            <ButtonComponent type="close" onClick={() => setIsEditDrawerOpen(false)} />
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default PackageCategoryList;
