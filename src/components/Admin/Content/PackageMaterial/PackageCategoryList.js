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
import { EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import { useSelector } from "react-redux";
import { Modal } from "antd";
import _ from "lodash";

const PackageCategoryList = () => {
  const [categories, setCategories] = useState([]);  // Dữ liệu gốc
  const [filteredCategories, setFilteredCategories] = useState([]);  // Dữ liệu đã lọc
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
        setFilteredCategories(sortedCategories);  // Cập nhật filteredCategories khi tải dữ liệu
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
        message.success("Cập nhật thành công!");
        setIsEditDrawerOpen(false);
        fetchCategories();  // Tải lại dữ liệu sau khi chỉnh sửa
      } else {
        message.error("Cập nhật thất bại!");
      }
    } catch (err) {
      message.error("Lỗi khi cập nhật.");
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Xác nhận xoá",
      content:
        "Bạn có chắc chắn muốn ngừng sử dụng loại nguyên liệu này không?",
      okText: "Ngừng sử dụng",
      okType: "danger",
      cancelText: "Huỷ",
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
            message.success("Đã ngừng sử dụng thành công.");
            fetchCategories();  // Tải lại danh sách sau khi xóa
          } else {
            message.error("Thao tác thất bại.");
          }
        } catch (err) {
          if (err.response?.status === 401) {
            message.error("Không có quyền thực hiện (401)");
          } else {
            message.error("Lỗi khi thực hiện thao tác.");
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
    setSearchText("");  // Reset lại tìm kiếm
    setDebouncedSearch("");  // Reset lại debounced search
    setFilteredCategories(categories);  // Reset lại danh sách về gốc
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
        <div style={{ textAlign: "center", width: "100%" }}>
          Tên Loại Vật Liệu
        </div>
      ),
      dataIndex: "categories_name",
      key: "categories_name",
      align: "center",
      ...getColumnSearchProps("categories_name"),
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>
          Mô Tả
        </div>
      ),
      dataIndex: "Descriptions",
      key: "Descriptions",
      align: "center",
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>
          Số Lượng Tổng
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
          Trạng Thái
        </div>
      ),
      dataIndex: "is_delete",
      key: "is_delete",
      align: "center",
      filters: [
        { text: "Hoạt động", value: "false" },
        { text: "Ngừng sử dụng", value: "true" },
      ],
      onFilter: (value, record) => record.is_delete.toString() === value,
      render: (val) => (
        <div style={{ textAlign: "center", width: "100%" }}>
          <Tag color={val ? "orange" : "green"}>
            {val ? "Ngừng sử dụng" : "Hoạt động"}
          </Tag>
        </div>
      ),
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>
          Hành Động
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
              icon={<DeleteOutlined style={{ fontSize: 18 }} />}
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
    applyFilters(categories);  // Lọc lại dữ liệu khi có thay đổi
  }, [debouncedSearch, statusFilterVal, categories]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mt-6 mb-4">
        {/* Nút quay lại bên trái */}
        <button
          onClick={() => navigate("/system/admin/feature_material_category")}
          type="button"
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
          <span className="hidden md:inline">Quay lại</span>
        </button>

        {/* Tiêu đề căn giữa */}
        <h2 className="text-center font-bold text-[18px] md:text-4xl flex-grow mx-4 mt-1 mb-1">
          Danh Sách Loại Nguyên Liệu
        </h2>

        {/* Phần tử trống bên phải để cân bằng nút quay lại */}
        <div className="min-w-[20px] md:min-w-[100px]"></div>
      </div>

      <div className="flex justify-end mb-1">
        <Button
          type="primary"
          onClick={() => navigate("/system/admin/box-categories/create")}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow"
        >
          + Tạo loại Vật Liệu
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
        title="Chi tiết Loại Thùng"
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedCategory(null);
        }}
        width={400}
      >
        {selectedCategory ? (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Tên loại thùng">
              {selectedCategory.categories_name}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              {selectedCategory.Descriptions || "Không có"}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng số lượng">
              {selectedCategory.quantity}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={selectedCategory.is_delete ? "orange" : "green"}>
                {selectedCategory.is_delete ? "Ngừng sử dụng" : "Hoạt động"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {new Date(selectedCategory.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật lần cuối">
              {new Date(selectedCategory.updatedAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <p>Đang tải...</p>
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

      {/* Drawer chỉnh sửa */}
      <Drawer
        title="Chỉnh sửa Loại Nguyên Liệu"
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
            label="Tên loại thùng"
            name="categories_name"
            rules={[{ required: true, message: "Vui lòng nhập tên loại thùng" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Mô tả" name="Descriptions">
            <Input.TextArea rows={4} />
          </Form.Item>

          <div className="flex justify-end">
            <Button onClick={() => setIsEditDrawerOpen(false)} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default PackageCategoryList;
