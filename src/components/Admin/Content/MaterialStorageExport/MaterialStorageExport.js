import React, { useState, useEffect } from "react";
import { Form, Input, Select, DatePicker, Button, message } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";
import { createMaterialStorageExport } from "../../../../services/MaterialStorageExportService";
import * as UserServices from "../../../../services/UserServices";

const MaterialStorageExport = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [productionRequests, setProductionRequests] = useState([]);
  const [rawMaterialBatches, setRawMaterialBatches] = useState([]);
  const [loadingProduction, setLoadingProduction] = useState(false);
  const [loadingBatch, setLoadingBatch] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const formattedToken = token.replace(/^"(.*)"$/, "$1");

        if (!token) {
          message.error("Bạn chưa đăng nhập.");
          return;
        }

        const decodedToken = jwtDecode(token);
        const userId = decodedToken?.id;

        if (!userId) {
          message.error("Không tìm thấy ID người dùng.");
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
          message.error("Không thể lấy thông tin người dùng.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy user:", error);
        message.error("Lỗi khi lấy thông tin người dùng từ server.");
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingProduction(true);
        setLoadingBatch(true);

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

        setProductionRequests(productionRes.data.requests || []);
        setRawMaterialBatches(filteredBatches);
        // setRawMaterialBatches(
        //   batchRes.data.batches || batchRes.data.requests || []
        // );
      } catch (error) {
        message.error("Lỗi khi tải dữ liệu từ server.");
      } finally {
        setLoadingProduction(false);
        setLoadingBatch(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      if (!user || !user._id) {
        message.error("Không tìm thấy thông tin người dùng.");
        return;
      }

      const dataRequest = {
        ...values,
        user_id: user._id,
      };

      const response = await createMaterialStorageExport(dataRequest);
      message.success("Tạo đơn xuất kho thành công!");
      form.resetFields();
    } catch (error) {
      console.error("Lỗi khi tạo đơn xuất kho:", error);
      message.error(error.response?.data?.message || "Lỗi không xác định!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow p-6">
        <h2 className="text-3xl font-bold text-gray-800 text-center my-4">
          🏭 Tạo Đơn Xuất Kho
        </h2>

        {/* ✅ Hiển thị tên người dùng */}
        {user && (
          <p className="mb-4 text-lg font-semibold text-gray-700">
            Người tạo đơn:{" "}
            <span className="text-blue-600">{user.full_name}</span>
          </p>
        )}

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Chọn Đơn sản xuất */}
          <Form.Item
            label="Chọn Đơn sản xuất"
            name="production_request_id"
            rules={[{ required: true, message: "Vui lòng chọn đơn sản xuất" }]}
          >
            <Select placeholder="Chọn đơn sản xuất" loading={loadingProduction}>
              {productionRequests.map((request) => (
                <Select.Option key={request._id} value={request._id}>
                  {request.request_name} - {request.status}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Chọn Lô nguyên liệu */}
          <Form.Item
            label="Chọn Lô nguyên liệu"
            name="batch_id"
            rules={[
              { required: true, message: "Vui lòng chọn lô nguyên liệu" },
            ]}
          >
            <Select placeholder="Chọn lô nguyên liệu" loading={loadingBatch}>
              {rawMaterialBatches.map((batch) => (
                <Select.Option key={batch._id} value={batch._id}>
                  {batch.batch_name} - {batch.quantity} Kg ({batch.status})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Tên đơn xuất kho */}
          <Form.Item
            label="Tên đơn xuất kho"
            name="export_name"
            rules={[{ required: true, message: "Vui lòng nhập tên xuất kho" }]}
          >
            <Input placeholder="Nhập tên xuất kho" maxLength={60} />
          </Form.Item>

          {/* Loại đơn xuất kho */}
          <Form.Item
            label="Loại đơn xuất kho"
            name="type_export"
            initialValue="Đơn sản xuất"
          >
            <Select disabled>
              <Select.Option value="Đơn sản xuất">Đơn sản xuất</Select.Option>
            </Select>
          </Form.Item>

          {/* Ghi chú */}
          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea rows={4} placeholder="Nhập ghi chú" />
          </Form.Item>

          {/* Nút xác nhận */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full py-2"
              loading={loading}
            >
              Xác nhận
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default MaterialStorageExport;
