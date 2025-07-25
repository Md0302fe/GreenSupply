import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { message } from "antd";
import "react-toastify/dist/ReactToastify.css";
import {
  MDBBreadcrumb,
  MDBBreadcrumbItem,
  MDBContainer,
  MDBRow,
  MDBCol,
} from "mdb-react-ui-kit";
import { useTranslation } from "react-i18next";

const AddressUpdate = () => {
  const { t } = useTranslation();
  const { id } = useParams();
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

  const validateFullName = (name) => {
    if (!name.trim()) return t("validation.fullNameRequired");
    if (name.length < 2 || name.length > 40)
      return t("validation.fullNameLength");
    if (/\d/.test(name)) return t("validation.fullNameNoNumber");
    if (/[^a-zA-ZÀ-ỹ\s]/.test(name))
      return t("validation.fullNameNoSpecialChar");
    return "";
  };

  const validatePhone = (phone) => {
    if (!phone.trim()) return t("validation.phoneRequired");
    if (phone.includes("-")) return t("validation.phoneNegative");
    if (!/^\d+$/.test(phone)) return t("validation.phoneDigitsOnly");
    if (phone.length !== 10) return t("validation.phoneLength");
    return "";
  };

  const validateAddress = (address) => {
    if (!address.trim()) return t("validation.addressRequired");
    if (address.length < 5) return t("validation.addressTooShort");
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

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("access_token"));
        const response = await axios.get(
          `http://localhost:3001/api/user/address/detail/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.status === "OK") {
          setFormData(response.data.data);
        } else {
          message.error(response.data.message || t("message.fetchFailed"));
        }
      } catch (error) {
        message.error(t("message.fetchError"));
      }
    };

    fetchAddress();
  }, [id, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const token = JSON.parse(localStorage.getItem("access_token"));
      await axios.put(
        `http://localhost:3001/api/user/address/update/${id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success(t("message.updateSuccess"));
      setTimeout(() => navigate("/Address"), 2000);
    } catch (error) {
      message.error(t("message.updateError"));
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
                      {t("breadcrumb.home")}
                    </span>
                  </MDBBreadcrumbItem>
                  <MDBBreadcrumbItem>
                    <span
                      onClick={() => navigate("/profile")}
                      className="cursor-pointer hover:border-b hover:border-black"
                    >
                      {t("breadcrumb.profile")}
                    </span>
                  </MDBBreadcrumbItem>
                  <MDBBreadcrumbItem>
                    <span
                      onClick={() => navigate("/Address")}
                      className="cursor-pointer hover:border-b hover:border-black"
                    >
                      {t("breadcrumb.viewAddress")}
                    </span>
                  </MDBBreadcrumbItem>
                  <MDBBreadcrumbItem active>
                    {t("breadcrumb.updateAddress")}
                  </MDBBreadcrumbItem>
                </MDBBreadcrumb>
              </MDBCol>
            </MDBRow>

            <div className="p-6 bg-white shadow-md rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">
                {t("addressUpdate.title")}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block font-medium text-gray-700">
                    {t("form.fullName")}
                  </label>
                  <input
                    className="border p-2 w-full rounded-md"
                    type="text"
                    placeholder={t("placeholder.fullName")}
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
                    {t("form.phone")}
                  </label>
                  <input
                    className="border p-2 w-full rounded-md"
                    type="text"
                    placeholder={t("placeholder.phone")}
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block font-medium text-gray-700">
                    {t("form.address")}
                  </label>
                  <input
                    className="border p-2 w-full rounded-md"
                    type="text"
                    placeholder={t("placeholder.address")}
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all duration-200">
                  {t("button.update")}
                </button>
              </form>
            </div>
          </MDBContainer>
        </div>
      </div>
    </div>
  );
};

export default AddressUpdate;
