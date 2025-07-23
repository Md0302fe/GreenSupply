import React, { useState, useEffect } from "react";
import { Button, Form, Input, message, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { ArrowLeft, Plus } from "lucide-react";
import { PiPlusThin } from "react-icons/pi";
import { useTranslation } from "react-i18next";

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const CreateFuel = () => {
  const { t } = useTranslation();
  const [fuelTypes, setFuelTypes] = useState([]);

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
          message.error(t("createFuel.uploadError"));
          setImageBase64(null);
        }
      } else {
        setImageBase64(null);
      }
    }
  };

  const onFinish = async (values) => {
    if (!imageBase64) {
      message.error(t("createFuel.imageRequired"));
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = {
        type_name: values.type_name,
        description: values.description?.trim() || "Không có mô tả",
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
        message.success(t("createFuel.createSuccess"));
        form.resetFields();
        setImageBase64(null);
      } else {
        message.error(t("createFuel.createFail"));
      }
    } catch (error) {
      if (error.response?.data?.message === "DUPLICATE_NAME") {
        form.setFields([
          {
            name: "type_name",
            errors: [t("createFuel.nameAlreadyExists")],
          },
        ]);
      } else {
        console.error("Lỗi khi tạo nguyên liệu:", error);
        message.error(t("createFuel.createError"));
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
  const fetchFuelTypes = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/fuel/getAll`);
      if (res.data?.requests) {
        setFuelTypes(res.data.requests);
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách nhiên liệu", err);
    }
  };

  fetchFuelTypes();
}, []);


  const uploadProps = {
    beforeUpload: (file) => {
      const isValidType =
        file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/jpg";
      if (!isValidType) {
        message.error(t("createFuel.imageTypeError"));
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error(t("createFuel.imageSizeError"));
      }
      return isValidType && isLt2M;
    },
    customRequest: ({ onSuccess }) => setTimeout(() => onSuccess("ok"), 0),
    onRemove: () => setImageBase64(null),
    maxCount: 1,
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-100 p-6">
      {/* Nút quay lại - đặt riêng, full width, căn trái */}
      <div className="w-full mb-2 lg:mb-4 flex justify-between items-center">
        {/* Nút Quay lại */}
        <div>
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center bg-black text-white font-semibold py-1 px-3 rounded-md shadow-sm hover:bg-blue-600 transition duration-300"
            type="button"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-200">
              ←
            </span>
            <span className="ml-2">{t("createFuel.back")}</span>
          </button>
        </div>

        {/* Nút Xem danh sách */}
        <div>
          <button
            onClick={() => navigate("/system/admin/fuel-list")}
            className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md shadow-sm transition duration-300"
          >
            {t("createFuel.viewList") || "Xem danh sách"}
            <span className="group-hover:translate-x-1 transition-transform duration-200">
              →
            </span>
          </button>
        </div>
      </div>

      <div className="w-full max-w-xl bg-white rounded-lg shadow p-8">
        <div className="flex justify-center items-center gap-2 mb-3">
          <PiPlusThin className="size-6"></PiPlusThin>
          <h2 className="text-[20px] lg:text-2xl font-bold text-center text-gray-800 ">
            {t("createFuel.title")}
          </h2>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label={t("createFuel.nameLabel")}
            name="type_name"
            rules={[
              { required: true, message: t("createFuel.nameRequired") },
              {
                validator: (_, value) => {
                  if (!value || !value.trim()) {
                    return Promise.resolve();
                  }

                  const exists = fuelTypes.some(
                    (fuel) =>
                      fuel.fuel_type_id?.type_name.trim().toLowerCase() ===
                      value.trim().toLowerCase()
                  );

                  return exists
                    ? Promise.reject(t("createFuel.nameAlreadyExists"))
                    : Promise.resolve();
                },
              },
            ]}
          >
            <Input
              placeholder={t("createFuel.namePlaceholder")}
              maxLength={100}
              className="rounded border-gray-300"
            />
          </Form.Item>

          <Form.Item
            label={t("createFuel.descLabel")}
            name="description"
            rules={[{ required: true, message: t("createFuel.descRequired") }]}
          >
            <Input.TextArea
              rows={3}
              placeholder={t("createFuel.descPlaceholder")}
              className="rounded border-gray-300"
            />
          </Form.Item>

          <Form.Item
            label={t("createFuel.imageLabel")}
            name="image_url"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: true, message: t("createFuel.imageRequired") }]}
          >
            <Upload
              {...uploadProps}
              onChange={handleUploadChange}
              listType="picture"
              accept="image/jpeg, image/png"
            >
              <Button icon={<UploadOutlined />}>
                {t("createFuel.chooseImage")}
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full py-2"
              loading={submitLoading}
            >
              {t("createFuel.submit")}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );

  // return (
  //   <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-6">
  //     <button
  //       onClick={() => navigate(-1)}
  //       className="group flex items-center bg-white/80 backdrop-blur-sm text-gray-700 font-medium py-2.5 px-4 rounded-xl shadow-sm hover:shadow-md hover:bg-white transition-all duration-200 border-2 border-gray-200/50"
  //     >
  //       <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
  //       {t("createFuel.back")}
  //     </button>
  //     <div className="max-w-2xl mx-auto">
  //       {/* Header Section */}
  //       <div className="mb-4">
  //         <div className="text-center">
  //           <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
  //             {t("createFuel.title")}
  //           </h1>
  //           <p className="text-gray-600 text-lg">
  //             {t("createFuel.title_description")}
  //           </p>
  //         </div>
  //       </div>

  //       {/* Main Form Card */}
  //       <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
  //         {/* Card Header */}
  //         <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
  //           <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
  //             <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
  //               <Plus className="h-4 w-4 text-white" />
  //             </div>
  //             {t("createFuel.detail")}
  //           </h2>
  //         </div>

  //         {/* Form Content */}
  //         <div className="p-8">
  //           <Form
  //             form={form}
  //             layout="vertical"
  //             onFinish={onFinish}
  //             className="space-y-6"
  //           >
  //             {/* Fuel Type Name */}
  //             <Form.Item
  //               label={
  //                 <span className="text-gray-800 font-semibold text-sm flex items-center gap-1">
  //                   {t("createFuel.nameLabel")}
  //                 </span>
  //               }
  //               name="type_name"
  //               rules={[
  //                 { required: true, message: t("createFuel.nameRequired") },
  //               ]}
  //             >
  //               <Input
  //                 placeholder={t("createFuel.namePlaceholder")}
  //                 maxLength={100}
  //                 className="border-2 border-gray-200 p-4 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400 bg-gray-50/50"
  //                 size="large"
  //               />
  //             </Form.Item>

  //             {/* Description */}
  //             <Form.Item
  //               label={
  //                 <span className="text-gray-800 font-semibold text-sm">
  //                   {t("createFuel.descLabel")}
  //                 </span>
  //               }
  //               rules={[
  //                 { required: true, message: t("createFuel.descRequired") },
  //               ]}
  //               name="description"
  //             >
  //               <Input.TextArea
  //                 rows={4}
  //                 placeholder={t("createFuel.descPlaceholder")}
  //                 className="border-2 border-gray-200 p-4 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400 bg-gray-50/50 resize-none"
  //               />
  //             </Form.Item>

  //             {/* Image Upload */}
  //             <Form.Item
  //               label={
  //                 <span className="text-gray-800 font-semibold text-sm flex items-center gap-1">
  //                   {t("createFuel.imageLabel")}
  //                 </span>
  //               }
  //               name="image_url"
  //               valuePropName="fileList"
  //               getValueFromEvent={normFile}
  //               rules={[
  //                 { required: true, message: t("createFuel.imageRequired") },
  //               ]}
  //             >
  //               <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300">
  //                 <Upload
  //                   {...uploadProps}
  //                   onChange={handleUploadChange}
  //                   listType="picture"
  //                   className="w-full"
  //                 >
  //                   <div className="text-center">
  //                     <Button
  //                       icon={<UploadOutlined />}
  //                       size="large"
  //                       rules={[
  //                         {
  //                           required: true,
  //                           message: t("createFuel.imageTypeError") || t("createFuel.imageSizeError"),
  //                         },
  //                       ]}
  //                       className="border-2 border-gray-300 hover:border-blue-400 hover:text-blue-600 transition-all duration-200 rounded-lg px-6 py-3 font-medium"
  //                     >
  //                       {t("createFuel.chooseImage")}
  //                     </Button>
  //                     <p className="text-gray-500 mt-3 text-sm">
  //                       {t("createFuel.imageDesc")}
  //                     </p>
  //                   </div>
  //                 </Upload>
  //               </div>
  //             </Form.Item>

  //             {/* Submit Button */}
  //             <Form.Item className="pt-4">
  //               <div className="flex flex-col sm:flex-row gap-3">
  //                 <Button
  //                   type="primary"
  //                   htmlType="submit"
  //                   loading={submitLoading}
  //                   className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
  //                 >
  //                   {submitLoading ? (
  //                     <div className="flex items-center gap-2">
  //                       <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
  //                       Creating New Material Type...
  //                     </div>
  //                   ) : (
  //                     t("createFuel.create")
  //                   )}
  //                 </Button>
  //               </div>
  //             </Form.Item>
  //           </Form>

  //           {/* Help Text */}
  //           <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-xl mt-6">
  //             <div className="flex items-start">
  //               <div className="flex-shrink-0">
  //                 <svg
  //                   className="h-5 w-5 text-blue-400"
  //                   viewBox="0 0 20 20"
  //                   fill="currentColor"
  //                 >
  //                   <path
  //                     fillRule="evenodd"
  //                     d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
  //                     clipRule="evenodd"
  //                   />
  //                 </svg>
  //               </div>
  //               <div className="ml-3">
  //                 <p className="text-sm text-blue-700">
  //                   <strong>{t("createFuel.note_require.note")}</strong> {t("createFuel.note_require.note_parent")}{" "}
  //                   <span className="text-red-500 font-semibold">*</span> {t("createFuel.note_require.note_child")}
  //                 </p>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
};

export default CreateFuel;
