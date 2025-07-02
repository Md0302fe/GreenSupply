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
        message.error(t("messages.fetchFuelError"));
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
  };

  const getSizeLabel = (sizeCategory) => {
    if (sizeCategory === "nhỏ") return "S";
    if (sizeCategory === "trung bình") return "M";
    if (sizeCategory === "lớn") return "L";
    return "-";
  };

  // hàm tính số lượng túi và thùng carton cần thiết dựa trên sản lượng thành phẩm
const handlePackagingSelect = (value, type) => {
  const selectedMaterial = packagingMaterials.find(
    (item) => item._id === value
  );
  const productKg = form.getFieldValue("product_quantity");
  if (!productKg || !selectedMaterial) return;

  const productGrams = productKg * 1000;
  let requiredQty = 0;
  const fieldName = type === "vacuumBag" ? "vacuumBagSelect" : "cartonSelect";

  //  Gán value vào Form để Form.Item tự nhận biết lựa chọn
  form.setFieldValue(fieldName, value);

  if (type === "vacuumBag") {
    //  Tính số túi = (kg * 1000) / dung tích gói mỗi túi
    requiredQty = Math.ceil(productGrams / selectedMaterial.capacity);
  }

  if (type === "carton") {
    const vacuumBag = selectedPackaging.vacuumBag;
    const vacuumBagCount = calculatedPackaging.vacuumBag;

    if (
      !vacuumBag ||
      !vacuumBagCount ||
      !vacuumBag.dimensions ||
      !selectedMaterial.dimensions
    ) {
      form.setFields([
        {
          name: fieldName,
          errors: ["Cần chọn Túi chân không trước để tính được số thùng."],
        },
      ]);
      return;
    }

    //  Tính thể tích mỗi túi
    const bagVolume =
      vacuumBag.dimensions.length *
      vacuumBag.dimensions.width *
      (vacuumBag.dimensions.height || 1);
    
    // Tổng thể tích túi chân không = số lượng túi * thể tích mỗi túi
    const totalBagVolume = vacuumBagCount * bagVolume;

    //  Tính thể tích mỗi thùng
    const boxVolume =
      selectedMaterial.dimensions.length *
      selectedMaterial.dimensions.width *
      selectedMaterial.dimensions.height;

    //  Số thùng = tổng thể tích túi / thể tích thùng
    requiredQty = Math.ceil(totalBagVolume / boxVolume);
  }

  //  Nếu không đủ số lượng → hiển thị lỗi ngay dưới ô Select
  if (selectedMaterial.quantity < requiredQty) {
    form.setFields([
      {
        name: fieldName,
        errors: [
          `${
            type === "vacuumBag" ? "Túi chân không" : "Thùng carton"
          } không đủ trong kho. Cần ${requiredQty}, hiện còn ${
            selectedMaterial.quantity
          }.`,
        ],
      },
    ]);

    setSelectedPackaging((prev) => ({
      ...prev,
      [type]: selectedMaterial,
    }));

    setCalculatedPackaging((prev) => ({
      ...prev,
      [type]: requiredQty,
    }));

    return;
  }

  // ✅ Nếu đủ, clear lỗi (nếu có)
  form.setFields([{ name: fieldName, errors: [] }]);

  setSelectedPackaging((prev) => ({
    ...prev,
    [type]: selectedMaterial,
  }));

  setCalculatedPackaging((prev) => ({
    ...prev,
    [type]: requiredQty,
  }));
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
    const allFieldsError = form.getFieldsError();
    const hasErrors = allFieldsError.some((field) => field.errors.length > 0);

    if (hasErrors) {
      message.error(
        "Vui lòng kiểm tra lại các trường bị lỗi trước khi xác nhận."
      );
      return;
    }

    // ... phần xử lý tạo request giữ nguyên

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-2 lg:p-4">
      <div className="flex justify-between items-center mb-2 lg:mb-4 w-full">
        <Button
          onClick={() => navigate(-1)}
          type="primary"
          className="flex items-center justify-center md:justify-start text-white font-semibold transition duration-300 shadow-sm px-2 md:px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded-md min-w-[20px] md:min-w-[100px]"
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
          <span className="hidden md:inline">{t("common.back")}</span>
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
          <h2 className="text-24px lg:text-3xl font-bold text-center">
            {t("productionRequest.title")}
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

          {/* Chọn Bao Bì */}
          <Form.Item label="Chọn Túi chân không" name="vacuumBagSelect">
            <Select
              placeholder="Có sản lượng thành phẩm trước"
              disabled={!isProductQuantityCalculated}
              onChange={(value) => handlePackagingSelect(value, "vacuumBag")}
            >
              {packagingMaterials
                .filter((material) => material.type === "túi chân không")
                .map((material) => (
                  <Select.Option key={material._id} value={material._id}>
                    {material.package_material_name} - {material.capacity}g
                    (Size {getSizeLabel(material.size_category)})
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item label="Chọn Thùng carton" name="cartonSelect">
            <Select
              placeholder="Có sản lượng thành phẩm trước"
              disabled={!isProductQuantityCalculated}
              onChange={(value) => handlePackagingSelect(value, "carton")}
            >
              {packagingMaterials
                .filter((material) => material.type === "thùng carton")
                .map((material) => (
                  <Select.Option key={material._id} value={material._id}>
                    {material.package_material_name} - {material.capacity}kg
                    (Size {getSizeLabel(material.size_category)})
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>

          {selectedPackaging.vacuumBag && selectedPackaging.carton && (
            <div>
              <p>
                Số lượng Túi chân không gợi ý:{" "}
                {calculatedPackaging.vacuumBag} Túi
              </p>
              <p>
                Số lượng Thùng carton gợi ý: {calculatedPackaging.carton}{" "}
                Thùng
              </p>
            </div>
          )}
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
              onChange={(date) => {
                setProductionDate(date);
                form.setFieldsValue({ production_date: date });
              }}
            />
          </Form.Item>
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
