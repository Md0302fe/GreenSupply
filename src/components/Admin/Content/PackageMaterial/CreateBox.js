// frontend/CreateBox.js
import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, message, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";

const { Option } = Select;

const CreateBox = () => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/package-material/box-categories`
        );
        if (res.data.success) setCategories(res.data.data);
      } catch {
        message.error("Lỗi khi tải danh sách loại thùng");
      }
    };
    fetchCategories();
  }, []);

  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const onFinish = async (values) => {
    try {
      setLoading(true);

      let package_img = "";
      if (values.package_img && values.package_img.length > 0) {
        package_img = await getBase64(values.package_img[0].originFileObj);
      }

      const payload = {
        package_material_name: values.package_material_name,
        quantity: Number(values.quantity),
        package_material_categories: values.package_material_categories,
        package_img,
        type: values.type,
        capacity: values.capacity,
      };

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/package-material/boxes`,
        payload,
        {
          headers: { Authorization: `Bearer ${user.access_token}` },
        }
      );

      if (res.data.success) {
        message.success("Tạo nguyên vật liệu thành công!");
        navigate("/system/admin/box-list", {
          state: { categoryId: values.package_material_categories }, // ⬅️ điều hướng có categoryId
        });
      } else {
        message.error("Tạo nguyên vật liệu thất bại");
      }
    } catch {
      message.error("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-100 p-2 lg:p-6">
      <div className="w-full mb-3 lg:mb-4 ">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center bg-blue-500 text-white font-semibold py-1 px-1 lg:px-3 rounded-md shadow-sm hover:bg-blue-600 transition duration-300"
          type="button"
        >
          Quay lại
        </button>
      </div>

      <div className="w-full max-w-xl bg-white rounded-lg shadow p-2 lg:p-8">
        <h2 className="text-18px lg:text-3xl font-bold mb-4 lg:mb-6 text-center">Tạo Nguyên Liệu Mới</h2>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Tên Nguyên liệu"
            name="package_material_name"
            rules={[{ required: true, message: "Vui lòng nhập tên nguyên liệu" }]}
          >
            <Input placeholder="Nhập tên nguyên liệu" size="large" />
          </Form.Item>

          <Form.Item
            label="Loại Nguyên Liệu"
            name="type"
            rules={[{ required: true, message: "Vui lòng chọn loại nguyên liệu" }]}
          >
            <Select placeholder="Chọn loại nguyên liệu" size="large" showSearch>
              <Option value="túi chân không">Túi chân không</Option>
              <Option value="thùng carton">Thùng carton</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Chọn loại bao bì"
            name="package_material_categories"
            rules={[{ required: true, message: "Vui lòng chọn loại nguyên liệu" }]}
          >
            <Select placeholder="Chọn loại" size="large" showSearch optionFilterProp="children">
              {categories.map((cat) => (
                <Option key={cat._id} value={cat._id}>
                  {cat.categories_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Số lượng"
            name="quantity"
            rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
          >
            <Input type="number" min={0} placeholder="Nhập số lượng" size="large" />
          </Form.Item>

          <Form.Item
            label="Dung Tích (Túi: g, Thùng: kg)"
            name="capacity"
            rules={[{ required: true, message: "Vui lòng nhập dung tích" }]}
          >
            <Input type="number" min={0} placeholder="Nhập dung tích" size="large" />
          </Form.Item>

          <Form.Item
            label="Ảnh Nguyên Liệu"
            name="package_img"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
            rules={[{ required: true, message: "Vui lòng chọn ảnh nguyên liệu" }]}
          >
            <Upload listType="picture">
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} className="w-full" size="large">
              Tạo Nguyên Liệu
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default CreateBox;
