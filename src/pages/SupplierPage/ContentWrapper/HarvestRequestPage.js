import React, { useState, useEffect } from "react";

import axios from "axios";
import { message } from "antd";
import { useSelector } from "react-redux";
import { AiFillEdit } from "react-icons/ai";
import { FiRefreshCw } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { getUserAddresses } from "../../../services/UserService";
import { createHarvestRequest } from "../../../services/HarvestRequestService";

const HarvestRequestPage = () => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    fuel_name: "",
    quantity: "",
    price: "",
    address: "",
    note: "",
    fuel_type: "",
  });
  const userRedux = useSelector((state) => state.user);
  const [errors, setErrors] = useState({}); // Lưu thông báo lỗi
  const [fadeOut, setFadeOut] = useState(false);
  const token = userRedux?.access_token || localStorage.getItem("access_token");
  const [fuelTypeList, setFuelTypeList] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  // Tính tổng giá
  const totalPrice = () => {
    const q = Number(formData.quantity);
    const p = Number(formData.price);

    // Nếu vượt ngưỡng cho phép thì trả về 0
    if (isNaN(q) || isNaN(p) || q > 1000000 || p > 9999999) {
      return 0;
    }

    return q * p;
  };

  // Xử lý input
  const handleChange = (e) => {
    const { name, value } = e.target;
    let newErrors = { ...errors };

    if (name === "fuel_name") {
      const trimmedValue = value.trim();

      if (trimmedValue.length < 5) {
        newErrors.fuel_name = t("harvestRequest.request_name_min_length");
      } else if (trimmedValue.length > 100) {
        newErrors.fuel_name = t("harvestRequest.request_name_max_length");
      } else {
        delete newErrors.fuel_name;
      }

      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors(newErrors);
      return;
    }

    if (name === "fuel_type") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      return;
    }

    if (name === "quantity") {
      const quantityValue = Number(value);

      if (!value.trim()) {
        newErrors.quantity = t("harvestRequest.empty_quantity");
      } else if (isNaN(quantityValue) || !isFinite(quantityValue)) {
        newErrors.quantity = t("harvestRequest.invalid_quantity");
      } else if (quantityValue > 1000000) {
        newErrors.quantity = t("harvestRequest.invalid_quantity");
      } else {
        delete newErrors.quantity;
      }
    }

    if (name === "price") {
      const priceValue = Number(value);

      if (!value.trim()) {
        newErrors.price = t("harvestRequest.empty_price");
      } else if (isNaN(priceValue) || !isFinite(priceValue)) {
        newErrors.price = t("harvestRequest.invalid_price");
      } else if (priceValue > 9999999) {
        newErrors.price = t("harvestRequest.invalid_price");
      } else {
        delete newErrors.price;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors(newErrors);
  };

  const fetchUserAddresses = async () => {
    try {
      const res = await getUserAddresses(userRedux.id);
      setAddresses(res.addresses || []);
      if (res.addresses.length > 0) {
        setSelectedAddressId(res.addresses[0]._id);
        setFormData((prev) => ({ ...prev, address: res.addresses[0].address }));
      }
    } catch (error) {
      console.error("Lỗi lấy địa chỉ người dùng:", error);
    }
  };

  useEffect(() => {
    if (selectedAddressId) {
      const addrObj = addresses.find((a) => a._id === selectedAddressId);
      if (addrObj) {
        setFormData((prev) => ({
          ...prev,
          address: addrObj.address,
        }));
      }
    }
  }, [selectedAddressId, addresses]);

  const fetchListFuelType = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/fuel/getAll`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const transformedFuels = response.data.requests.map((item) => ({
        _id: item._id,
        type_name: item.fuel_type_id?.type_name || "Không có dữ liệu",
        description: item.fuel_type_id?.description || "Không có mô tả",
        is_deleted: item.is_deleted,
        quantity: item.quantity,
        storage_id: item.storage_id,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));
      setFuelTypeList(transformedFuels || []); // Cập nhật danh sách fuel type
    } catch (error) {
      console.error("Lỗi khi lấy danh sách loại nguyên liệu:", error);
    }
  };

  useEffect(() => {
    fetchListFuelType();
    fetchUserAddresses();
  }, []);
  // Tự động ẩn lỗi sau 5 giây
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setFadeOut(false);
      const fadeTimer = setTimeout(() => setFadeOut(true), 2500); // Sau 2.5s bắt đầu mờ dần
      const removeTimer = setTimeout(() => setErrors({}), 5000); // Sau 3s xoá lỗi

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [errors]);

  // Gửi form
  const handleSubmit = async () => {
    let newErrors = {};

    const quantityValue = Number(formData.quantity);
    const priceValue = Number(formData.price);
    const trimmedFuelName = formData.fuel_name.trim();

    if (!trimmedFuelName) {
      newErrors.fuel_name = t("harvestRequest.empty_request_name");
    } else if (trimmedFuelName.length < 5) {
      newErrors.fuel_name = t("harvestRequest.request_name_min_length");
    } else if (trimmedFuelName.length > 100) {
      newErrors.fuel_name = t("harvestRequest.request_name_max_length");
    }

    if (!formData.fuel_type.trim()) {
      newErrors.fuel_type = t("harvestRequest.empty_material_type");
    }

    if (!formData.quantity.trim()) {
      newErrors.quantity = t("harvestRequest.empty_quantity");
    } else if (
      isNaN(quantityValue) ||
      quantityValue > 1000000 ||
      !isFinite(quantityValue)
    ) {
      newErrors.quantity = t("harvestRequest.invalid_quantity");
    }

    if (!formData.price.trim()) {
      newErrors.price = t("harvestRequest.empty_price");
    } else if (
      isNaN(priceValue) ||
      priceValue > 9999999 ||
      !isFinite(priceValue)
    ) {
      newErrors.price = t("harvestRequest.invalid_price");
    }

    if (!formData.address.trim()) {
      newErrors.address = t("harvestRequest.empty_address");
    }

    // Nếu có lỗi thì không submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Thêm tiền tố nếu chưa có
    let fuelNameWithPrefix = trimmedFuelName;
    if (!fuelNameWithPrefix.startsWith("Yêu cầu thu hàng")) {
      fuelNameWithPrefix = `Yêu cầu thu hàng ${fuelNameWithPrefix}`;
    }

    const fuelRequest = {
      supplier_id: userRedux.id,
      fuel_name: fuelNameWithPrefix,
      quantity: quantityValue,
      price: priceValue,
      total_price: quantityValue * priceValue,
      address: formData.address,
      note: formData.note,
      status: "Chờ duyệt",
      fuel_type: formData.fuel_type,
    };

    try {
      await createHarvestRequest(fuelRequest);
      message.success(t("harvestRequest.create_success"));

      // Reset form
      const defaultAddress = addresses[0] || {};
      setFormData({
        fuel_name: "",
        quantity: "",
        price: "",
        address: defaultAddress.address || "",
        note: "",
        fuel_type: "",
      });
      setSelectedAddressId(defaultAddress._id || "");
      setErrors({});
    } catch (error) {
      console.error("Lỗi khi tạo yêu cầu:", error);
      message.error(t("harvestRequest.create_fail"));
    }
  };

  return (
    <div className="px-2">
      {/* Form Tạo Yêu Cầu Thu Hàng */}
      <div className="w-full border border-gray-200 p-6 rounded-md bg-white shadow">
        <h2 className="text-xl font-[800] mb-4 text-black flex items-center gap-3">
          <AiFillEdit />
          {t("harvestRequest.create_request_title")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* fuel_name */}
          <div>
            <label className="block mb-1 font-semibold">
              {t("harvestRequest.request_name")}
            </label>
            <input
              type="text"
              name="fuel_name"
              placeholder={t("harvestRequest.request_name_placeholder")}
              value={formData.fuel_name}
              onChange={handleChange}
              onFocus={() => {
                // Nếu chưa có tiền tố thì tự thêm
                if (!formData.fuel_name.startsWith("Yêu cầu thu hàng")) {
                  setFormData((prev) => ({
                    ...prev,
                    fuel_name: "Yêu cầu thu hàng ",
                  }));
                }
              }}
              onBlur={() => {
                // Nếu người dùng không nhập gì thêm -> chỉ có prefix
                if (formData.fuel_name.trim() === "Yêu cầu thu hàng") {
                  setFormData((prev) => ({
                    ...prev,
                    fuel_name: "",
                  }));
                }
              }}
              className="border p-2 rounded w-full mb-2"
            />
            {errors.fuel_name && (
              <p className="text-red-500 text-sm">{errors.fuel_name}</p>
            )}
          </div>

          {/* fuel_type */}
          <div>
            <label className="block mb-1 font-semibold">
              {t("harvestRequest.material_type")}
            </label>
            <select
              name="fuel_type"
              value={formData.fuel_type}
              onChange={handleChange}
              className="border p-2 rounded w-full mb-2"
            >
              <option value="">
                {t("harvestRequest.material_type_placeholder")}
              </option>
              {fuelTypeList.map((fuel) => (
                <option key={fuel._id} value={fuel._id}>
                  {fuel.type_name}
                </option>
              ))}
            </select>
            {errors.fuel_type && (
              <p className="text-red-500 text-sm">{errors.fuel_type}</p>
            )}
          </div>

          {/* quantity */}
          <div>
            <label className="block mb-1 font-semibold">
              {t("harvestRequest.quantity")}
            </label>
            <input
              type="number"
              name="quantity"
              min="1"
              max="1000000"
              placeholder={t("harvestRequest.quantity_placeholder")}
              value={formData.quantity}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-", "."].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              className="border p-2 rounded w-full mb-2"
            />
            {errors.quantity && (
              <p className="text-red-500 text-sm">{errors.quantity}</p>
            )}
          </div>

          {/* price */}
          <div>
            <label className="block mb-1 font-semibold">
              {t("harvestRequest.price")}
            </label>
            <input
              type="number"
              name="price"
              min="1"
              max="9999999"
              placeholder={t("harvestRequest.price")}
              value={formData.price}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (["e", "E", "-", "+", "."].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              className="border p-2 rounded w-full mb-2"
            />
            {errors.price && (
              <p className="text-red-500 text-sm">{errors.price}</p>
            )}
          </div>

          {/* address */}
          <div>
            <label className="block mb-1 font-semibold">
              {t("harvestRequest.pickup_address")}
            </label>
            {addresses.length === 0 ? (
              <input
                type="text"
                name="address"
                placeholder={t("harvestRequest.enter_pickup_address")}
                value={formData.address}
                onChange={handleChange}
                className="border p-2 rounded w-full mb-2"
              />
            ) : (
              <select
                name="address"
                value={selectedAddressId}
                onChange={(e) => {
                  const addrId = e.target.value;
                  setSelectedAddressId(addrId);
                  const addrObj = addresses.find((a) => a._id === addrId);
                  setFormData((prev) => ({
                    ...prev,
                    address: addrObj ? addrObj.address : "",
                  }));
                  // Xoá lỗi nếu có
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.address;
                    return newErrors;
                  });
                }}
                className="border p-2 rounded w-full mb-2"
              >
                {addresses.length === 0 && (
                  <option value="">{t("harvestRequest.no_address")}</option>
                )}
                {addresses.map((addr) => (
                  <option key={addr._id} value={addr._id}>
                    {addr.address}
                  </option>
                ))}
              </select>
            )}
            {errors.address && (
              <p className="text-red-500 text-sm">{errors.address}</p>
            )}
          </div>
        </div>

        {/* Hiển thị total_price */}
        <div className="mt-4 mb-4">
          <p>
            <span className="font-semibold mr-2">
              {t("harvestRequest.total_price_label")}
            </span>
            {totalPrice().toLocaleString("vi-VN")} VNĐ
          </p>
        </div>

        {/* note */}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">
            {t("harvestRequest.note")}
          </label>
          <textarea
            name="note"
            maxLength="200"
            placeholder={t("harvestRequest.note_placeholder")}
            value={formData.note}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Nút bấm */}
        <div className="flex flex-col md:flex-row md:justify-between gap-4 mt-4">
          <button
            onClick={() => {
              const defaultAddress = addresses[0] || {};
              setFormData({
                fuel_name: "",
                quantity: "",
                price: "",
                address: defaultAddress.address || "",
                note: "",
                fuel_type: "",
              });
              setSelectedAddressId(defaultAddress._id || "");
            }}
            className="bg-[#FFE814] flex items-center text-[#F14A00] font-bold px-3 py-2 rounded  hover:bg-[#FBC02D] w-full md:w-auto gap-2"
          >
            <FiRefreshCw />
            {t("harvestRequest.reset_button")}
          </button>

          <button
            onClick={handleSubmit}
            className="bg-[#006838] text-white font-bold px-4 py-2 rounded hover:bg-[#028A48] w-full md:w-auto"
          >
            {t("harvestRequest.submit_button")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HarvestRequestPage;
