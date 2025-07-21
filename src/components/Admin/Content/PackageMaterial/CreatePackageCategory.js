import React, { useState } from "react";
import { Button, Form, Input, message } from "antd";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";

const CreatePackageCategory = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

 const onFinish = async (values) => {
  try {
    setLoading(true);

    const payload = {
      categories_name: values.name.trim(),
      Descriptions: values.description?.trim() || "Không có mô tả",
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
      message.success(t("createPackageCategory.success"));
      form.resetFields();
      navigate(-1);
    } else {
      message.error(t("createPackageCategory.fail"));
    }
  } catch (err) {
    if (err.response?.data?.message === "DUPLICATE_CATEGORY_NAME") {
      form.setFields([
        {
          name: "name",
          errors: [t("createPackageCategory.name_already_exists")],
        },
      ]);
    } else {
      console.error("Lỗi tạo loại thùng:", err);
      message.error(t("createPackageCategory.error"));
    }
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
            {t("createPackageCategory.back")}
          </button>
        </div>
      </div>

      <div className="w-full max-w-xl bg-white rounded-lg shadow p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">
          {t("createPackageCategory.title")}
        </h2>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label={t("createPackageCategory.name_label")}
            name="name"
            rules={[
              {
                required: true,
                message: t("createPackageCategory.name_required"),
              },
            ]}
          >
            <Input placeholder={t("createPackageCategory.name_placeholder")} />
          </Form.Item>

          <Form.Item
            label={t("createPackageCategory.description_label")}
            name="description"
          >
            <Input.TextArea
              placeholder={t("createPackageCategory.description_placeholder")}
              rows={3}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full"
            >
              {t("createPackageCategory.submit")}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default CreatePackageCategory;
