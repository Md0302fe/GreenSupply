import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, Input, Select, Button, message } from "antd";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import * as RawMaterialBatches from "../../../../services/RawMaterialBatch";
import { createMaterialStorageExport } from "../../../../services/MaterialStorageExportService";
import { GoPackageDependents } from "react-icons/go";

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

        // ✅ Nếu có batchId trên URL và nằm trong danh sách hợp lệ
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-0 lg:p-4">
      <div className="w-full md:w-full bg-gray-100 p-6">
        <button
          onClick={() => navigate(-1)} // Quay lại trang trước đó
          className="flex mb-1 items-center bg-black text-white font-semibold py-1 px-3 rounded-md shadow-sm hover:opacity-70 transition duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1" // Kích thước biểu tượng nhỏ hơn
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
          {t("harvest.back")}
        </button>
        <div className="max-w-3xl mx-auto bg-white p-4 lg:p-6 rounded-lg shadow-lg">
          <h2 className="text-[22px] flex items-center justify-center gap-2 lg:text-3xl font-bold text-gray-800 text-center my-4">
            <GoPackageDependents></GoPackageDependents>{" "}
            {t("materialExport.title")}
          </h2>

          {/* ✅ Hiển thị tên người dùng */}
          {user && (
            <p className="mb-4 text-lg font-semibold text-gray-700">
              {t("materialExport.createdBy")}{" "}
              <span className="text-blue-600">{user.full_name}</span>
            </p>
          )}

          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            {/* Chọn Lô nguyên liệu */}
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
            </Form.Item>

            {/* Chọn Đơn sản xuất */}
            <Form.Item
              label={t("materialExport.selectProduction")}
              name="production_request_id"
              rules={[
                { required: true, message: t("validation.requiredProduction") },
              ]}
            >
              <Select
                placeholder={t("materialExport.selectProduction")}
                loading={loadingProduction}
                disabled
              >
                {productionRequests.map((request) => (
                  <Select.Option key={request._id} value={request._id}>
                    {request.request_name} - {request.status}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {/* Tên đơn xuất kho */}
            <Form.Item
              label={t("materialExport.exportName")}
              name="export_name"
              rules={[
                { required: true, message: t("validation.requiredExportName") },
              ]}
            >
              <Input
                placeholder={t("materialExport.exportNamePlaceholder")}
                maxLength={60}
              />
            </Form.Item>

            {/* Loại đơn xuất kho */}
            <Form.Item
              label={t("materialExport.exportType")}
              name="type_export"
              initialValue="Đơn sản xuất"
            >
              <Select disabled>
                <Select.Option value="Đơn sản xuất">
                  {t("materialExport.productionType")}
                </Select.Option>
              </Select>
            </Form.Item>

            {/* Ghi chú */}
            <Form.Item label={t("materialExport.note")} name="note">
              <Input.TextArea
                rows={4}
                placeholder={t("materialExport.notePlaceholder")}
              />
            </Form.Item>

            {/* Nút xác nhận */}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full py-2"
                loading={loading}
              >
                {t("common.confirm")}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default MaterialStorageExport;
