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

// Hàm gọi API danh sách nhiên liệu sử dụng axios
export const getAllFuelType = async () => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/fuel-management/getAll`
  );
  return res?.data;
};

const ProductionRequest = () => {
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
        message.error("Có lỗi xảy ra khi tải danh sách nhiên liệu.");
      } finally {
        setFuelLoading(false);
      }
    };
    fetchFuelTypes();
  }, []);

  // Khi người dùng nhập sản lượng mong muốn, tính số lượng cần thiết ước tính và kiểm tra giới hạn nhiên liệu
  const handleEstimatedProductionChange = (value) => {
    const selectedFuelId = form.getFieldValue("material");
    if (!selectedFuelId) {
      message.warning(
        "Vui lòng chọn loại nhiên liệu trước khi nhập sản lượng mong muốn."
      );
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
            `Sản lượng mong muốn vượt quá số lượng nhiên liệu hiện có. Sản lượng tối đa có thể làm được là ${maxProduction} Kg.`
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
          `Số lượng nguyên liệu vượt quá số lượng tồn kho hiện tại (${selectedFuelAvailable} Kg).`
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
      // 1. Tạo sản phẩm mới và trừ số lượng nhiên liệu trong kho
      const response = await ProductionRequestServices.createProductionRequest({
        dataRequest: formattedValues,
        access_token: user.access_token,
      });

      if (response.statusCode === 200) {
        message.success("Tạo Production Request thành công!");

        // 2. Sau khi tạo đơn, gọi lại API để lấy dữ liệu kho mới
        const updatedFuelData = await axios.get(
          `${process.env.REACT_APP_API_URL}/fuel-management/getAll`
        );

        // 3. Cập nhật lại danh sách nhiên liệu
        setFuelTypes(updatedFuelData.data.requests);

        // Reset form sau khi thành công
        form.resetFields();
      } else {
        message.error("Tạo Production Request thất bại!");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("Có lỗi xảy ra khi tạo Production Request.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
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
            Quay lại
          </Button>
          <Button
            onClick={() => navigate("/system/admin/production-request-list")}
            type="default"
            className="flex items-center border border-gray-400 text-gray-700 font-medium py-1 px-3 rounded-md shadow-sm hover:bg-gray-100 transition duration-300 ml-2"
          >
            Danh sách yêu cầu
          </Button>
        </div>
        <h2 className="text-3xl font-bold mb-6 text-center">
          Tạo Yêu Cầu Sản Xuất Mới
        </h2>

        {fuelLoading && (
          <div className="flex justify-center items-center mb-4">
            <span className="text-lg font-medium text-blue-600">
              Loading danh sách nhiên liệu...
            </span>
          </div>
        )}

        {submitLoading && (
          <div className="flex justify-center items-center mb-4">
            <span className="text-lg font-medium text-blue-600">
              Loading...
            </span>
          </div>
        )}

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Tên yêu cầu"
            name="request_name"
            rules={[{ required: true, message: "Vui lòng nhập tên yêu cầu" }]}
          >
            <Input
              placeholder="Nhập tên yêu cầu"
              maxLength={100}
              className="rounded border-gray-300"
            />
          </Form.Item>

          {/* Chọn Loại nhiên liệu và nhập Sản lượng mong muốn cùng hàng */}
          <div className="flex flex-col md:flex-row md:space-x-4">
            <Form.Item
              label="Loại nhiên liệu"
              name="material"
              rules={[
                { required: true, message: "Vui lòng chọn Loại nhiên liệu" },
              ]}
              className="flex-1"
            >
              <Select
                placeholder="Chọn Loại nhiên liệu"
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
                  .filter((fuel) => fuel.quantity > 0) // Lọc ra nhiên liệu có quantity > 0
                  .map((fuel) => (
                    <Select.Option key={fuel._id} value={fuel._id}>
                      {fuel.fuel_type_id?.type_name} ({fuel.quantity} Kg)
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Số lượng nguyên liệu (kg)"
              name="material_quantity"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập số lượng nguyên liệu",
                },
                {
                  type: "number",
                  min: 1,
                  message: "Giá trị phải lớn hơn 0",
                },
              ]}
            >
              <InputNumber
                min={1}
                className="w-full rounded border-gray-300"
                placeholder="Nhập số lượng nguyên liệu"
                onChange={calculateProductQuantity}
              />
            </Form.Item>
          </div>

          {/* Hiển thị Số lượng nguyên liệu cần thiết ước tính (tính tự động) */}
          <Form.Item
            label="Tỷ lệ hao hụt (%)"
            name="loss_percentage"
            rules={[
              { required: true, message: "Vui lòng nhập tỷ lệ hao hụt" },
              {
                type: "number",
                min: 0,
                max: 100,
                message: "Phần trăm phải từ 0 đến 100",
              },
            ]}
          >
            <InputNumber
              min={0}
              max={100}
              className="w-full rounded border-gray-300"
              placeholder="Nhập tỷ lệ hao hụt"
              onChange={calculateProductQuantity}
            />
          </Form.Item>

          <Form.Item
            label="Sản lượng thành phẩm ước tính (kg)"
            name="product_quantity"
          >
            <InputNumber
              disabled
              className="w-full rounded border-gray-300 bg-gray-50"
            />
          </Form.Item>

          {/* Thêm trường Mức độ ưu tiên */}
          <Form.Item
            label="Mức độ ưu tiên"
            name="priority"
            rules={[
              { required: true, message: "Vui lòng chọn mức độ ưu tiên" },
            ]}
          >
            <Select
              placeholder="Chọn mức độ ưu tiên"
              className="rounded border-gray-300"
            >
              <Select.Option value={3}>Cao</Select.Option>
              <Select.Option value={2}>Trung bình</Select.Option>
              <Select.Option value={1}>Thấp</Select.Option>
            </Select>
          </Form.Item>

          {/* Ngày sản xuất */}
          <Form.Item
            label="Ngày sản xuất"
            name="production_date"
            rules={[{ required: true, message: "Vui lòng chọn ngày sản xuất" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày sản xuất"
              className="rounded border-gray-300"
              disabledDate={disabledProductionDate}
            />
          </Form.Item>

          {/* Ngày kết thúc chỉ cho phép chọn khi đã chọn ngày sản xuất */}
          <Form.Item
            label="Ngày kết thúc"
            name="end_date"
            rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc" }]}
          >
            <Form.Item noStyle dependencies={["production_date"]}>
              {({ getFieldValue }) => (
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder={
                    !getFieldValue("production_date")
                      ? "Vui lòng chọn ngày sản xuất trước"
                      : "Chọn ngày kết thúc"
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

          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea
              rows={4}
              placeholder="Nhập ghi chú (nếu có)"
              className="rounded border-gray-300"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full py-2">
              Xác nhận
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ProductionRequest;
