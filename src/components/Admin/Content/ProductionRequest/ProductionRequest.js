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

import {
  ArrowLeft,
  ArrowRight,
  Package,
  ArrowRightFromLine,
  Presentation,
} from "lucide-react";

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
  const [endDateValue, setEndDateValue] = useState(null);

  const [selectedPackaging, setSelectedPackaging] = useState({
    vacuumBag: null,
    carton: null,
  });

  const [userInputPackaging, setUserInputPackaging] = useState({
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
        message.error(t("messages.packagingLoadError"));
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
            errors: [t("messages.needVacuumBagFirst")],
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
            t("messages.notEnoughPackaging", {
              type:
                type === "vacuumBag"
                  ? t("productionRequest.vacuumBag")
                  : t("productionRequest.cartonBox"),
              required: requiredQty,
              available: selectedMaterial.quantity,
            }),
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
  useEffect(() => {
    const production = form.getFieldValue("production_date");
    const end = form.getFieldValue("end_date");

    if (production && end) {
      const diff = dayjs(end).diff(dayjs(production), "day");
      if (diff <= 0) {
        form.setFieldsValue({ end_date: null });
        setEndDateValue(null); // Force cập nhật UI của DatePicker
        message.info(
          "Ngày kết thúc đã được xoá vì phải sau ngày sản xuất ít nhất 1 ngày."
        );
      }
    }
  }, [productionDate]);
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
    // Bắt buộc chọn sau ngày sản xuất ít nhất 1 ngày
    return current && current <= dayjs(productionDate).endOf("day");
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
      message.error(t("validation.checkFieldsBeforeSubmit"));
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
        vacuumBag:
          userInputPackaging.vacuumBag ?? calculatedPackaging.vacuumBag,
        carton: userInputPackaging.carton ?? calculatedPackaging.carton,
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
        message.success(t("productionRequest.messages.create_success"));

        // 2. Sau khi tạo đơn, gọi lại API để lấy dữ liệu kho mới
        const updatedFuelData = await axios.get(
          `${process.env.REACT_APP_API_URL}/fuel-management/getAll`
        );

        // 3. Cập nhật lại danh sách Nguyên liệu
        setFuelTypes(updatedFuelData.data.requests);

        // Reset form sau khi thành công
        form.resetFields();
      } else {
        message.error(t("productionRequest.messages.create_fail"));
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error(t("productionRequest.messages.create_error"));
    } finally {
      setSubmitLoading(false);
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
          onClick={() => navigate("/system/admin/production-request-list")}
          className="group inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-3.5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
        >
          {t("productionRequest.viewList") || "Production Plan List"}
          <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </div>
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
              {t("productionRequest.title")}
            </h1>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-2">
            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <Presentation className="h-4 w-4 text-white" />
              </div>
              {t("productionRequest.detail")}
            </h2>
          </div>

          {/* Form Content */}
          <div className="px-8 py-4">
            {submitLoading && (
              <div className="flex justify-center items-center mb-6 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                  <span className="text-lg font-medium text-blue-600">
                    Creating production plan...
                  </span>
                </div>
              </div>
            )}

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              className="space-y-3"
            >
              {/* Request Name */}
              <Form.Item
                label={
                  <span className="text-gray-800 font-semibold text-sm flex items-center gap-1">
                    {t("productionRequest.name")}
                  </span>
                }
                name="request_name"
                rules={[
                  { required: true, message: "Please enter request name" },
                ]}
              >
                <Input
                  placeholder={t("productionRequest.namePlaceholder")}
                  maxLength={200}
                  className="p-4 rounded-xl border-2 border-gray-200 bg-gray-50/50 text-gray-700 placeholder-gray-400 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition max-h-[50px]"
                  size="large"
                />
              </Form.Item>
              {/* Material Selection and Quantity */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Form.Item
                  label={
                    <span className="text-gray-800 font-semibold text-sm flex items-center gap-1">
                      {t("productionRequest.material")}
                    </span>
                  }
                  name="material"
                  rules={[
                    {
                      required: true,
                      message: t("productionRequest.materialRequired"),
                    },
                  ]}
                >
                  <Select
                    placeholder={t("productionRequest.selectMaterial")}
                    className="custom-select"
                    size="large"
                    onChange={(value) => {
                      const selectedFuel = fuelTypes.find(
                        (f) => f._id === value
                      );
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
                      .filter((fuel) => fuel.quantity > 0)
                      .map((fuel) => (
                        <Select.Option key={fuel._id} value={fuel._id}>
                          {fuel.fuel_type_id?.type_name} ({fuel.quantity} Kg)
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label={
                    <span className="text-gray-800 font-semibold text-sm flex items-center gap-1">
                      {t("productionRequest.materialQty")}
                    </span>
                  }
                  name="material_quantity"
                  rules={[
                    {
                      required: true,
                      message: t("productionRequest.materialQtyRequired"),
                    },
                    {
                      type: "number",
                      min: 1,
                      message: t("productionRequest.materialNumRequired"),
                    },
                  ]}
                >
                  <InputNumber
                    min={1}
                    className="w-full border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-gray-50/50"
                    placeholder={t("productionRequest.enterMaterialQty")}
                    onChange={calculateProductQuantity}
                    parser={(value) => value?.replace(/[^\d]/g, "")}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    size="large"
                  />
                </Form.Item>
                <Form.Item
                  label={
                    <span className="text-gray-800 font-semibold text-sm flex items-center gap-1">
                      {t("productionRequest.loss")}
                    </span>
                  }
                  name="loss_percentage"
                  rules={[
                    {
                      required: true,
                      message: t("productionRequest.lossRequired"),
                    },
                    {
                      type: "number",
                      min: 0,
                      max: 100,
                      message: t("productionRequest.lossMinMax"),
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    max={100}
                    className="w-full border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-gray-50/50"
                    placeholder={t("productionRequest.enterLoss")}
                    onChange={calculateProductQuantity}
                    size="large"
                  />
                </Form.Item>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Product Quantity (Calculated) */}
                <Form.Item
                  label={
                    <span className="text-gray-800 font-semibold text-sm">
                      {t("productionRequest.productQty")}
                    </span>
                  }
                  name="product_quantity"
                >
                  <InputNumber
                    disabled
                    className="w-full border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="text-gray-800 font-semibold text-sm flex items-center gap-1">
                      {t("productionRequest.vacuumBag")}
                    </span>
                  }
                  name="vacuumBagSelect"
                  rules={[
                    {
                      required: true,
                      message: t("productionRequest.selectVacuumBag"),
                    },
                  ]}
                >
                  <div className="relative">
                    <Select
                      placeholder={
                        !isProductQuantityCalculated
                          ? t("productionRequest.needProductQtyFirst")
                          : t("productionRequest.selectVacuumBag")
                      }
                      disabled={!isProductQuantityCalculated}
                      onChange={(value) =>
                        handlePackagingSelect(value, "vacuumBag")
                      }
                      className="custom-select"
                      size="large"
                    >
                      {packagingMaterials
                        .filter(
                          (material) => material.type === "túi chân không"
                        )
                        .map((material) => (
                          <Select.Option
                            key={material._id}
                            value={material._id}
                          >
                            {material.package_material_name} -{" "}
                            {material.capacity}g (Size{" "}
                            {getSizeLabel(material.size_category)})
                          </Select.Option>
                        ))}
                    </Select>
                  </div>
                </Form.Item>

                <Form.Item
                  label={
                    <span className="text-gray-800 font-semibold text-sm flex items-center gap-1">
                      {t("productionRequest.cartonBox")}
                    </span>
                  }
                  name="cartonSelect"
                  rules={[
                    {
                      required: true,
                      message: t("productionRequest.selectCartonBox"),
                    },
                  ]}
                >
                  <div className="relative">
                    <Select
                      placeholder={
                        !isProductQuantityCalculated
                          ? t("productionRequest.needProductQtyFirst")
                          : t("productionRequest.selectCartonBox")
                      }
                      disabled={!isProductQuantityCalculated}
                      onChange={(value) =>
                        handlePackagingSelect(value, "carton")
                      }
                      className="custom-select"
                      size="large"
                    >
                      {packagingMaterials
                        .filter((material) => material.type === "thùng carton")
                        .map((material) => (
                          <Select.Option
                            key={material._id}
                            value={material._id}
                          >
                            {material.package_material_name} -{" "}
                            {material.capacity}kg (Size{" "}
                            {getSizeLabel(material.size_category)})
                          </Select.Option>
                        ))}
                    </Select>
                  </div>
                </Form.Item>
              </div>

              {/* Packaging Selection */}
              <div className=""></div>

              {/* Packaging Summary */}
              {selectedPackaging.vacuumBag && selectedPackaging.carton && (
                <div className=" mt-4 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">
                    {t("productionRequest.suggestedTitle")}
                  </h4>
                  <div className="space-y-1 text-green-700">
                    <p>
                      {t("productionRequest.vacuumNeed")}{" "}
                      {calculatedPackaging.vacuumBag}{" "}
                      {t("productionRequest.units")}
                    </p>
                    <p>
                      {t("productionRequest.cartonBoxNeed")}{" "}
                      {calculatedPackaging.carton}{" "}
                      {t("productionRequest.units")}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Vacuum Bag Quantity Inputs */}
                <Form.Item
                  label={
                    <span className="text-gray-800 font-semibold text-sm flex items-center gap-1">
                      {t("productionRequest.enterVacuumBagQty")}
                    </span>
                  }
                  name="vacuumBag_quantity"
                  rules={[
                    {
                      required: true,
                      message: t("validation.vacuumBagQtyRequired"),
                    },
                    {
                      type: "number",
                      min: 1,
                      message: t("validation.mustBeGreaterThanZero"),
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const suggested = calculatedPackaging.vacuumBag;
                        const selected = selectedPackaging.vacuumBag;

                        if (value > suggested + 20) {
                          return Promise.reject(
                            t("validation.vacuumBagAboveLimit", {
                              max: suggested + 20,
                            })
                          );
                        }

                        if (selected && value > selected.quantity) {
                          return Promise.reject(
                            t("validation.vacuumBagStockExceeded", {
                              available: selected.quantity,
                            })
                          );
                        }

                        return Promise.resolve();
                      },
                    }),
                  ]}
                  validateStatus={
                    form.getFieldValue("vacuumBag_quantity") <
                    calculatedPackaging.vacuumBag
                      ? "error"
                      : undefined
                  }
                  help={
                    form.getFieldValue("vacuumBag_quantity") <
                    calculatedPackaging.vacuumBag
                      ? t(
                          "productionRequest.warnings.vacuumBagBelowRecommended",
                          {
                            suggested: calculatedPackaging.vacuumBag,
                          }
                        )
                      : null
                  }
                >
                  <InputNumber
                    min={1}
                    placeholder={
                      !calculatedPackaging.vacuumBag
                        ? t("validation.needSuggestedVacuumBagFirst")
                        : t("productionRequest.enterVacuumBagQty")
                    }
                    className="w-full rounded border-gray-300"
                    size="large"
                    disabled={!calculatedPackaging.vacuumBag}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(value) =>
                      setUserInputPackaging((prev) => ({
                        ...prev,
                        vacuumBag: value,
                      }))
                    }
                  />
                </Form.Item>

                {/* Carton Quantity Input */}
                <Form.Item
                  label={
                    <span className="text-gray-800 font-semibold text-sm flex items-center gap-1">
                      {t("productionRequest.enterCartonQty")}
                    </span>
                  }
                  name="carton_quantity"
                  rules={[
                    {
                      required: true,
                      message: t("validation.cartonQtyRequired"),
                    },
                    {
                      type: "number",
                      min: 1,
                      message: t("validation.mustBeGreaterThanZero"),
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const suggested = calculatedPackaging.carton;
                        const selected = selectedPackaging.carton;

                        if (value > suggested + 2) {
                          return Promise.reject(
                            t("validation.cartonAboveLimit", {
                              max: suggested + 2,
                            })
                          );
                        }

                        if (selected && value > selected.quantity) {
                          return Promise.reject(
                            t("validation.cartonStockExceeded", {
                              available: selected.quantity,
                            })
                          );
                        }

                        return Promise.resolve();
                      },
                    }),
                  ]}
                  validateStatus={
                    form.getFieldValue("carton_quantity") &&
                    form.getFieldValue("carton_quantity") <
                      calculatedPackaging.carton
                      ? "error"
                      : undefined
                  }
                  help={
                    form.getFieldValue("carton_quantity") &&
                    form.getFieldValue("carton_quantity") <
                      calculatedPackaging.carton
                      ? t("productionRequest.warnings.cartonBelowRecommended", {
                          suggested: calculatedPackaging.carton,
                        })
                      : null
                  }
                >
                  <InputNumber
                    min={1}
                    placeholder={
                      !calculatedPackaging.carton
                        ? t("validation.needSuggestedCartonFirst")
                        : t("productionRequest.enterCartonQty")
                    }
                    className="w-full   rounded border-gray-300"
                    size="large"
                    disabled={!calculatedPackaging.carton}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault(); // chặn ký tự khác số
                      }
                    }}
                    onChange={(value) =>
                      setUserInputPackaging((prev) => ({
                        ...prev,
                        carton: value,
                      }))
                    }
                  />
                </Form.Item>

                {/* Priority */}
                <Form.Item
                  label={
                    <span className="text-gray-800 font-semibold text-sm flex items-center gap-1">
                      {t("productionRequest.priority")}
                    </span>
                  }
                  name="priority"
                  rules={[
                    {
                      required: true,
                      message: t("productionRequest.priorityRequired"),
                    },
                  ]}
                >
                  <Select
                    placeholder={t("productionRequest.selectPriority")}
                    className="custom-select"
                    size="large"
                  >
                    <Select.Option value={3}>
                      {t("priority.high")}
                    </Select.Option>
                    <Select.Option value={2}>
                      {t("priority.medium")}
                    </Select.Option>
                    <Select.Option value={1}>{t("priority.low")}</Select.Option>
                  </Select>
                </Form.Item>
              </div>

              {/* Date Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Form.Item
                  label={
                    <span className="text-gray-800 font-semibold text-sm flex items-center gap-1">
                      {t("productionRequest.productionDate")}
                    </span>
                  }
                  name="production_date"
                  rules={[
                    {
                      required: true,
                      message: t("productionRequest.productionDateRequired"),
                    },
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    placeholder={t("productionRequest.selectProductionDate")}
                    className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-all duration-200"
                    disabledDate={disabledProductionDate}
                    onChange={(date) => {
                      const currentEndDate = form.getFieldValue("end_date");
                      if (currentEndDate) {
                        form.setFieldsValue({ end_date: null });
                        setEndDateValue(null); // cần thêm dòng này để sync UI ngay
                      }
                      setProductionDate(date);
                      form.setFieldsValue({ production_date: date });
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="text-gray-800 font-semibold text-sm flex items-center gap-1">
                      {t("productionRequest.endDate")}
                    </span>
                  }
                  name="end_date"
                  rules={[
                    {
                      required: true,
                      message: t("productionRequest.endDateRequired"),
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const start = getFieldValue("production_date");
                        if (start && value) {
                          const diff = dayjs(value).diff(dayjs(start), "day");
                          if (diff < 1) {
                            return Promise.reject(
                              new Error(
                                "Ngày kết thúc phải sau ngày sản xuất ít nhất 1 ngày"
                              )
                            );
                          }
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Form.Item noStyle dependencies={["production_date"]}>
                    {({ getFieldValue }) => (
                      <DatePicker
                        style={{ width: "100%" }}
                        value={endDateValue}
                        format="DD/MM/YYYY"
                        placeholder={
                          !getFieldValue("production_date")
                            ? t("productionRequest.productionDateFirst")
                            : t("productionRequest.selectEndDate")
                        }
                        className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-all duration-200"
                        disabled={!getFieldValue("production_date")}
                        disabledDate={disabledEndDate}
                        onChange={(date) => {
                          form.setFieldsValue({ end_date: date });
                          setEndDateValue(date); // cập nhật lại UI
                        }}
                      />
                    )}
                  </Form.Item>
                </Form.Item>
              </div>

              {/* Hidden Request Type */}
              <Form.Item
                name="request_type"
                initialValue="Đơn sản xuất"
                style={{ display: "none" }}
              >
                <Input />
              </Form.Item>

              {/* Notes */}
              <Form.Item
                label={
                  <span className="text-gray-800 font-semibold text-sm">
                    {t("productionRequest.note")}
                  </span>
                }
                name="note"
                rules={[
                  {
                    max: 200,
                    message: t("productionRequest.warnings.noteMaxLength", {
                      max: 200,
                    }),
                  },
                ]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder={t("productionRequest.enterNote")}
                  maxLength={500}
                  showCount
                  className="border-2 border-gray-200 p-4 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400 bg-gray-50/50 resize-none max-h-[100px]"
                />
              </Form.Item>

              {/* Submit Button */}
              <Form.Item className="pt-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitLoading}
                  className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  {submitLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Creating Production Plan...
                    </div>
                  ) : (
                    t("productionRequest.create")
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
                    <strong>{t("productionRequest.note_require.note")}</strong>{" "}
                    {t("productionRequest.note_require.note_parent")}{" "}
                    <span className="text-red-500 font-semibold">*</span>{" "}
                    {t("productionRequest.note_require.note_child")}
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

export default ProductionRequest;
