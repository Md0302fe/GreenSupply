import React, { useEffect, useState } from "react";
import "./Login.scss";
import { AiFillCloseSquare } from "react-icons/ai";
import backgroundRegister from "../../assets/image/background_login.png";
import { toast } from "react-toastify";
import * as UserServices from "../../services/UserServices";

const GoogleRegister = ({
  setLoginActive,
  isGoogleRegisterActive,
  setRegisterHiddent,
  setActive,
  active,
  user, // Thông tin người dùng từ Google (email, full_name, avatar)
}) => {
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [role_check, setRoleCheck] = useState(false);
  const [gender, setGender] = useState("");

  // Submit thông tin còn thiếu
  const handleSubmit = async () => {
    if (!phone || !date) {
      toast.error("Vui lòng nhập đầy đủ số điện thoại và ngày sinh!");
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
        date,
        role_check,
        gender,
      });

      if (result.status === "OK") {
        toast.success("Thông tin đã được cập nhật!");
        setTimeout(() => {
          setRegisterHiddent();
          setActive(false);
          setLoginActive();
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
      className={`login-container overlay-all flex-center-center ${
        active && isGoogleRegisterActive ? "active" : "hidden"
      } `}
    >
      <div
        className="Login-wapper Width items-center bg-cover max-w-full w-full h-full flex"
        style={{ backgroundImage: `url("${backgroundRegister}")` }}
      >
        <div className="Info-Sign-In bg-white rounded-2xl pb-4 md:ml-8 w-11/12 lg:w-8/12 mx-auto relative">

          <div className="w-full pt-12 font-bold text-3xl text-center text-supply-primary mb-4">
            Cập Nhật Thông Tin
          </div>

          {/* Hiển thị thông tin từ Google */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={user.avatar}
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
                type={"text"}
                className={`border-[1px] shadow-[inset_1px_1px_2px_1px_#00000024] border-supply-primary text-black ${
                  phone && !/^(03|05|07|08|09)\d{8}$/.test(phone)
                    ? "border-red-500"
                    : ""
                }`}
                value={phone}
                placeholder="Số điện thoại"
                onChange={(event) => {
                  const input = event.target.value;
                  if (/^\d*$/.test(input)) {
                    setPhone(input);
                  }
                }}
                required
              />
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
              <label htmlFor="date">Ngày sinh</label>
              <input
                type={"date"}
                className="border-[1px] shadow-[inset_1px_1px_2px_1px_#00000024] border-supply-primary text-black "
                id="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
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
