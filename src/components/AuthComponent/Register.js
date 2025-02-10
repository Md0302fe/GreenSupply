import React, { useEffect, useState } from "react";
import "./Login.scss";
import backgroundRegister from "../../assets/image/background_login.png";
import * as UserServices from "../../services/UserServices";
import { useMutationHooks } from "../../hooks/useMutationHook";
import Loading from "../LoadingComponent/Loading";

import { TbFaceIdError } from "react-icons/tb";
import { RxCheckCircled } from "react-icons/rx";
import OtpInput from 'react-otp-input';
import { toast } from "react-toastify";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [role_check, setRoleCheck] = useState(false);
  const [gender, setGender] = useState("");
  const [resendTimer, setResendTimer] = useState(0); // Thời gian chờ (giây)

  const [otp, setOtp] = useState('');
  const [otpPopupVisible, setOtpPopupVisible] = useState('');
  const mutation = useMutationHooks((data) => UserServices.userRegister(data));
  const [loading, setLoading] = useState(false);
  const { data, isSuccess } = mutation;

  useEffect(() => {
    if (isSuccess && data.status === "OK") {
      toast.success('Tạo tài khoản thành công!');
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  // Click Submit Sau Khi Điền Form
  const HandleSubmitFormRegister = () => {
    if (!otp || otp.length !== 6) { // Kiểm tra OTP
      toast.error("Vui lòng nhập mã OTP hợp lệ trước khi tiếp tục.");
      return;
    }
    const data = { name, email, password, confirmPassword, phone, date, role_check, gender, otp };
    mutation.mutate(data);
  };

  const handleCloseOtpPopup = () => {
    setOtp('');
    setOtpPopupVisible(false);
    setResendTimer(0);
  };

  // Hàm xử lý gửi OTP
  const requestOtp = async () => {
    if (resendTimer > 0) return; // Không cho gửi lại nếu còn thời gian chờ
    setLoading(true);
    try {
      const result = await UserServices.sendOtp({
        name,
        email,
        password,
        confirmPassword,
        phone,
        date,
        role_check,
        gender,
      });

      if (result.status === "OK") {
        setOtpPopupVisible(true);
        setResendTimer(60); // Đặt thời gian chờ là 60 giây

        // Bắt đầu đếm ngược
        const interval = setInterval(() => {
          setResendTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval); // Dừng đếm ngược khi hết thời gian
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        toast.success("OTP đã được gửi!");
      } else {
        toast.error(result.message || "Không thể gửi OTP.");
      }
    } catch (error) {
      console.error("Lỗi khi yêu cầu OTP:", error.message);
      toast.error("Không thể gửi OTP. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div
      className={`login-container flex-center-center h-screen `}
    >
      <div className="Login-wapper Width items-center bg-cover max-w-full w-full h-full grid md:grid-cols-2"
        style={{ backgroundImage: `url("${backgroundRegister}")` }}
      >


        <div className="Info-Sign-In  bg-white rounded-2xl pb-4 md:ml-8 w-11/12 lg:w-8/12 mx-auto relative">
          {/* Button Close Form */}
          <a href="/" className="absolute flex gap-1 items-center top-3 left-4 text-supply-primary cursor-pointer">
            <svg width="16px" height="16px" viewBox="0 0 1024 1024" className="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M768 903.232l-50.432 56.768L256 512l461.568-448 50.432 56.768L364.928 512z" fill="#ff8b00"></path></g></svg>
            <span>Trang chủ</span>
          </a>
          <div className="col-4 mx-auto pt-12 font-bold text-3xl text-center text-supply-primary mb-4">Đăng Ký</div>
          {/* FORM SIGN UP */}
          <div className="content-form col-5 w-10/12 mx-auto">
            {/* 1/ Họ - first Name */}
            <div className="form-group">
              <input
                type={"text"}
                className="border-[1px] shadow-[inset_1px_1px_2px_1px_#00000024] border-supply-primary text-black"
                value={name}
                placeholder="Tên của bạn"
                onChange={(event) => setName(event.target.value)}
                required
              ></input>
            </div>

            {/* 2/ useName - email */}
            <div className="form-group">
              <input
                type={"email"}
                className="border-[1px] shadow-[inset_1px_1px_2px_1px_#00000024] border-supply-primary text-black"
                value={email}
                placeholder="Email"
                onChange={(event) => setEmail(event.target.value)}
              ></input>
            </div>

            {/* 3/ password */}
            <div className="form-group">
              <input
                type="password"
                className={`border-[1px] shadow-[inset_1px_1px_2px_1px_#00000024] border-supply-primary text-black ${password && password.length < 6 ? "border-red-500" : ""
                  }`}
                value={password}
                placeholder="Mật khẩu"
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              {/* Hiển thị lỗi nếu mật khẩu không hợp lệ */}
              {password && password.length < 6 && (
                <p className="text-red-500 text-sm mt-1">Mật khẩu phải có ít nhất 6 ký tự.</p>
              )}
            </div>

            {/* 4/ Confirm Password */}
            <div className="form-group">
              <input
                type="password"
                className="border-[1px] shadow-[inset_1px_1px_2px_1px_#00000024] border-supply-primary text-black"
                value={confirmPassword}
                placeholder="Xác thực mật khẩu"
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>

            {/* 5/ Phone */}
            <div className="form-group">
              <input
                type="text"
                className={`border-[1px] shadow-[inset_1px_1px_2px_1px_#00000024] border-supply-primary text-black ${phone && !/^0\d{9}$/.test(phone) ? "border-red-500" : ""
                  }`}
                value={phone}
                placeholder="Số điện thoại"
                onChange={(event) => {
                  const input = event.target.value;
                  if (/^\d{0,10}$/.test(input)) { // Chỉ cho phép nhập số, tối đa 10 số
                    setPhone(input);
                  }
                }}
                required
              />
              {/* Hiển thị lỗi nếu số điện thoại không hợp lệ */}
              {phone && !/^0\d{9}$/.test(phone) && (
                <p className="text-red-500 text-sm mt-1">Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số.</p>
              )}
            </div>

            {/* 6. Giới tính */}
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

            {/* 6. Birthday */}
            <div className="form-group">
              <label htmlFor="date">Ngày sinh</label>
              <input
                type="date"
                className={`border-[1px] shadow-[inset_1px_1px_2px_1px_#00000024] border-supply-primary text-black ${date && date > new Date().toISOString().split("T")[0] ? "border-red-500" : ""
                  }`}
                id="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
              {/* Hiển thị lỗi nếu ngày sinh không hợp lệ */}
              {date && date > new Date().toISOString().split("T")[0] && (
                <p className="text-red-500 text-sm mt-1">Ngày sinh không thể lớn hơn ngày hiện tại.</p>
              )}
            </div>

            {/* 7. Is supplier */}
            <div className="">
              <input
                type={"checkbox"}
                className="mr-2"
                id="roleCheck"
                checked={role_check}
                onChange={(event) => setRoleCheck(event.target.checked)}
              ></input>
              <label htmlFor="roleCheck">Nhấn vào đây nêu bạn là nhà cung ứng</label>
            </div>

            {/* Error */}
            <div
              className={`errorShow register ${data?.status ? "active" : ""}`}
            >
              {data?.status === "ERROR" ? (
                <div className="errorShow">
                  <TbFaceIdError className="icons"></TbFaceIdError>
                  <div className="errorBox">
                    <span className="error">{data?.message}</span>
                  </div>
                </div>
              ) : (
                <div className="successShow">
                  <RxCheckCircled className="icons"></RxCheckCircled>
                  <div className="errorBox">
                    <span className="success">{data?.message}</span>
                  </div>
                </div>
              )}
            </div>

            <Loading isPending={loading}>
              <div className="text-center">
                <button
                  disabled={
                    !name.length ||
                    !email.length ||
                    !password.length ||
                    !confirmPassword.length ||
                    !phone.length
                  }
                  className="text-center bg-supply-primary text-white px-10 py-2 rounded-full disabled:bg-supply-sec"
                  onClick={() => requestOtp()}
                >
                  Đăng ký
                </button>
              </div>
            </Loading>
          </div>
          <div className="mt-4 text-center">
            <p>Bạn đã có tài khoản <a href="/login" className="text-supply-primary underline cursor-pointer">Đăng nhập</a></p>
            <p className="text-[8px]">@2025 bản quyền thuộc về Green supply</p>
          </div>
        </div>
        <div className="hidden md:flex flex-col items-center justify-center text-center">
          <img src="image/logo-white.png" alt="" />
          <p className="text-white font-semibold text-3xl">Giải pháp hiệu quả <br /> dành cho nông sản của bạn</p>
          <div className="flex items-center gap-3 justify-center mt-3">
            <img src="image/icon/fb.png" alt="" />
            <img src="image/icon/yt.png" alt="" />
            <img src="image/icon/tt.png" alt="" />
          </div>
        </div>
        {otpPopupVisible && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative">
              <div onClick={handleCloseOtpPopup} className="absolute top-4 right-4 cursor-pointer">
                <img src="/image/icon/close.png" alt="" className="w-4" />
              </div>
              <h3 className="text-2xl font-semibold text-center text-gray-800 mb-6 mt-2">
                Nhập mã OTP
              </h3>
              <p className="text-sm text-gray-600 text-center mb-4">
                Vui lòng nhập mã OTP gồm 6 chữ số được gửi đến email của bạn
              </p>
              <OtpInput
                value={otp}
                onChange={setOtp}
                numInputs={6}
                containerStyle={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                renderInput={(props) => (
                  <input
                    {...props}
                    className="w-12 h-12 text-center text-gray-800 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                    style={{ width: "48px", height: "48px" }}
                  />
                )}
              />
              <button
                className="mt-6 w-full py-3 bg-indigo-600 text-white text-lg font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                onClick={() => HandleSubmitFormRegister(otp)}
              >
                Xác nhận OTP
              </button>
              <p className="text-sm text-gray-500 text-center mt-4">
                Không nhận được mã?{" "}
                <span
                  className={`cursor-pointer ${resendTimer > 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-indigo-600 hover:underline"
                    }`}
                  onClick={resendTimer === 0 ? requestOtp : undefined}
                >
                  {resendTimer > 0 ? `Gửi lại sau ${resendTimer}s` : "Gửi lại"}
                </span>
              </p>
            </div>
          </div>

        )}

      </div>
    </div>
  );
};

export default Register;
