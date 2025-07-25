import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { message } from "antd";
import { useTranslation } from "react-i18next";
import {
  MDBBreadcrumb,
  MDBBreadcrumbItem,
  MDBContainer,
  MDBRow,
  MDBCol,
} from "mdb-react-ui-kit";

const AddressCreate = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
  });

  const [errors, setErrors] = useState({
    full_name: "",
    phone: "",
    address: "",
  });

  const navigate = useNavigate();

  // Validate full name
  const validateFullName = (name) => {
    if (!name.trim()) return t("addressCreate.validation.fullNameRequired");
    if (name.length < 2 || name.length > 40)
      return t("addressCreate.validation.fullNameLength");
    if (/\d/.test(name)) return t("addressCreate.validation.fullNameNoNumber");
    if (/[^a-zA-ZÀ-ỹ\s]/.test(name))
      return t("addressCreate.validation.fullNameSpecialChar");
    return "";
  };

  // Validate phone
  const validatePhone = (phone) => {
    if (!phone.trim()) return t("addressCreate.validation.phoneRequired");
    if (phone.includes("-")) return t("addressCreate.validation.phoneNegative");
    if (!/^\d+$/.test(phone))
      return t("addressCreate.validation.phoneOnlyDigits");
    if (phone.length !== 10) return t("addressCreate.validation.phoneLength");
    return "";
  };

  // Validate address
  const validateAddress = (address) => {
    if (!address.trim()) return t("addressCreate.validation.addressRequired");
    if (address.length < 5) return t("addressCreate.validation.addressLength");
    return "";
  };

  const validateForm = () => {
    const fullNameError = validateFullName(formData.full_name);
    const phoneError = validatePhone(formData.phone);
    const addressError = validateAddress(formData.address);

    setErrors({
      full_name: fullNameError,
      phone: phoneError,
      address: addressError,
    });

    return !fullNameError && !phoneError && !addressError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const token = JSON.parse(localStorage.getItem("access_token"));
      await axios.post(
        "http://localhost:3001/api/user/address/create",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success(t("addressCreate.success"), {
        position: "top-right",
        autoClose: 3000,
      });
      setTimeout(() => navigate("/Address"), 1500);
    } catch (error) {
      message.error(t("addressCreate.error"), {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });

    let error = "";
    if (field === "full_name") error = validateFullName(value);
    if (field === "phone") error = validatePhone(value);
    if (field === "address") error = validateAddress(value);

    setErrors({ ...errors, [field]: error });
  };

  return (
    <div className="User-Address Container flex-center-center mb-4 mt-4">
      <div className="Wrapper Width">
        <div className="bg-white shadow-lg rounded-lg p-6 border">
          <MDBContainer>
            <MDBRow>
              <MDBCol>
                <MDBBreadcrumb className="bg-light rounded-3 p-3 mb-4 border">
                  <MDBBreadcrumbItem>
                    <span
                      onClick={() => navigate("/home")}
                      className="cursor-pointer hover:border-b hover:border-black"
                    >
                      {t("addressCreate.breadcrumb.home")}
                    </span>
                  </MDBBreadcrumbItem>
                  <MDBBreadcrumbItem>
                    <span
                      onClick={() => navigate("/profile")}
                      className="cursor-pointer hover:border-b hover:border-black"
                    >
                      {t("addressCreate.breadcrumb.profile")}
                    </span>
                  </MDBBreadcrumbItem>
                  <MDBBreadcrumbItem>
                    <span
                      onClick={() => navigate("/Address")}
                      className="cursor-pointer hover:border-b hover:border-black"
                    >
                      {t("addressCreate.breadcrumb.viewAddress")}
                    </span>
                  </MDBBreadcrumbItem>
                  <MDBBreadcrumbItem active>
                    {t("addressCreate.breadcrumb.createAddress")}
                  </MDBBreadcrumbItem>
                </MDBBreadcrumb>
              </MDBCol>
            </MDBRow>

            <div className="p-6 bg-white shadow-md rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">
                {t("addressCreate.title")}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block font-medium text-gray-700">
                    {t("addressCreate.fullName")}
                  </label>
                  <input
                    className="border p-2 w-full rounded-md"
                    type="text"
                    placeholder={t("addressCreate.fullNamePlaceholder")}
                    value={formData.full_name}
                    onChange={(e) => handleChange("full_name", e.target.value)}
                  />
                  {errors.full_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.full_name}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block font-medium text-gray-700">
                    {t("addressCreate.phone")}
                  </label>
                  <input
                    className="border p-2 w-full rounded-md"
                    type="text"
                    placeholder={t("addressCreate.phonePlaceholder")}
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block font-medium text-gray-700">
                    {t("addressCreate.address")}
                  </label>
                  <input
                    className="border p-2 w-full rounded-md"
                    type="text"
                    placeholder={t("addressCreate.addressPlaceholder")}
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all duration-200"
                >
                  {t("addressCreate.submitButton")}
                </button>
              </form>
            </div>
          </MDBContainer>
        </div>
      </div>
    </div>
  );
};

export default AddressCreate;
