import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, Input, Select, Button, message } from "antd";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import * as RawMaterialBatches from "../../../../services/RawMaterialBatch";
import { createMaterialStorageExport } from "../../../../services/MaterialStorageExportService";
import { GoPackageDependents } from "react-icons/go";
import { ArrowLeft, Package, ArrowRightFromLine } from "lucide-react";
import { useTranslation } from "react-i18next";

const MaterialStorageExport = () => {
  const { t } = useTranslation();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [productionRequests, setProductionRequests] = useState([]);
  const [rawMaterialBatches, setRawMaterialBatches] = useState([]);
  const [loadingProduction, setLoadingProduction] = useState(false);
  const [loadingBatch, setLoadingBatch] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const batchId = params.get("id");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const formattedToken = token.replace(/^"(.*)"$/, "$1");

        if (!token) {
          message.error(t("messages.notLoggedIn"));
          return;
        }

        const decodedToken = jwtDecode(token);
        const userId = decodedToken?.id;

        if (!userId) {
          message.error(t("messages.userIdNotFound"));
          return;
        }

        const headers = {
          Authorization: `Bearer ${formattedToken}`,
          "Content-Type": "application/json",
        };

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/user/detail-user/${userId}`,
          { headers }
        );

        if (response.data && response.data.status === "OK") {
          setUser(response.data.data);
        } else {
          message.error(t("messages.userFetchFailed"));
        }
      } catch (error) {
        console.error("Lỗi khi lấy user:", error);
        message.error(t("messages.userFetchError"));
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingProduction(true);
      setLoadingBatch(true);

      try {
        const [productionRes, batchRes] = await Promise.all([
          axios.get(
            `${process.env.REACT_APP_API_URL}/product-request/getAllProcessing`
          ),
          axios.get(
            `${process.env.REACT_APP_API_URL}/raw-material-batch/getAllRawMaterialBatch`
          ),
        ]);

        const allBatches =
          batchRes.data.batches || batchRes.data.requests || [];
        const filteredBatches = allBatches.filter(
          (batch) => batch.status === "Đang chuẩn bị"
        );

        const productionData = productionRes.data.requests || [];

        setRawMaterialBatches(filteredBatches);
        setProductionRequests(productionData);

        // Nếu có batchId trên URL và nằm trong danh sách hợp lệ
        if (batchId) {
          const selectedBatch = filteredBatches.find((b) => b._id === batchId);
          if (selectedBatch) {
            form.setFieldsValue({
              batch_id: selectedBatch._id,
              production_request_id: selectedBatch.production_request_id,
            });
          }
        }
      } catch (error) {
        message.error(t("messages.dataFetchError"));
      } finally {
        setLoadingProduction(false);
        setLoadingBatch(false);
      }
    };

    fetchData();
  }, [batchId, form]);

  // const handleProductionRequestChange = (value) => {
  //   const batch = rawMaterialBatches.find(
  //     (b) => b.production_request_id === value
  //   );
  //   if (batch) {
  //     setSelectedBatch(batch);
  //     form.setFieldsValue({ batch_id: batch._id }); // dùng _id để submit
  //   } else {
  //     setSelectedBatch(null);
  //     form.setFieldsValue({ batch_id: null });
  //   }
  // };

  const handleBatchChange = (value) => {
    const selectedBatch = rawMaterialBatches.find((b) => b._id === value);

    if (selectedBatch?.production_request_id) {
      form.setFieldsValue({
        production_request_id: selectedBatch.production_request_id,
      });
    } else {
      form.setFieldsValue({ production_request_id: null });
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      if (!user || !user._id) {
        message.error(t("messages.userNotFound"));
        return;
      }

      const access_token = localStorage
        .getItem("access_token")
        ?.replace(/^"(.*)"$/, "$1");

      const dataRequest = {
        ...values,
        user_id: user._id,
      };

      // Gọi API tạo đơn xuất kho
      await createMaterialStorageExport(dataRequest);

      // Gọi API cập nhật trạng thái lô nguyên liệu thành "Chờ xuất kho"
      await RawMaterialBatches.updateRawMaterialBatchStatus(
        values.batch_id,
        "Chờ xuất kho",
        access_token
      );

      form.resetFields();

      // Reload danh sách lô nguyên liệu
      const updatedBatches =
        await RawMaterialBatches.getAllRawMaterialBatches();
      const filteredBatches = updatedBatches.filter(
        (batch) => batch.status === "Đang chuẩn bị"
      );
      setRawMaterialBatches(filteredBatches);

      navigate("/system/admin/material-storage-export-list", {
        state: { createdSuccess: true },
      });
    } catch (error) {
      message.error(
        error.response?.data?.message || t("messages.unknownError")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white from-blue-50 via-indigo-50 to-purple-50 px-4 py-6">
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center bg-white/80 backdrop-blur-sm text-gray-700 font-medium py-2.5 px-4 rounded-xl shadow-sm hover:shadow-md hover:bg-white transition-all duration-200 border-2 border-gray-200/50"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
          {t("harvest.back")}
        </button>

        <button
          type="button"
          onClick={() => navigate("/system/admin/material-storage-export-list")}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-3.5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
        >
          {t("materialExport.viewList") || "Warehouse Exports List"}
        </button>
      </div>
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-5">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
              {t("materialExport.title")}
            </h1>
            <p className="text-gray-600 text-lg">
              {t("materialExport.title_description")}
            </p>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <ArrowRightFromLine className="h-4 w-4 text-white" />
              </div>
              {t("materialExport.detail")}
            </h2>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {/* User Info */}
            {user && (
              <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <p className="text-lg font-medium text-gray-700">
                  {t("materialExport.createdBy")}{" "}
                  <span className="text-blue-600 font-semibold">
                    {user.full_name}
                  </span>
                </p>
              </div>
            )}

            {/* <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item 
                label={t("materialExport.selectBatch")}
                name="batch_id"
                rules={[
                  { required: true, message: t("validation.requiredBatch") },
                ]}
              >
                <Select
                  placeholder={t("materialExport.selectBatch")}
                  loading={loadingBatch}
                  onChange={handleBatchChange}
                >
                  {rawMaterialBatches.map((batch) => (
                    <Select.Option key={batch._id} value={batch._id}>
                      {batch.batch_name} - {batch.quantity} Kg (
                      {t(`status.${batch.statusKey || "preparing"}`)})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item> */}

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              className="space-y-6"
            >
              {/* Select Batch */}
              <Form.Item
                label={
                  <span className="text-gray-800 font-semibold text-sm flex items-center gap-1">
                    {/* <span className="text-red-500 text-base"></span> */}
                    {t("materialExport.selectBatch")}
                  </span>
                }
                name="batch_id"
                rules={[{ required: true, message: "Please select a batch" }]}
              >
                <Select
                  placeholder={t("materialExport.selectBatchPlaceholder")}
                  loading={loadingBatch}
                  onChange={handleBatchChange}
                  className="custom-select"
                  size="large"
                >
                  {rawMaterialBatches.map((batch) => (
                    <Select.Option key={batch._id} value={batch._id}>
                      {batch.batch_name} - {batch.quantity} Kg (Preparing)
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Select Production Request */}
              <Form.Item
                label={
                  <span className="text-gray-800 font-semibold text-sm flex items-center gap-1">
                    {/* <span className="text-red-500 text-base">*</span> */}
                    {t("materialExport.selectProduction")}
                  </span>
                }
                name="production_request_id"
                // rules={[
                //   {
                //     required: true,
                //     message: "Please select a production request",
                //   },
                // ]}
              >
                <Select
                  placeholder={t("materialExport.selectProductionPlaceholder")}
                  loading={loadingProduction}
                  className="custom-select"
                  size="large"
                  disabled
                >
                  {productionRequests.map((request) => (
                    <Select.Option key={request._id} value={request._id}>
                      {request.request_name} - {request.status}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Export Name */}
              <Form.Item
                label={
                  <span className="text-gray-800 font-semibold text-sm flex items-center gap-1">
                    {/* <span className="text-red-500 text-base">*</span> */}
                    {t("materialExport.exportName")}
                  </span>
                }
                name="export_name"
                rules={[
                  { required: true, message: "Please enter export name" },
                ]}
              >
                <Input
                  placeholder={t("materialExport.exportNamePlaceholder")}
                  maxLength={60}
                  className="border-2 border-gray-200 p-4 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400 bg-gray-50/50"
                  size="large"
                />
              </Form.Item>

              {/* Export Type */}
              <Form.Item
                label={
                  <span className="text-gray-800 font-semibold text-sm">
                    {t("materialExport.exportType")}
                  </span>
                }
                name="type_export"
                initialValue="Đơn sản xuất"
              >
                <Select disabled className="custom-select" size="large">
                  <Select.Option value="Đơn sản xuất">
                    {t("materialExport.productionType")}
                  </Select.Option>
                </Select>
              </Form.Item>

              {/* Notes */}
              <Form.Item
                label={
                  <span className="text-gray-800 font-semibold text-sm">
                    {t("materialExport.note")}
                  </span>
                }
                name="note"
              >
                <Input.TextArea
                  rows={4}
                  placeholder={t("materialExport.notePlaceholder")}
                  className="border-2 border-gray-200 p-4 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400 bg-gray-50/50 resize-none"
                />
              </Form.Item>

              {/* Submit Button */}
              <Form.Item className="pt-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Creating Export Request...
                    </div>
                  ) : (
                    t("materialExport.create_btn")
                  )}
                </Button>
              </Form.Item>
            </Form>

            {/* Help Text */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-xl mt-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>{t("materialExport.note_require.note")}</strong>{" "}
                    {t("materialExport.note_require.note_parent")}{" "}
                    <span className="text-red-500 font-semibold">*</span>{" "}
                    {t("materialExport.note_require.note_child")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialStorageExport;
