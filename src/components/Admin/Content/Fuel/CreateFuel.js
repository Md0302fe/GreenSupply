import React, { useState } from "react";
import { Button, Form, Input, message, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const CreateFuel = () => {
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [imageBase64, setImageBase64] = useState(null);
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  const normFile = (e) => (Array.isArray(e) ? e : e && e.fileList);

  const handleUploadChange = async (info) => {
    if (
      info.file.status === "done" ||
      info.file.status === "uploading" ||
      info.file.status === "removed"
    ) {
      if (info.file.originFileObj) {
        try {
          const base64 = await getBase64(info.file.originFileObj);
          setImageBase64(base64);
        } catch {
          message.error("Lỗi khi đọc ảnh.");
          setImageBase64(null);
        }
      } else {
        setImageBase64(null);
      }
    }
  };

  const onFinish = async (values) => {
    if (!imageBase64) {
      message.error("Vui lòng chọn ảnh loại nhiên liệu");
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = {
        type_name: values.type_name,
        description: values.description || "",
        image_url: imageBase64,
      };

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/fuel/create`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        }
      );

      if (res.data.success) {
        message.success("Tạo loại nhiên liệu mới thành công!");
        form.resetFields();
        setImageBase64(null);
      } else {
        message.error("Tạo nhiên liệu thất bại!");
      }
    } catch (error) {
      console.error("Lỗi khi tạo nhiên liệu:", error);
      message.error("Có lỗi xảy ra khi tạo nhiên liệu mới.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isValidType =
        file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/jpg";
      if (!isValidType) {
        message.error("Chỉ hỗ trợ upload ảnh JPG/PNG!");
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("Ảnh phải nhỏ hơn 2MB!");
      }
      return isValidType && isLt2M;
    },
    onRemove: () => setImageBase64(null),
    maxCount: 1,
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-100 p-6">
     
  {/* Nút quay lại - đặt riêng, full width, căn trái */}
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
          Tạo Loại Nhiên Liệu Mới
        </h2>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Tên loại nhiên liệu"
            name="type_name"
            rules={[
              { required: true, message: "Vui lòng nhập tên loại nhiên liệu" },
            ]}
          >
            <Input
              placeholder="Nhập tên loại nhiên liệu"
              maxLength={100}
              className="rounded border-gray-300"
            />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea
              rows={3}
              placeholder="Nhập mô tả (không bắt buộc)"
              className="rounded border-gray-300"
            />
          </Form.Item>

          <Form.Item
            label="Ảnh loại nhiên liệu (JPG, PNG < 2MB)"
            name="image_url"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[
              { required: true, message: "Vui lòng chọn ảnh loại nhiên liệu" },
            ]}
          >
            <Upload
              {...uploadProps}
              onChange={handleUploadChange}
              listType="picture"
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full py-2"
              loading={submitLoading}
            >
              Tạo Loại Nhiên Liệu
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default CreateFuel;
