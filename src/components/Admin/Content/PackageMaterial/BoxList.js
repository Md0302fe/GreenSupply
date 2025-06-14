import React, { useEffect, useState } from "react";
import {
  Image,
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
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import { useSelector } from "react-redux";
import { Modal } from "antd";

const BoxList = () => {
  const [categories, setCategories] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedBox, setSelectedBox] = useState(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [form] = Form.useForm();

  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/package-material/box-categories`
      );
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch {
      message.error("Không thể lấy danh sách loại thùng.");
    }
  };

  // Fetch Boxes based on selected category
  const fetchBoxes = async (categoryId) => {
    setLoading(true);
    try {
      if (!categoryId) {
        setBoxes([]);
        setLoading(false);
        return;
      }
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/package-material/boxes?category_id=${categoryId}`
      );
      if (res.data.success) {
        // Sắp xếp các thùng theo ngày tạo, đơn mới nhất lên đầu
        const sortedBoxes = res.data.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setBoxes(sortedBoxes); // Cập nhật boxes sau khi sắp xếp
      } else {
        setBoxes([]);
        message.error("Không thể lấy danh sách thùng.");
      }
    } catch {
      setBoxes([]);
      message.error("Không thể lấy danh sách thùng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      const firstCategoryId = categories[0]._id;
      setSelectedCategory(firstCategoryId);
      fetchBoxes(firstCategoryId);
    }
  }, [categories]);

  // Handle View Details
  const handleViewDetails = (box) => {
    setSelectedBox(box);
    setIsDrawerOpen(true);
  };

  // Handle Delete Box
  const handleDelete = (id) => {
    Modal.confirm({
      title: "Xác nhận xoá",
      content: "Bạn có chắc chắn muốn xoá nguyên liệu này không?",
      okText: "Xoá",
      cancelText: "Huỷ",
      okType: "danger",
      onOk: async () => {
        try {
          const res = await axios.delete(
            `${process.env.REACT_APP_API_URL}/package-material/boxes/${id}`,
            {
              headers: {
                Authorization: `Bearer ${user.access_token}`,
              },
            }
          );
          if (res.data.success) {
            message.success("Xoá thành công.");
            if (selectedCategory) fetchBoxes(selectedCategory);
          } else {
            message.error("Xoá thất bại.");
          }
        } catch {
          message.error("Lỗi khi xoá.");
        }
      },
    });
  };

  // Open Edit Drawer
  const openEditDrawer = (box) => {
    form.setFieldsValue({
      package_material_name: box.package_material_name,
      quantity: box.quantity,
    });
    setSelectedBox(box);
    setIsEditDrawerOpen(true);
  };

  // Handle Update Box
  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        package_material_name: values.package_material_name,
        quantity: Number(values.quantity),
      };

      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/package-material/boxes/${selectedBox._id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        }
      );

      if (res.data.success) {
        message.success("Cập nhật thành công!");
        setIsEditDrawerOpen(false);
        if (selectedCategory) fetchBoxes(selectedCategory);
      } else {
        message.error("Cập nhật thất bại!");
      }
    } catch {
      message.error("Lỗi khi cập nhật.");
    }
  };

  const columns = [
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>
          Ảnh
        </div>
      ),
      dataIndex: "package_img",
      key: "package_img",
      align: "center",
      render: (img) =>
        img ? (
          <div style={{ textAlign: "center", width: "100%" }}>
            <Image
              src={img}
              alt="Ảnh thùng"
              width={80}
              height={80}
              style={{ objectFit: "cover", borderRadius: 4 }}
              placeholder
            />
          </div>
        ) : (
          <div style={{ textAlign: "center", width: "100%" }}>
            <span>Chưa có ảnh</span>
          </div>
        ),
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>
          Tên Nguyên Vật Liệu
        </div>
      ),
      dataIndex: "package_material_name",
      key: "name",
      align: "center",
      render: (text) => <div style={{ textAlign: "center" }}>{text}</div>,
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>
          Số lượng
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
      render: (val) => (
        <div style={{ textAlign: "center", width: "100%" }}>
          <Tag color={val ? "red" : "green"}>{val ? "Đã xóa" : "Hoạt động"}</Tag>
        </div>
      ),
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>
          Hành động
        </div>
      ),
      key: "action",
      align: "center",
      render: (_, record) => {
        const disabled = record.is_delete;
        const iconStyle = disabled
          ? { color: "gray", cursor: "not-allowed" }
          : {};
        return (
          <div style={{ textAlign: "center", width: "100%" }}>
            <Space>
              <Button
                type="link"
                icon={<HiOutlineDocumentSearch style={{ fontSize: 20, ...iconStyle }} />}
                onClick={() => !disabled && handleViewDetails(record)}
                disabled={disabled}
              />
              <Button
                type="link"
                icon={<EditOutlined style={{ fontSize: 18, ...iconStyle }} />}
                onClick={() => !disabled && openEditDrawer(record)}
                disabled={disabled}
              />
              <Button
                type="link"
                icon={<DeleteOutlined style={{ fontSize: 18, color: disabled ? "gray" : "red" }} />}
                onClick={() => !disabled && handleDelete(record._id)}
                disabled={disabled}
              />
            </Space>
          </div>
        );
      },
    },
  ];

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      fetchBoxes(categoryId);
    } else {
      setBoxes([]);
    }
  };

  return (
    <div className="p-6">
      {/* Header with back button, centered title */}
      <div className="flex items-center justify-between mb-5">
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
        <h2 className="text-center font-bold text-[20px] md:text-4xl flex-grow mx-2 mt-1 mb-1">
          Danh sách Nguyên Liệu Theo Loại
        </h2>

        {/* Phần tử trống bên phải để cân bằng nút bên trái */}
        <div className="min-w-[20px] md:min-w-[100px]"></div>
      </div>


      {/* Nút nhóm categories + nút tạo thùng */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        {/* Nút tạo nguyên liệu */}
          <Button
            type="primary"
            onClick={() => navigate("/system/admin/box-Create")}
            className="shadow-md whitespace-nowrap"
          >
            Tạo Nguyên Liệu
          </Button>
      </div>
        {/* Các button danh mục */}
        <div className="flex flex-wrap gap-2 grow" style={{ minWidth: 0 }}>
          {categories.map((cat) => (
            <Button
              key={cat._id}
              type={selectedCategory === cat._id ? "primary" : "default"}
              onClick={() => handleCategoryClick(cat._id)}
              style={{ whiteSpace: "nowrap" }}
            >
              {cat.categories_name}
            </Button>
          ))}
        </div>

      {/* Table */}
      <Table
        dataSource={boxes}
        columns={columns}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
      />

      {/* Drawer xem chi tiết */}
      <Drawer
        title="Chi tiết thùng"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        width={400}
      >
        {selectedBox && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Tên">
              {selectedBox.package_material_name}
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng">
              {selectedBox.quantity}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={selectedBox.is_delete ? "red" : "green"}>
                {selectedBox.is_delete ? "Đã xóa" : "Hoạt động"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {new Date(selectedBox.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật lần cuối">
              {new Date(selectedBox.updatedAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
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

      {/* Drawer cập nhật */}
      <Drawer
        title="Cập nhật thùng"
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        width={400}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Form.Item
            label="Tên thùng"
            name="package_material_name"
            rules={[{ required: true, message: "Vui lòng nhập tên thùng" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Số lượng"
            name="quantity"
            rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
          >
            <Input type="number" min={0} />
          </Form.Item>
          <div className="flex justify-end">
            <Button onClick={() => setIsEditDrawerOpen(false)} className="mr-2">
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

export default BoxList;
