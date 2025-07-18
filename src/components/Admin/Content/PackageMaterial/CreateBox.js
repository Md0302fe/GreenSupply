import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, message, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
const { Option } = Select;

const CreateBox = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [boxType, setBoxType] = useState("");
  const [currentSize, setCurrentSize] = useState(null);
  const [suggestedCapacity, setSuggestedCapacity] = useState(null);
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/package-material/box-categories`
        );
        if (res.data.success) setCategories(res.data.data);
      } catch {
        message.error(t("boxMaterial.errorLoadingCategories"));
      }
    };
    fetchCategories();
  }, []);

  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const classifyBoxSize = (type, { length, width, height = 1 }) => {
    if (!length || !width) return "chưa xác định";
    if (type === "túi chân không") {
      const area = length * width;
      if (area <= 250) return "nhỏ";
      if (area <= 400) return "trung bình";
      return "lớn";
    }
    if (type === "thùng carton") {
      const volume = length * width * height;
      if (volume <= 9000) return "nhỏ";
      if (volume <= 17000) return "trung bình";
      return "lớn";
    }
    return "chưa xác định";
  };

  const validateCapacityWithSize = (type, size, capacity) => {
    const limits = {
      "túi chân không": {
        nhỏ: 200,
        "trung bình": 500,
        lớn: 1000,
      },
      "thùng carton": {
        nhỏ: 3.5,
        "trung bình": 7,
        lớn: 10,
      },
    };
    const limit = limits[type]?.[size];
    if (!limit)
      return {
        valid: false,
        message: t("boxMaterial.invalidCapacityLimit"),
      };
    if (capacity > limit) {
      return {
        valid: false,
        message: t("boxMaterial.capacityExceeded", {
          capacity,
          unit: type === "túi chân không" ? "g" : "kg",
          size: size.toUpperCase(),
          limit,
        }),
      };
    }
    return { valid: true };
  };

  const onFinish = async (values) => {
    const { length, width, height = 1, type } = values;
    const size = classifyBoxSize(type, { length, width, height });
    setCurrentSize(size);
    const capacityValidation = validateCapacityWithSize(
      type,
      size,
      values.capacity
    );
    if (!capacityValidation.valid) {
      form.setFields([
        {
          name: "capacity",
          errors: [capacityValidation.message],
        },
      ]);
      return;
    } else {
      form.setFields([{ name: "capacity", errors: [] }]);
    }

    try {
      setLoading(true);
      let package_img = "";
      if (values.package_img?.length > 0) {
        package_img = await getBase64(values.package_img[0].originFileObj);
      }

      const payload = {
        package_material_name: values.package_material_name,
        quantity: Number(values.quantity),
        package_material_categories: values.package_material_categories,
        package_img,
        type,
        capacity: values.capacity,
        dimensions: {
          length: Number(length),
          width: Number(width),
          height: type === "thùng carton" ? Number(height) : 1,
        },
      };
      console.log("Payload gửi lên:", payload);
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/package-material/boxes`,
        payload,
        { headers: { Authorization: `Bearer ${user.access_token}` } }
      );

      if (res.data.success) {
        message.success(t("boxMaterial.createSuccess"));
        navigate("/system/admin/box-list", {
          state: { categoryId: values.package_material_categories },
        });
      } else {
        message.error(t("boxMaterial.createFailed"));
      }
    } catch {
      message.error(t("boxMaterial.serverError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row gap-6 bg-gray-100 p-4">
      <div className="w-full lg:w-2/3 bg-white rounded-lg shadow p-4">
        <div className="mb-4">
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
            {t("boxMaterial.back")}
          </button>
        </div>
        <h2 className="text-2xl font-bold mb-6 text-center">
          {t("boxMaterial.title")}
        </h2>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onValuesChange={() => {
            const {
              type,
              length,
              width,
              height = 1,
              capacity,
            } = form.getFieldsValue();
            if (!type || !length || !width) return;

            const size = classifyBoxSize(type, { length, width, height });
            setCurrentSize(size);

            const suggest = {
              "túi chân không": {
                nhỏ: 100,
                "trung bình": 300,
                lớn: 700,
              },
              "thùng carton": {
                nhỏ: 3,
                "trung bình": 5,
                lớn: 8,
              },
            };

            setSuggestedCapacity(suggest[type]?.[size] || null);

            if (capacity !== undefined && capacity !== null) {
              const capValid = validateCapacityWithSize(type, size, capacity);
              if (!capValid.valid) {
                form.setFields([
                  { name: "capacity", errors: [capValid.message] },
                ]);
              } else {
                form.setFields([{ name: "capacity", errors: [] }]);
              }
            }
          }}
        >
          <Form.Item
            label={t("boxMaterial.packageMaterialName")}
            name="package_material_name"
            rules={[{ required: true, message: t("boxMaterial.enterName") }]}
          >
            <Input
              size="large"
              placeholder={t("boxMaterial.namePlaceholder")}
            />
          </Form.Item>

          <Form.Item
            label={t("boxMaterial.type")}
            name="type"
            rules={[{ required: true, message: t("boxMaterial.selectType") }]}
          >
            <Select
              size="large"
              onChange={(value) => setBoxType(value)}
              placeholder={t("boxMaterial.typePlaceholder")}
            >
              <Option value="túi chân không">
                {t("boxMaterial.vacuumBagLabel")}
              </Option>
              <Option value="thùng carton">
                {t("boxMaterial.cartonBoxLabel")}
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={t("boxMaterial.selectCategory")}
            name="package_material_categories"
            rules={[
              { required: true, message: t("boxMaterial.selectCategory") },
            ]}
          >
            <Select
              size="large"
              showSearch
              optionFilterProp="children"
              placeholder={t("boxMaterial.categoryPlaceholder")}
            >
              {categories.map((cat) => (
                <Option key={cat._id} value={cat._id}>
                  {cat.categories_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label={t("boxMaterial.quantity")}
            name="quantity"
            rules={[
              {
                required: true,
                message: t("boxMaterial.enterQuantity"),
              },
              {
                validator: (_, value) => {
                  if (value === undefined || value === "") {
                    return Promise.resolve();
                  }
                  if (/^\d+$/.test(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(t("boxMaterial.onlyNumber"));
                },
              },
            ]}
          >
            <Input
              size="large"
              inputMode="numeric"
              maxLength={6}
              type="text"
              onChange={(e) => {
                const value = e.target.value;

                //  Chỉ set lại nếu là số nguyên dương hoặc chuỗi rỗng
                if (/^\d*$/.test(value)) {
                  form.setFieldsValue({ quantity: value });

                  //  Xóa lỗi thủ công nếu người dùng vừa sửa lại hợp lệ
                  form.validateFields(["quantity"]).catch(() => {});
                }
              }}
              placeholder={t("boxMaterial.quantityPlaceholder")}
            />
          </Form.Item>

          <div className="flex gap-4">
            <Form.Item
              label={t("boxMaterial.length")}
              name="length"
              className="flex-1"
              rules={[
                { required: true, message: t("boxMaterial.enterLength") },
              ]}
            >
              <Input
                type="number"
                min={0}
                size="large"
                placeholder={t("boxMaterial.lengthPlaceholder")}
              />
            </Form.Item>

            <Form.Item
              label={t("boxMaterial.width")}
              name="width"
              className="flex-1"
              rules={[{ required: true, message: t("boxMaterial.enterWidth") }]}
            >
              <Input
                type="number"
                min={0}
                size="large"
                placeholder={t("boxMaterial.widthPlaceholder")}
              />
            </Form.Item>

           <Form.Item
  label={t("boxMaterial.height")}
  name="height"
  className="flex-1"
  rules={
    boxType === "thùng carton"
      ? [{ required: true, message: t("boxMaterial.enterHeight") }]
      : []
  }
>
  <Input
    type="number"
    min={0}
    size="large"
    disabled={boxType !== "thùng carton"}
    placeholder={
      boxType === "thùng carton"
        ? t("boxMaterial.heightPlaceholder1")  
        : t("boxMaterial.heightPlaceholder")   
    }
  />
</Form.Item>

          </div>

          {currentSize && (
            <div className="text-sm mb-2 text-gray-600">
              {t("boxMaterial.systemClassification")}{" "}
              <strong>
                {t("boxMaterial.size")}{" "}
                {currentSize === "nhỏ"
                  ? "S"
                  : currentSize === "trung bình"
                  ? "M"
                  : "L"}
              </strong>
            </div>
          )}

          <Form.Item
            label={t("boxMaterial.capacity")}
            name="capacity"
            rules={[
              { required: true, message: t("boxMaterial.enterCapacity") },
            ]}
          >
            <Input
              type="number"
              min={0}
              size="large"
              placeholder={t("boxMaterial.capacityPlaceholder")}
            />
          </Form.Item>

          {currentSize && suggestedCapacity !== null && (
            <div className="text-xs text-gray-500 mb-2">
              {t("boxMaterial.suggestedCapacity", {
                size:
                  currentSize === "nhỏ"
                    ? "S"
                    : currentSize === "trung bình"
                    ? "M"
                    : "L",
                capacity: suggestedCapacity,
                unit: boxType === "túi chân không" ? "g" : "kg",
              })}
            </div>
          )}

          <Form.Item
            label={t("boxMaterial.image")}
            name="package_img"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
            rules={[{ required: true, message: t("boxMaterial.selectImage") }]}
          >
            <Upload
              listType="picture"
              beforeUpload={() => false}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>
                {t("boxMaterial.selectImageButton")}
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full"
              size="large"
            >
              {t("boxMaterial.create")}
            </Button>
          </Form.Item>
        </Form>
      </div>

      {/* BẢNG THAM KHẢO SIZE */}
      <div className="w-full lg:w-1/3 bg-white rounded-lg shadow p-4 max-h-[520px] overflow-auto">
        <h3 className="text-lg font-semibold mb-3 text-blue-600">
          {t("boxMaterial.sizeReferenceTable")}
        </h3>

        {/* Túi chân không */}
        <p className="font-medium text-gray-700 mb-1">
          {t("boxMaterial.vacuumBag")}
        </p>
        <table className="w-full text-sm border border-gray-300 mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1 text-center">
                {" "}
                {t("boxMaterial.size")}
              </th>
              <th className="border px-2 py-1 text-center">
                {t("boxMaterial.dimensions")}
              </th>
              <th className="border px-2 py-1 text-center">
                {t("boxMaterial.suggestedCapacityColumn")}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-2 py-1 text-center">S</td>
              <td className="border px-2 py-1 text-center">12 × 19</td>
              <td className="border px-2 py-1 text-center">~100g</td>
            </tr>
            <tr>
              <td className="border px-2 py-1 text-center">M</td>
              <td className="border px-2 py-1 text-center">15 × 25</td>
              <td className="border px-2 py-1 text-center">~250–500g</td>
            </tr>
            <tr>
              <td className="border px-2 py-1 text-center">L</td>
              <td className="border px-2 py-1 text-center">≥ 20 × 30</td>
              <td className="border px-2 py-1 text-center">~700g – 1kg</td>
            </tr>
          </tbody>
        </table>

        {/* Thùng carton */}
        <p className="font-medium text-gray-700 mb-1">
          {t("boxMaterial.cartonBox")}
        </p>
        <table className="w-full text-sm border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1 text-center">
                {" "}
                {t("boxMaterial.size")}
              </th>
              <th className="border px-2 py-1 text-center">
                {t("boxMaterial.dimensions")}
              </th>
              <th className="border px-2 py-1 text-center">
                {t("boxMaterial.suggestedCapacityColumn")}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-2 py-1 text-center">S</td>
              <td className="border px-2 py-1 text-center">36 × 26 × 9</td>
              <td className="border px-2 py-1 text-center">~3.5kg</td>
            </tr>
            <tr>
              <td className="border px-2 py-1 text-center">M</td>
              <td className="border px-2 py-1 text-center">38 × 23 × 19</td>
              <td className="border px-2 py-1 text-center">~5kg</td>
            </tr>
            <tr>
              <td className="border px-2 py-1 text-center">L</td>
              <td className="border px-2 py-1 text-center">49 × 32 × 12</td>
              <td className="border px-2 py-1 text-center">~8–10kg</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CreateBox;
