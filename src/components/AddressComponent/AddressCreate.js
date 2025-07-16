import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const AddressCreate = () => {
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

  // 🔹 Hàm kiểm tra họ và tên
  const validateFullName = (name) => {
    if (!name.trim()) return "Tên không được để trống.";
    if (name.length < 2 || name.length > 40) return "Tên phải có từ 2 đến 40 ký tự.";
    if (/\d/.test(name)) return "Tên không được chứa số.";
    if (/[^a-zA-ZÀ-ỹ\s]/.test(name)) return "Tên không được chứa ký tự đặc biệt.";
    return "";
  };

  // 🔹 Hàm kiểm tra số điện thoại
  const validatePhone = (phone) => {
    if (!phone.trim()) return "Số điện thoại không được để trống.";
  
    // Kiểm tra nếu chứa dấu âm (-)
    if (phone.includes("-")) return "Số điện thoại không thể là số âm.";
  
    // Kiểm tra nếu chứa ký tự lạ (chỉ cho phép số)
    if (!/^\d+$/.test(phone)) return "Số điện thoại chỉ được chứa số.";
  
    // Kiểm tra độ dài (chỉ chấp nhận đúng 10 số)
    if (phone.length !== 10) {
      return "Số điện thoại phải có đúng 10 số.";
    }
  
  
    return ""; // Hợp lệ
  };
  

  // 🔹 Hàm kiểm tra địa chỉ
  const validateAddress = (address) => {
    if (!address.trim()) return "Địa chỉ không được để trống.";
    if (address.length < 5) return "Địa chỉ phải có ít nhất 5 ký tự.";
    return "";
  };

  // 🔹 Hàm kiểm tra toàn bộ dữ liệu trước khi gửi
  const validateForm = () => {
    const fullNameError = validateFullName(formData.full_name);
    const phoneError = validatePhone(formData.phone);
    const addressError = validateAddress(formData.address);

    setErrors({ full_name: fullNameError, phone: phoneError, address: addressError });

    return !fullNameError && !phoneError && !addressError;
  };

  // 🔹 Xử lý sự kiện khi nhấn nút lưu địa chỉ
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra dữ liệu trước khi gửi API
    if (!validateForm()) return;

    try {
      const token = JSON.parse(localStorage.getItem("access_token"));
      await axios.post(
        "http://localhost:3001/api/user/address/create",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Thông báo thêm thành công
      message.success("Thêm địa chỉ thành công!", { position: "top-right", autoClose: 3000 });

      // Điều hướng về trang danh sách địa chỉ
      setTimeout(() => navigate("/Address"), 1500);
    } catch (error) {
      message.error("Tạo địa chỉ thất bại!", { position: "top-right", autoClose: 3000 });
      console.error("Lỗi khi tạo địa chỉ:", error);
    }
  };

  // 🔹 Xử lý thay đổi dữ liệu và kiểm tra lỗi trực tiếp khi nhập
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
            {/* Breadcrumb */}
            <MDBRow>
              <MDBCol>
                <MDBBreadcrumb className="bg-light rounded-3 p-3 mb-4 border">
                  <MDBBreadcrumbItem>
                    <span onClick={() => navigate("/home")} className="cursor-pointer hover:border-b hover:border-black">
                      Home
                    </span>
                  </MDBBreadcrumbItem>
                  <MDBBreadcrumbItem>
                    <span onClick={() => navigate("/profile")} className="cursor-pointer hover:border-b hover:border-black">
                      User Profile
                    </span>
                  </MDBBreadcrumbItem>
                  <MDBBreadcrumbItem>
                    <span onClick={() => navigate("/Address")} className="cursor-pointer hover:border-b hover:border-black">
                      View Address
                    </span>
                  </MDBBreadcrumbItem>
                  <MDBBreadcrumbItem active>Create Address</MDBBreadcrumbItem>
                </MDBBreadcrumb>
              </MDBCol>
            </MDBRow>

            {/* Form Create Address */}
            <div className="p-6 bg-white shadow-md rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Thêm địa chỉ mới</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block font-medium text-gray-700">Họ và Tên:</label>
                  <input
                    className="border p-2 w-full rounded-md"
                    type="text"
                    placeholder="Nhập tên đầy đủ"
                    value={formData.full_name}
                    onChange={(e) => handleChange("full_name", e.target.value)}
                  />
                  {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
                </div>

                <div className="mb-4">
                  <label className="block font-medium text-gray-700">Số điện thoại:</label>
                  <input
                    className="border p-2 w-full rounded-md"
                    type="text"
                    placeholder="Nhập số điện thoại"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div className="mb-4">
                  <label className="block font-medium text-gray-700">Địa chỉ:</label>
                  <input
                    className="border p-2 w-full rounded-md"
                    type="text"
                    placeholder="Nhập địa chỉ cụ thể"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all duration-200"
                >
                  Lưu Địa Chỉ
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
