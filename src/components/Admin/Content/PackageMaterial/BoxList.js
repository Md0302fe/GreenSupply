// (Phần import giữ nguyên)
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
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
import { Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { VscPackage } from "react-icons/vsc";
import axios from "axios";

import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import { useSelector } from "react-redux";
import { Modal } from "antd";
import { useTranslation } from "react-i18next";

const BoxList = () => {
  const { t } = useTranslation();

  const [categories, setCategories] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedBox, setSelectedBox] = useState(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [base64Image, setBase64Image] = useState("");
  const [form] = Form.useForm();
  const location = useLocation();

  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/package-material/box-categories`
      );
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch {
      message.error(t("boxList.category_error"));
    }
  };

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
        const sortedBoxes = res.data.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setBoxes(sortedBoxes);
      } else {
        setBoxes([]);
        message.error(t("boxList.box_error"));
      }
    } catch {
      setBoxes([]);
      message.error(t("boxList.box_error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      const categoryFromState = location.state?.categoryId;
      const defaultCategoryId = categoryFromState || categories[0]._id;

      setSelectedCategory(defaultCategoryId);
      fetchBoxes(defaultCategoryId);
    }
  }, [categories, location.state]);

  const handleViewDetails = (box) => {
    setSelectedBox(box);
    setIsDrawerOpen(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: t("boxList.confirm_delete"),
      content: t("boxList.confirm_delete_content"),
      okText: t("harvestRequest.delete"),
      cancelText: t("boxList.update.cancel"),
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
            message.success(t("boxList.delete_success"));
            if (selectedCategory) fetchBoxes(selectedCategory);
          } else {
            message.error(t("boxList.delete_fail"));
          }
        } catch {
          message.error(t("boxList.delete_error"));
        }
      },
    });
  };

  const openEditDrawer = (box) => {
    form.setFieldsValue({
      package_material_name: box.package_material_name,
      quantity: box.quantity,
    });
    setBase64Image("");
    setSelectedBox(box);
    setIsEditDrawerOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        package_material_name: values.package_material_name,
        quantity: Number(values.quantity),
      };

      if (base64Image) {
        payload.package_img = base64Image;
      }

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
        message.success(t("boxList.update.update_success"));
        setIsEditDrawerOpen(false);
        if (selectedCategory) fetchBoxes(selectedCategory);
      } else {
        message.error(t("boxList.update.update_fail"));
      }
    } catch {
      message.error(t("boxList.update.update_error"));
    }
  };

  const columns = [
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>
          {t("boxList.image")}
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
            <span>{t("boxList.no_image")}</span>
          </div>
        ),
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>
          {t("boxList.name")}
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
          {t("boxList.quantity")}
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
          {t("boxList.capacity")}
        </div>
      ),
      dataIndex: "capacity",
      key: "capacity",
      align: "center",
      render: (_, record) => (
        <div style={{ textAlign: "center" }}>
          {record.capacity} {record.type === "túi chân không" ? "g" : "Kg"}
        </div>
      ),
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>
          {t("boxList.size")}
        </div>
      ),
      dataIndex: "size_label",
      key: "size_label",
      align: "center",
      render: (value) => (
        <div style={{ textAlign: "center", width: "100%" }}>
          <Tag
            color={
              value === "Size S"
                ? "green"
                : value === "Size M"
                ? "blue"
                : value === "Size L"
                ? "orange"
                : "default"
            }
          >
            {value}
          </Tag>
        </div>
      ),
    },

    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>
          {t("boxList.status")}
        </div>
      ),
      dataIndex: "is_delete",
      key: "is_delete",
      align: "center",
      render: (val) => (
        <div style={{ textAlign: "center", width: "100%" }}>
          <Tag color={val ? "red" : "green"}>
            {val ? t("boxList.status_deleted") : t("boxList.status_active")}
          </Tag>
        </div>
      ),
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>
          {t("boxList.actions")}
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
                icon={
                  <HiOutlineDocumentSearch
                    style={{ fontSize: 20, ...iconStyle }}
                  />
                }
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
                icon={
                  <DeleteOutlined
                    style={{ fontSize: 18, color: disabled ? "gray" : "red" }}
                  />
                }
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
    fetchBoxes(categoryId);
  };

  return (
    <>
      <div className="p-8">
        {/* Header with back button, centered title */}
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
            <span className="hidden md:inline">{t("boxList.back")}</span>
          </button>

          <div className="flex items-center justify-center gap-2">
            <VscPackage className="size-8"></VscPackage>
            <h2 className="text-center font-bold text-[18px] md:text-2xl flex-grow text-gray-800">
              {t("boxList.title")}
            </h2>
          </div>

          {/* Phần tử trống bên phải để cân bằng nút bên trái */}
          <div className="min-w-[20px] md:min-w-[100px]"></div>
        </div>

        {/* Nút nhóm categories + nút tạo thùng */}
        <div className="w-full flex justify-end mb-4">
          <Button
            type="primary"
            onClick={() => navigate("/system/admin/box-Create")}
            className="shadow-md"
          >
            {t("boxList.create")}
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
        {/* 
        <Button
          type="primary"
          onClick={() => navigate("/system/admin/box-Create")}
          className="shadow-md whitespace-nowrap"
          style={{ flexShrink: 0 }}
        >
          Tạo Nguyên Liệu
        </Button> */}
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

      <Drawer
        title={t("boxList.details.title")}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        width={400}
      >
        {selectedBox && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label={t("boxList.details.name")}>
              {selectedBox.package_material_name}
            </Descriptions.Item>
            <Descriptions.Item label={t("boxList.quantity")}>
              {selectedBox.quantity}
            </Descriptions.Item>
            <Descriptions.Item label={t("boxList.status")}>
              <Tag color={selectedBox.is_delete ? "red" : "green"}>
                {selectedBox.is_delete
                  ? t("boxList.status_deleted")
                  : t("boxList.status_active")}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t("boxList.capacity")}>
              {selectedBox.capacity}{" "}
              {selectedBox.type === "túi chân không" ? "g" : "kg"}
            </Descriptions.Item>

            <Descriptions.Item label={t("boxList.details.size")}>
              {selectedBox.size_category === "nhỏ"
                ? "Size S"
                : selectedBox.size_category === "trung bình"
                ? "Size M"
                : selectedBox.size_category === "lớn"
                ? "Size L"
                : t("boxList.sizes.unknown")}
            </Descriptions.Item>

            <Descriptions.Item label={t("boxList.details.created")}>
              {new Date(selectedBox.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label={t("boxList.details.updated")}>
              {new Date(selectedBox.updatedAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        )}
        <div className="flex justify-end mt-4">
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="bg-gray-500 text-white font-bold px-4 py-2 rounded hover:bg-gray-600"
          >
            {t("boxList.details.close")}
          </button>
        </div>
      </Drawer>

      <Drawer
        title={t("boxList.update.title")}
        open={isEditDrawerOpen}
        onClose={() => {
          setIsEditDrawerOpen(false);
          setBase64Image(""); // ✅ Reset ảnh khi đóng
        }}
        width={400}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Form.Item
            label={t("boxList.update.name")}
            name="package_material_name"
            rules={[
              { required: true, message: t("boxList.update.validate_name") },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={t("boxList.update.quantity")}
            name="quantity"
            rules={[
              {
                required: true,
                message: t("boxList.update.validate_quantity"),
              },
            ]}
          >
            <Input type="number" min={0} />
          </Form.Item>
          {/* 
          <Form.Item label="Ảnh mới">
            <Input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  const base64 = await getBase64(file);
                  setBase64Image(base64);
                }
              }}
            />
          </Form.Item> */}

          <Form.Item label={t("boxList.update.image_label")}>
            <Upload
              accept="image/*"
              beforeUpload={() => false}
              maxCount={1}
              listType="picture"
              fileList={
                base64Image
                  ? [
                      {
                        uid: "-1",
                        name: "Ảnh đã chọn",
                        status: "done",
                        url: base64Image,
                      },
                    ]
                  : []
              }
              onChange={async ({ fileList }) => {
                const latestFile = fileList[fileList.length - 1];
                if (latestFile?.originFileObj) {
                  const base64 = await getBase64(latestFile.originFileObj);
                  setBase64Image(base64);
                }
              }}
              onRemove={() => {
                setBase64Image("");
                return true;
              }}
            >
              <Button icon={<UploadOutlined />}>
                {t("createFuel.chooseImage")}
              </Button>
            </Upload>
          </Form.Item>

          {base64Image && (
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <Image
                src={base64Image}
                alt="preview"
                width={100}
                style={{ objectFit: "cover", borderRadius: 4 }}
              />
              <p>{t("boxList.update.preview")}</p>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={() => setIsEditDrawerOpen(false)} className="mr-2">
              {t("boxList.update.cancel")}
            </Button>
            <Button type="primary" htmlType="submit">
              {t("boxList.update.submit")}
            </Button>
          </div>
        </Form>
      </Drawer>
    </>
  );
};

export default BoxList;
