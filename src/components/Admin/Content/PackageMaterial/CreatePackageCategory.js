import React, { useState } from "react";
import { Button, Form, Input, message } from "antd";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CreatePackageCategory = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const payload = {
        categories_name: values.name,
        Descriptions: values.description || "Không có mô tả",
      };

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/package-material/box-categories`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        }
      );

      if (res.data.success) {
        message.success("Tạo loại thùng thành công!");
        form.resetFields();
        navigate(-1);
      } else {
        message.error("Tạo thất bại!");
      }
    } catch (err) {
      message.error("Lỗi kết nối đến server!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-100 p-6">
      <div className="w-full mb-4">
        <div className="max-w-xl ml-0">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center bg-blue-500 text-white font-semibold py-1 px-3 rounded-md shadow-sm hover:bg-blue-600 transition duration-300"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
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
            Quay lại
          </button>
        </div>
      </div>

      <div className="w-full max-w-xl bg-white rounded-lg shadow p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Tạo Loại  Vật Liệu Mới
        </h2>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Tên loại Vật liệu"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên loại nguyên liệu" }]}
          >
            <Input placeholder="Nhập tên loại nguyên liệu" />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea placeholder="Nhập mô tả (tuỳ chọn)" rows={3} />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full"
            >
              Tạo loại Nguyên Vật Liệu 
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default CreatePackageCategory;
