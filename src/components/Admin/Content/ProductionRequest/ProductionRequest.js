import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  message,
} from "antd";
import moment from "moment";
import axios from "axios";
import * as ProductionRequestServices from "../../../../services/ProductionRequestServices";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

import { GrPlan } from "react-icons/gr";
import { useTranslation } from "react-i18next";

// Hàm gọi API danh sách Nguyên liệu sử dụng axios
export const getAllFuelType = async () => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/fuel-management/getAll`
  );
  return res?.data;
};

const ProductionRequest = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [fuelTypes, setFuelTypes] = useState([]);
  const [fuelLoading, setFuelLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const user = useSelector((state) => state.user);
  const [selectedFuelAvailable, setSelectedFuelAvailable] = useState(null);

  useEffect(() => {
    const fetchFuelTypes = async () => {
      setFuelLoading(true);
      try {
        const data = await getAllFuelType();
        console.log("Fuel Data:", data);
        // Giả sử API trả về dữ liệu dạng { success: true, requests: [...] }
        setFuelTypes(data.requests);
      } catch (error) {
        message.error(t("messages.fetchFuelError"));
      } finally {
        setFuelLoading(false);
      }
    };
    fetchFuelTypes();
  }, []);

  // Khi người dùng nhập sản lượng mong muốn, tính số lượng cần thiết ước tính và kiểm tra giới hạn Nguyên liệu
  const handleEstimatedProductionChange = (value) => {
    const selectedFuelId = form.getFieldValue("material");
    if (!selectedFuelId) {
      message.warning(t("messages.selectFuelFirst"));
      form.setFieldsValue({ product_quantity: 1, material_quantity: 1 }); // Reset sản lượng và nguyên liệu
      return;
    }
    if (!value || value < 1) {
      form.setFieldsValue({ material_quantity: 1 });
      return;
    }
    const required = Math.ceil(value / 0.9);
    if (selectedFuelId) {
      const selectedFuel = fuelTypes.find((f) => f._id === selectedFuelId);
      if (selectedFuel) {
        const availableFuel = selectedFuel.quantity;
        if (required > availableFuel) {
          const maxProduction = Math.floor(availableFuel * 0.9);
          message.warning(
            t("messages.materialOverLimit", { max: maxProduction })
          );
          form.setFieldsValue({
            product_quantity: maxProduction,
            material_quantity: Math.ceil(maxProduction / 0.9),
          });
          return;
        }
      }
    }
    form.setFieldsValue({ material_quantity: required });
  };
  const calculateProductQuantity = () => {
    const material_quantity = form.getFieldValue("material_quantity");
    const loss_percentage = form.getFieldValue("loss_percentage");

    if (
      typeof material_quantity === "number" &&
      selectedFuelAvailable != null
    ) {
      if (material_quantity > selectedFuelAvailable) {
        message.warning(
          t("messages.materialStockExceeded", {
            available: selectedFuelAvailable,
          })
        );
        form.setFieldsValue({ material_quantity: selectedFuelAvailable });
        return;
      }
    }

    if (
      typeof material_quantity === "number" &&
      typeof loss_percentage === "number"
    ) {
      const product_quantity = material_quantity * (1 - loss_percentage / 100);
      form.setFieldsValue({ product_quantity: Math.floor(product_quantity) });
    }
  };

  // Disabled date cho ngày sản xuất: không cho chọn quá khứ (từ hôm nay)
  const disabledProductionDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  // Disabled date cho ngày kết thúc: không cho chọn trước ngày sản xuất
  const disabledEndDate = (current) => {
    const productionDate = form.getFieldValue("production_date");
    if (!productionDate) {
      return current && current < dayjs().startOf("day");
    }
    return current && current.isBefore(productionDate, "day");
  };

  // Sử dụng axios để gửi dữ liệu form sang backend
  const onFinish = async (values) => {
    // Chuyển đổi ngày sang ISO string nếu có
    const formattedValues = {
      ...values,
      request_name: values.request_name.toUpperCase(),
      production_date: values.production_date
        ? values.production_date.toISOString()
        : null,
      end_date: values.end_date ? values.end_date.toISOString() : null,
    };
    console.log(formattedValues);
    setSubmitLoading(true);
    try {
      // 1. Tạo sản phẩm mới và trừ số lượng Nguyên liệu trong kho
      const response = await ProductionRequestServices.createProductionRequest({
        dataRequest: formattedValues,
        access_token: user.access_token,
      });

      if (response.statusCode === 200) {
        message.success(t("messages.createSuccess"));

        // 2. Sau khi tạo đơn, gọi lại API để lấy dữ liệu kho mới
        const updatedFuelData = await axios.get(
          `${process.env.REACT_APP_API_URL}/fuel-management/getAll`
        );

        // 3. Cập nhật lại danh sách Nguyên liệu
        setFuelTypes(updatedFuelData.data.requests);

        // Reset form sau khi thành công
        form.resetFields();
      } else {
        message.error(t("messages.createFail"));
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error(t("messages.submitError"));
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="flex justify-between items-center mb-4 w-full">
        <Button
          onClick={() => navigate(-1)}
          type="primary"
          className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded-md shadow-sm transition duration-300"
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
          {t("common.back")}
        </Button>
        <Button
          onClick={() => navigate("/system/admin/production-request-list")}
          type="default"
          className="flex items-center border border-gray-400 text-gray-700 font-medium py-2 px-3 rounded-md shadow-sm hover:bg-gray-100 transition duration-300 ml-2"
        >
          <span className="border-b border-black border-solid">
            {t("productionRequest.planList")}
          </span>
        </Button>
      </div>
      <div className="w-full max-w-3xl bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center mt-2 mb-4 gap-2">
          <GrPlan className="size-6" />
          <h2 className="text-3xl font-bold text-center">
            {t("productionRequest.title")}
          </h2>
        </div>

        {/* {fuelLoading && (
          <div className="flex justify-center items-center mb-4">
            <span className="text-lg font-medium text-blue-600">
              Loading danh sách Nguyên liệu...
            </span>
          </div>
        )} */}

        {submitLoading && (
          <div className="flex justify-center items-center mb-4">
            <span className="text-lg font-medium text-blue-600">
              Loading...
            </span>
          </div>
        )}

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label={t("productionRequest.name")}
            name="request_name"
            rules={[
              { required: true, message: t("validation.planNameRequired") },
            ]}
          >
            <Input
              placeholder={t("productionRequest.namePlaceholder")}
              maxLength={100}
              className="rounded border-gray-300"
            />
          </Form.Item>

          {/* Chọn Loại Nguyên liệu và nhập Sản lượng mong muốn cùng hàng */}
          <div className="flex flex-col md:flex-row md:space-x-4">
            <Form.Item
              label={t("productionRequest.material")}
              name="material"
              rules={[
                { required: true, message: t("validation.materialRequired") },
              ]}
              className="flex-1"
            >
              <Select
                placeholder={t("productionRequest.selectMaterial")}
                className="rounded border-gray-300"
                onChange={(value) => {
                  const selectedFuel = fuelTypes.find((f) => f._id === value);
                  if (selectedFuel) {
                    setSelectedFuelAvailable(selectedFuel.quantity);
                  } else {
                    setSelectedFuelAvailable(null);
                  }
                  form.setFieldsValue({
                    material_quantity: null,
                    product_quantity: null,
                  });
                }}
              >
                {fuelTypes
                  .filter((fuel) => fuel.quantity > 0) // Lọc ra Nguyên liệu có quantity > 0
                  .map((fuel) => (
                    <Select.Option key={fuel._id} value={fuel._id}>
                      {fuel.fuel_type_id?.type_name} ({fuel.quantity} Kg)
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>

            <Form.Item
              label={t("productionRequest.materialQty")}
              name="material_quantity"
              rules={[
                {
                  required: true,
                  message: t("validation.materialQtyRequired"),
                },
                {
                  type: "number",
                  min: 1,
                  message: t("validation.mustBeGreaterThanZero"),
                },
              ]}
            >
              <InputNumber
                min={1}
                className="w-full rounded border-gray-300"
                placeholder={t("productionRequest.enterMaterialQty")}
                onChange={calculateProductQuantity}
              />
            </Form.Item>
          </div>

          {/* Hiển thị Số lượng nguyên liệu cần thiết ước tính (tính tự động) */}
          <Form.Item
            label={t("productionRequest.loss")}
            name="loss_percentage"
            rules={[
              { required: true, message: t("validation.lossRequired") },
              {
                type: "number",
                min: 0,
                max: 100,
                message: t("validation.lossPercentageRange"),
              },
            ]}
          >
            <InputNumber
              min={0}
              max={100}
              className="w-full rounded border-gray-300"
              placeholder={t("productionRequest.enterLoss")}
              onChange={calculateProductQuantity}
            />
          </Form.Item>

          <Form.Item
            label={t("productionRequest.productQty")}
            name="product_quantity"
          >
            <InputNumber
              disabled
              className="w-full rounded border-gray-300 bg-gray-50"
            />
          </Form.Item>

          {/* Thêm trường Mức độ ưu tiên */}
          <Form.Item
            label={t("productionRequest.priority")}
            name="priority"
            rules={[
              { required: true, message: t("validation.priorityRequired") },
            ]}
          >
            <Select
              placeholder={t("productionRequest.selectPriority")}
              className="rounded border-gray-300"
            >
              <Select.Option value={3}>{t("priority.high")}</Select.Option>
              <Select.Option value={2}>{t("priority.medium")}</Select.Option>
              <Select.Option value={1}>{t("priority.low")}</Select.Option>
            </Select>
          </Form.Item>

          {/* Ngày sản xuất */}
          <Form.Item
            label={t("productionRequest.productionDate")}
            name="production_date"
            rules={[
              {
                required: true,
                message: t("validation.productionDateRequired"),
              },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder={t("productionRequest.selectProductionDate")}
              className="rounded border-gray-300"
              disabledDate={disabledProductionDate}
            />
          </Form.Item>

          {/* Ngày kết thúc chỉ cho phép chọn khi đã chọn ngày sản xuất */}
          <Form.Item
            label={t("productionRequest.endDate")}
            name="end_date"
            rules={[
              { required: true, message: t("validation.endDateRequired") },
            ]}
          >
            <Form.Item noStyle dependencies={["production_date"]}>
              {({ getFieldValue }) => (
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder={
                    !getFieldValue("production_date")
                      ? t("productionRequest.selectProductionDateFirst")
                      : t("productionRequest.selectEndDate")
                  }
                  className="rounded border-gray-300"
                  disabled={!getFieldValue("production_date")} // disable if no production_date
                  disabledDate={disabledEndDate} // Custom function for disabled date
                  onChange={(date) => form.setFieldsValue({ end_date: date })} // Set end_date value on change
                />
              )}
            </Form.Item>
          </Form.Item>

          {/* Trường ẩn request_type có giá trị cứng "Đơn sản xuất" */}
          <Form.Item
            name="request_type"
            initialValue="Đơn sản xuất"
            style={{ display: "none" }}
          >
            <Input />
          </Form.Item>

          <Form.Item label={t("productionRequest.note")} name="note">
            <Input.TextArea
              rows={4}
              placeholder={t("productionRequest.enterNote")}
              className="rounded border-gray-300"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full py-2">
              {t("common.confirm")}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ProductionRequest;
