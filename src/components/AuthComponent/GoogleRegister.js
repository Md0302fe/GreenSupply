import React, { useState } from "react";
import "./Login.scss";
import { message } from "antd";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as UserServices from "../../services/UserServices";
import LanguageSwitcher from "../TranslateComponent/LanguageSwitcher";
import backgroundRegister from "../../assets/image/background_login.jpg";

const GoogleRegister = () => {
  const { t } = useTranslation();

  const location = useLocation();
  const user = location.state?.user;
  const [phone, setPhone] = useState("");
  const [birth_day, setBirthday] = useState("");
  const [role_check, setRoleCheck] = useState(true);
  const [gender, setGender] = useState("");

  // validate
  const [birthDayError, setBirthDayError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  // Xử lý kiểm tra ngày sinh khi nhập
  const handleBirthDayChange = (event) => {
    const inputDate = event.target.value;
    setBirthday(inputDate);
    if (!inputDate) {
      setBirthDayError(t("birthday_required"));
    } else if (inputDate > today) {
      setBirthDayError(t("invalid_dob"));
    } else {
      setBirthDayError(""); // Xóa lỗi nếu hợp lệ
    }
  };

  // Submit thông tin còn thiếu
  const handleSubmit = async () => {
    if (birthDayError || !phone || !birth_day) {
      message.error(t("fill_valid_information"));
      return;
    }
    try {
      // Gửi thông tin lên API để cập nhật tài khoản
      const result = await UserServices.completeProfile({
        email: user.email,
        full_name: user.full_name,
        avatar: user.avatar,
        googleId: user.googleId,
        phone,
        birth_day,
        role_check,
        gender,
      });

      if (result.status === "OK") {
        message.success(t("register_success"));
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        message.error(result.message || t("update_failed"));
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error.message);
      message.error(t("update_failed"));
    }
  };

  return (
    <div className="login-container flex-center-center h-screen relative overflow-hidden">
      {/* Lớp nền mờ */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url("${backgroundRegister}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(5px)",
          transform: "scale(1.05)", // để tránh viền bị cắt
        }}
      ></div>

      {/* Lớp overlay mờ nhẹ (tùy chọn, nếu muốn tối nền) */}
      <div className="absolute inset-0 bg-black/20 z-0"></div>

      {/* Nội dung chính */}
      <div className="Login-wapper Width items-center max-w-full w-full h-full flex z-10">
        <div className="Info-Sign-In bg-white rounded-2xl pb-4 md:ml-8 w-11/12 lg:w-6/12 mx-auto relative">
          <a
            href="/login"
            className="absolute flex gap-1 items-center top-3 left-4 text-supply-primary cursor-pointer"
          >
            <svg
              width="16px"
              height="16px"
              viewBox="0 0 1024 1024"
              className="icon"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              fill="#000000"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                <path
                  d="M768 903.232l-50.432 56.768L256 512l461.568-448 50.432 56.768L364.928 512z"
                  fill="#ff8b00"
                ></path>
              </g>
            </svg>
            <span>{t("back")}</span>
          </a>
          <div className="w-full pt-12 font-bold text-3xl text-center text-supply-primary mb-4">
            {t("complete_profile")}
          </div>

          {/* Hiển thị thông tin từ Google */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={user.avatar}
              referrerPolicy="no-referrer"
              alt="Avatar"
              className="w-24 h-24 rounded-full border-2 border-supply-primary mb-2"
            />
            <p className="text-lg font-medium">{user.full_name}</p>
            <p className="text-gray-600">{user.email}</p>
          </div>

          {/* FORM Cập Nhật */}
          <div className="content-form col-5 w-10/12 mx-auto">
            {/* Phone */}
            <div className="form-group">
              <input
                type="text"
                className={`border-[1px] shadow-[inset_1px_1px_2px_1px_#00000024] border-supply-primary text-black ${
                  phone && !/^0\d{9}$/.test(phone) ? "border-red-500" : ""
                }`}
                value={phone}
                placeholder={t("phone_placeholder")}
                onChange={(event) => {
                  const input = event.target.value;
                  if (/^\d{0,10}$/.test(input)) {
                    // Chỉ cho phép nhập tối đa 10 số
                    setPhone(input);
                  }
                }}
                required
              />
              {/* Hiển thị lỗi nếu số điện thoại không hợp lệ */}
              {phone && !/^0\d{9}$/.test(phone) && (
                <p className="text-red-500 text-sm">{t("invalid_phone")}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <p>{t("gender")}:</p>
              <div className="flex justify-between">
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    onChange={(event) => setGender(event.target.value)}
                  />
                  <span className="ml-2">{t("male")}</span>
                </label>
                <label className="ml-4">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    onChange={(event) => setGender(event.target.value)}
                  />
                  <span className="ml-2">{t("female")}</span>
                </label>
                <label className="ml-4">
                  <input
                    type="radio"
                    name="gender"
                    value="other"
                    onChange={(event) => setGender(event.target.value)}
                  />
                  <span className="ml-2">{t("other")}</span>
                </label>
              </div>
            </div>

            {/* Birthday */}
            <div className="form-group">
              <label htmlFor="birth_day">{t("birthday")}</label>
              <input
                type="date"
                className={`border-[1px] border-supply-primary text-black ${
                  birthDayError ? "border-red-500" : ""
                }`}
                id="birth_day"
                value={birth_day}
                onChange={handleBirthDayChange}
                required
              />
              {birthDayError && (
                <p className="text-red-500 text-sm">{birthDayError}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="text-center mt-6">
              <button
                className="text-center bg-supply-primary text-white px-10 py-2 rounded-full disabled:bg-supply-sec"
                onClick={handleSubmit}
              >
                {t("complete")}
              </button>
            </div>
          </div>

          <div className="flex w-full justify-end mr-6">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleRegister;
