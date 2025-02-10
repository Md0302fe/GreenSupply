import React, { useState } from "react";
import "./Login.scss";
import backgroundRegister from "../../assets/image/background_login.png";
import { toast } from "react-toastify";
import * as UserServices from "../../services/UserServices";
import { useLocation } from "react-router-dom";

const GoogleRegister = () => {
  const location = useLocation();
  const user = location.state?.user;
  const [phone, setPhone] = useState("");
  const [birth_day, setBirthday] = useState("");
  const [role_check, setRoleCheck] = useState(false);
  const [gender, setGender] = useState("");

  // validate
  const [birthDayError, setBirthDayError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  // Xử lý kiểm tra ngày sinh khi nhập
  const handleBirthDayChange = (event) => {
    const inputDate = event.target.value;
    setBirthday(inputDate);
    if (!inputDate) {
      setBirthDayError("Vui lòng chọn ngày sinh.");
    } else if (inputDate > today) {
      setBirthDayError("Ngày sinh không thể lớn hơn ngày hiện tại.");
    } else {
      setBirthDayError(""); // Xóa lỗi nếu hợp lệ
    }
  };

  // Submit thông tin còn thiếu
  const handleSubmit = async () => {
    if (birthDayError || !phone || !birth_day) {
      toast.error("Vui lòng nhập đúng thông tin trước khi tiếp tục.");
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
        toast.success("Thông tin đã được cập nhật!");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        toast.error(result.message || "Không thể cập nhật thông tin.");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error.message);
      toast.error("Không thể cập nhật thông tin. Vui lòng thử lại.");
    }
  };


  return (
    <div
      className={`login-container flex-center-center h-screen`}
    >
      <div
        className="Login-wapper Width items-center bg-cover max-w-full w-full h-full flex"
        style={{ backgroundImage: `url("${backgroundRegister}")` }}
      >
        <div className="Info-Sign-In bg-white rounded-2xl pb-4 md:ml-8 w-11/12 lg:w-6/12 mx-auto relative">
          <a href="/login" className="absolute flex gap-1 items-center top-3 left-4 text-supply-primary cursor-pointer">
            <svg width="16px" height="16px" viewBox="0 0 1024 1024" className="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M768 903.232l-50.432 56.768L256 512l461.568-448 50.432 56.768L364.928 512z" fill="#ff8b00"></path></g></svg>
            <span>Quay lại</span>
          </a>
          <div className="w-full pt-12 font-bold text-3xl text-center text-supply-primary mb-4">
            Cập Nhật Thông Tin
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
                className={`border-[1px] shadow-[inset_1px_1px_2px_1px_#00000024] border-supply-primary text-black ${phone && !/^0\d{9}$/.test(phone) ? "border-red-500" : ""
                  }`}
                value={phone}
                placeholder="Số điện thoại"
                onChange={(event) => {
                  const input = event.target.value;
                  if (/^\d{0,10}$/.test(input)) { // Chỉ cho phép nhập tối đa 10 số
                    setPhone(input);
                  }
                }}
                required
              />
              {/* Hiển thị lỗi nếu số điện thoại không hợp lệ */}
              {phone && !/^0\d{9}$/.test(phone) && (
                <p className="text-red-500 text-sm">Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số.</p>
              )}
            </div>


            {/* Gender */}
            <div>
              <p>Giới tính:</p>
              <div className="flex justify-between">
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    onChange={(event) => setGender(event.target.value)}
                  />
                  <span className="ml-2">Nam</span>
                </label>
                <label className="ml-4">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    onChange={(event) => setGender(event.target.value)}
                  />
                  <span className="ml-2">Nữ</span>
                </label>
                <label className="ml-4">
                  <input
                    type="radio"
                    name="gender"
                    value="other"
                    onChange={(event) => setGender(event.target.value)}
                  />
                  <span className="ml-2">Khác</span>
                </label>
              </div>
            </div>

            {/* Birthday */}
            <div className="form-group">
              <label htmlFor="birth_day">Ngày sinh</label>
              <input
                type="date"
                className={`border-[1px] border-supply-primary text-black ${birthDayError ? "border-red-500" : ""
                  }`}
                id="birth_day"
                value={birth_day}
                onChange={handleBirthDayChange}
                required
              />
              {birthDayError && <p className="text-red-500 text-sm">{birthDayError}</p>}
            </div>

            {/* Is supplier */}
            <div>
              <input
                type={"checkbox"}
                className="mr-2"
                id="roleCheck"
                checked={role_check}
                onChange={(event) => setRoleCheck(event.target.checked)}
              />
              <label htmlFor="roleCheck">Nhấn vào đây nếu bạn là nhà cung ứng</label>
            </div>

            {/* Submit Button */}
            <div className="text-center mt-6">
              <button
                className="text-center bg-supply-primary text-white px-10 py-2 rounded-full disabled:bg-supply-sec"
                onClick={handleSubmit}
              >
                Hoàn tất
              </button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-[8px]">@2025 bản quyền thuộc về Green supply</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleRegister;
