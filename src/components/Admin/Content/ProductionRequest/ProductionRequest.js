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

// Hàm gọi API danh sách Nguyên liệu sử dụng axios
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
  const [packagingMaterials, setPackagingMaterials] = useState([]);
  const [productionDate, setProductionDate] = useState(null);

  const [selectedPackaging, setSelectedPackaging] = useState({
    vacuumBag: null,
    carton: null,
  });
  const [isProductQuantityCalculated, setIsProductQuantityCalculated] =
    useState(false);
  const [productQuantity, setProductQuantity] = useState(0);
  const [calculatedPackaging, setCalculatedPackaging] = useState({
    vacuumBag: 0,
    carton: 0,
  });
  const user = useSelector((state) => state.user);
  const [selectedFuelAvailable, setSelectedFuelAvailable] = useState(null);

  useEffect(() => {
    const fetchFuelTypes = async () => {
      setFuelLoading(true);
      try {
        const data = await getAllFuelType();
        console.log("Fuel Data:", data);
        setFuelTypes(data.requests);
      } catch (error) {
        message.error("Có lỗi xảy ra khi tải danh sách Nguyên liệu.");
      } finally {
        setFuelLoading(false);
      }
    };

    const fetchPackagingMaterials = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/package-material/boxes`
        );
        setPackagingMaterials(res.data.data || []);
      } catch (error) {
        message.error("Lỗi khi tải danh sách bao bì.");
      }
    };

    fetchFuelTypes();
    fetchPackagingMaterials();
  }, []);
   
  
// hàm tính số lượng túi và thùng carton cần thiết dựa trên sản lượng thành phẩm
  const handlePackagingSelect = (value, type) => {
    const selectedMaterial = packagingMaterials.find(
      (item) => item._id === value
    );

    setSelectedPackaging((prev) => ({
      ...prev,
      [type]: selectedMaterial,
    }));

    const productKg = form.getFieldValue("product_quantity");

    // Nếu chưa có sản lượng thì không làm gì
    if (!productKg || !selectedMaterial) return;

    const productGrams = productKg * 1000; // đổi kg → g

    if (type === "vacuumBag") {
      const vacuumBagRequired = Math.ceil(
        productGrams / selectedMaterial.capacity
      );
      setCalculatedPackaging((prev) => ({
        ...prev,
        vacuumBag: vacuumBagRequired,
      }));
    }

    if (type === "carton") {
      const cartonCapacityKg = selectedMaterial.capacity;

      if (!productKg || !cartonCapacityKg) return;

      const cartonRequired = Math.ceil(productKg / cartonCapacityKg);

      setCalculatedPackaging((prev) => ({
        ...prev,
        carton: cartonRequired,
      }));
    }
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
      const rounded = Math.floor(product_quantity);
      form.setFieldsValue({ product_quantity: rounded });

      setIsProductQuantityCalculated(rounded > 0);
    }
  };

  // Disabled date cho ngày sản xuất: không cho chọn quá khứ (từ hôm nay)
  const disabledProductionDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  // Hàm để disable Ngày kết thúc nếu chưa chọn Ngày sản xuất
  const disabledEndDate = (current) => {
    const productionDate = form.getFieldValue("production_date");
    if (!productionDate) {
      return current && current < dayjs().startOf("day");
    }
    return current && current.isBefore(productionDate, "day");
  };

  const handleProductQuantityChange = () => {
    const productQuantity = form.getFieldValue("product_quantity");
    if (productQuantity > 0) {
      setIsProductQuantityCalculated(true); // Nếu có sản lượng thành phẩm ước tính, bật các lựa chọn bao bì
    } else {
      setIsProductQuantityCalculated(false); // Nếu chưa có sản lượng thành phẩm, tắt các lựa chọn bao bì
    }
  };

  const onFinish = async (values) => {
    // Chuyển đổi ngày sang ISO string nếu có
    const formattedValues = {
      ...values,
      request_name: values.request_name.toUpperCase(),
      production_date: values.production_date
        ? values.production_date.toISOString()
        : null,
      end_date: values.end_date ? values.end_date.toISOString() : null,
      packaging: {
        vacuumBag: calculatedPackaging.vacuumBag,
        carton: calculatedPackaging.carton,
        vacuumBagBoxId: selectedPackaging.vacuumBag?._id,
        cartonBoxId: selectedPackaging.carton?._id,
      },
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
        message.success("Tạo Production Request thành công!");

        // 2. Sau khi tạo đơn, gọi lại API để lấy dữ liệu kho mới
        const updatedFuelData = await axios.get(
          `${process.env.REACT_APP_API_URL}/fuel-management/getAll`
        );

        // 3. Cập nhật lại danh sách Nguyên liệu
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
          Quay lại
        </Button>
        <Button
          onClick={() => navigate("/system/admin/production-request-list")}
          type="default"
          className="flex items-center border border-gray-400 text-gray-700 font-medium py-2 px-3 rounded-md shadow-sm hover:bg-gray-100 transition duration-300 ml-2"
        >
          <span className="border-b border-black border-solid">
            Danh sách kế hoạch
          </span>
        </Button>
      </div>
      <div className="w-full max-w-3xl bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center mt-2 mb-4 gap-2">
          <GrPlan className="size-6" />
          <h2 className="text-3xl font-bold text-center">
            Lập Kế Hoạch Sản Xuất
          </h2>
        </div>

        {submitLoading && (
          <div className="flex justify-center items-center mb-4">
            <span className="text-lg font-medium text-blue-600">
              Loading...
            </span>
          </div>
        )}

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Tên kế hoạch"
            name="request_name"
            rules={[{ required: true, message: "Vui lòng nhập tên kế hoạch" }]}
          >
            <Input
              placeholder="Nhập tên kế hoạch"
              maxLength={100}
              className="rounded border-gray-300"
            />
          </Form.Item>

          {/* Chọn Loại Nguyên liệu và nhập Sản lượng mong muốn cùng hàng */}
          <div className="flex flex-col md:flex-row md:space-x-4">
            <Form.Item
              label="Loại Nguyên liệu"
              name="material"
              rules={[
                { required: true, message: "Vui lòng chọn Loại Nguyên liệu" },
              ]}
              className="flex-1"
            >
              <Select
                placeholder="Chọn Loại Nguyên liệu"
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

          {/* Chọn Bao Bì */}
          <Form.Item label="Chọn Túi chân không">
            <Select
              placeholder="Có sản lượng thành phẩm trước"
              disabled={!isProductQuantityCalculated}
              onChange={(value) => handlePackagingSelect(value, "vacuumBag")}
            >
              {packagingMaterials
                .filter((material) => material.type === "túi chân không")
                .map((material) => (
                  <Select.Option key={material._id} value={material._id}>
                    {material.package_material_name} - {material.capacity} g
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item label="Chọn Thùng carton">
            <Select
              placeholder="Có sản lượng thành phẩm trước"
              disabled={!isProductQuantityCalculated}
              onChange={(value) => handlePackagingSelect(value, "carton")}
            >
              {packagingMaterials
                .filter((material) => material.type === "thùng carton")
                .map((material) => (
                  <Select.Option key={material._id} value={material._id}>
                    {material.package_material_name} - {material.capacity} kg
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>

          {selectedPackaging.vacuumBag && selectedPackaging.carton && (
            <div>
              <p>
                Số lượng Túi chân không cần dùng:{" "}
                {calculatedPackaging.vacuumBag} Túi
              </p>
              <p>
                Số lượng Thùng carton cần dùng: {calculatedPackaging.carton}{" "}
                Thùng
              </p>
            </div>
          )}
          <Form.Item
            label="Mức độ ưu tiên"
            name="priority"
            rules={[
              { required: true, message: "Vui lòng chọn mức độ ưu tiên" },
            ]}
          >
            <Select placeholder="Chọn mức độ ưu tiên">
              <Select.Option value={3}>Cao</Select.Option>
              <Select.Option value={2}>Trung bình</Select.Option>
              <Select.Option value={1}>Thấp</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Ngày sản xuất"
            name="production_date"
            rules={[{ required: true, message: "Vui lòng chọn ngày sản xuất" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày sản xuất"
              disabledDate={disabledProductionDate}
              onChange={(date) => {
                setProductionDate(date);
                form.setFieldsValue({ production_date: date });
              }}
            />
          </Form.Item>
          <Form.Item
            label="Ngày kết thúc"
            name="end_date"
            rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày kết thúc"
              disabledDate={disabledEndDate}
              disabled={!productionDate} 
              onChange={(date) => form.setFieldsValue({ end_date: date })}
            />
          </Form.Item>

          <Form.Item
            name="request_type"
            initialValue="Đơn sản xuất"
            style={{ display: "none" }}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea rows={4} placeholder="Nhập ghi chú (nếu có)" />
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
