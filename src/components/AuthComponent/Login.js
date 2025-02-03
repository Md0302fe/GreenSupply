import React, { useEffect, useState } from "react";
import Loading from "../LoadingComponent/Loading";
import * as UserServices from "../../services/UserServices";
import "./Login.scss";
import { toast } from "react-toastify";
import PasswordResetPopup from "./PasswordResetPopup";
// react - ui
import { useMutationHooks } from "../../hooks/useMutationHook";
import { TbFaceIdError } from "react-icons/tb";
import { RxCheckCircled } from "react-icons/rx";
// JWT
import { jwtDecode } from "jwt-decode";
// react redux
import { useDispatch } from "react-redux";
import { updateUser } from "../../redux/slides/userSlides";

// image
import backgroundRegister from "../../assets/image/background_login.png";

// Google
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import OTPInput from "react-otp-input";

const Login = ({
  isLoginActive,
  setLoginHiddent,
  setRegisterActive,
  setActive,
  active,
  setGoogleRegisterActive,
}) => {
  // Variables
  const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [stateNotification, setStateNotification] = useState(false);
  const dishpatch = useDispatch();

  // FORGOT PASSWORD
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [emailForgot, setEmailForgot] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpPopupVisible, setOtpPopupVisible] = useState(false);
  const [resendTimer, setResendTimer] = useState(0); // Thời gian chờ (giây)
  const [errorMessage, setErrorMessage] = useState('');
  const [sendOtpLoading, setsendOtpLoading] = useState(false);
  const [newPassword, setNewPassword] = useState(false);


  // Mutation
  const mutation = useMutationHooks((data) => UserServices.userLogin(data));
  const { isPending, data, isSuccess } = mutation;

  // useEffect
  useEffect(() => {
    if (isSuccess) {
      // chuẩn bị active box notification (success/fails)
      setStateNotification(true);
      if (data.status === "OK") {
        // lấy token từ phía BE
        const token = data?.access_token;
        // setItem (token)
        localStorage.setItem("access_token", JSON.stringify(token));
        if (data?.access_token) {
          const decode = jwtDecode(token);
          if (decode?.id) {
            handleGetDetailsUser(decode?.id, token);
          }
        }
        setTimeout(() => {
          setEmail("");
          setPassword("");
          setLoginHiddent();
          setStateNotification(false);
        }, 1000);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  useEffect(() => {
    if (email === "" && password === "") {
      setStateNotification(false);
    }
  }, [email, password]);

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    const googleToken = credentialResponse.credential;
    try {
      const response = await UserServices.userLogin({ googleToken });
      console.log(response)
      const { status, user, message } = response;
      if (status === "NEW_USER") {
        // Hiển thị GoogleRegister để bổ sung thông tin
        setGoogleRegisterActive(user); // Gọi hàm kích hoạt
      } else if (status === "OK") {
        // Đăng nhập thành công
        localStorage.setItem("access_token", response.access_token);
        toast.success("Đăng nhập thành công!");
        setTimeout(() => {
          setLoginHiddent();
        }, 1000);
      } else {
        toast.error(message || "Đăng nhập thất bại.");
      }
    } catch (error) {
      console.error("Google login failed:", error);
      toast.error("Đăng nhập không thành công, hãy thử lại sau.");
    }
  };


  const handleGoogleLoginFailure = (error) => {
    toast.error("Đăng nhập không thành công, hãy thử lại sau.")
    console.error("Google Login Failed:", error);
  };

  // USER INFOMATIONS
  const handleGetDetailsUser = async (id, token) => {
    const res = await UserServices.getDetailsUser(id, token);
    dishpatch(updateUser({ ...res?.data, access_token: token }));
  };

  // CLICK BTN LOGIN
  const handleLogin = async (googleToken) => {
    const data = { email, password, googleToken };
    mutation.mutate(data);
  };

  const handleCheckEmail = async () => {
    setsendOtpLoading(true);
    setErrorMessage('');
    try {
      const res = await UserServices.checkEmail({ emailForgot });
      if (res.status === "ERROR") {
        setErrorMessage(res.message);
      }
      if (res.status === "OK") {
        setOtpPopupVisible(true);
        setResendTimer(60);
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
      }
    } catch (error) {
      console.error("API call failed:", error);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setsendOtpLoading(false);
    }
  }


  const handleSubmitOTP = async () => {
    setErrorMessage('');
    if (!otp || otp.length !== 6) { // Kiểm tra OTP
      toast.error("Vui lòng nhập mã OTP hợp lệ trước khi tiếp tục.");
      return;
    }
    const res = await UserServices.checkOtp({ otp, emailForgot });
    if (res.status === "ERROR") {
      setErrorMessage(res.message);
    }
    toast.success('Xác minh mã otp thành công.')
    setNewPassword(true);
    setOtpPopupVisible(false);
    setIsForgotPassword(false);
  }

  const handlePasswordReset = async (newPassword) => {
    try {
      const res = await UserServices.updatePassword({ newPassword, email: emailForgot });

      if (res.status === "ERROR") {
        toast.error(res.message);
        return;
      }
      setNewPassword(false);
      toast.success("Mật khẩu đã được cập nhật thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật mật khẩu:", error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau.");
    } finally {
      setsendOtpLoading(false); 
    }
  };

  // CLICK BTN CLOSE
  const handleClickCloseBtn = () => {
    setLoginHiddent();
    setActive(false);
  };

  // CLICK BTN ĐĂNG KÝ
  const handleSignUp = () => {
    setLoginHiddent();
    setRegisterActive();
  };

  return (
    //  Overlay - Login-container
    <div
      className={`login-container overlay-all flex-center-center ${isLoginActive && active ? "active" : "hidden"
        } `}
    >
      {/* Wrapper Login */}
      <div className="Login-wapper Width items-center bg-cover max-w-full w-full h-full grid md:grid-cols-2"
        style={{ backgroundImage: `url("${backgroundRegister}")` }}>
        <div className="Info-Sign-In bg-white rounded-2xl pt-12 pb-6  md:ml-8 w-11/12 lg:w-8/12 mx-auto relative">
          {/* Button Close Form */}
          <div onClick={() => handleClickCloseBtn()} className="absolute flex gap-1 items-center top-3 left-4 text-supply-primary cursor-pointer">
            <svg width="16px" height="16px" viewBox="0 0 1024 1024" className="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M768 903.232l-50.432 56.768L256 512l461.568-448 50.432 56.768L364.928 512z" fill="#ff8b00"></path></g></svg>
            <span>Trang chủ</span>
          </div>
          <img src="image/logo-orange.png" alt="" />
          <p className="text-3xl font-bold text-supply-primary mb-4">Đăng nhập</p>
          <div className="content-form col-5 w-10/12">
            {/* Email */}
            <div className="form-group">
              {/* <label>Email</label> */}
              <input
                type={"email"}
                className="border-[1px] shadow-[inset_1px_1px_2px_1px_#00000024] border-supply-primary text-black"
                value={email}
                placeholder="Email"
                onChange={(event) => setEmail(event.target.value)}
              ></input>
            </div>

            {/* Password */}
            <div className="form-group">
              {/* <label>Password</label> */}
              <input
                type={"password"}
                className="border-[1px] shadow-[inset_1px_1px_2px_1px_#00000024] border-supply-primary text-black"
                value={password}
                placeholder="Mật khẩu "
                onChange={(event) => setPassword(event.target.value)}
              ></input>
            </div>

            {/* Forget Password */}
            <div className="forget-password cursor-pointer" onClick={() => setIsForgotPassword(true)}>
              <span>Quên mật khẩu ?</span>
            </div>
            <div
              className={`errorShow register ${stateNotification ? "active" : ""
                }`}
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
            <Loading isPending={isPending}>
              <div className="text-center">
                <button
                  className="text-center bg-supply-primary text-white px-10 py-2 rounded-full disabled:bg-supply-sec"
                  onClick={() => handleLogin()}
                  disabled={!email.length || !password.length}
                >
                  Đăng nhập
                </button>
              </div>
            </Loading>
          </div>
          <GoogleOAuthProvider clientId={CLIENT_ID}>
            <div className="login-container text-center">
              <h2 className="my-3 text-xs">Hoặc</h2>
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginFailure}
              />
            </div>
          </GoogleOAuthProvider>
          <div className="mt-4 text-center">
            <p>Bạn chưa có tài khoản <span onClick={() => handleSignUp()} className="text-supply-primary underline cursor-pointer">Đăng ký</span></p>
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
        {isForgotPassword && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
              <h2 className="text-lg font-semibold text-gray-700">Quên mật khẩu?</h2>
              <p className="text-gray-500 text-sm mb-4">Vui lòng nhập email của bạn</p>
              <input
                type="email"
                required
                placeholder="Nhập email..."
                onChange={(event) => setEmailForgot(event.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              />
              {errorMessage && (
                <p className="text-red-500 mt-2 ml-2">{errorMessage}</p>
              )}
              <button onClick={() => handleCheckEmail()} disabled={sendOtpLoading} className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition">
                {sendOtpLoading === true ? (
                  <div role="status" className="w-fit mx-auto">
                    <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                    </svg>
                  </div>
                ) : (
                  <span>
                    Gửi yêu cầu
                  </span>
                )}
              </button>

              {sendOtpLoading === false ?? (
                <div
                  onClick={() => setIsForgotPassword(false)}
                  className="absolute top-3 right-3 cursor-pointer"
                >
                  <img src="/image/icon/close.png" alt="Đóng" className="w-4 opacity-70 hover:opacity-100 transition" />
                </div>
              )}
            </div>

          </div>
        )}
        {otpPopupVisible && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
              <h3 className="text-2xl font-semibold text-center text-gray-800 mb-6">
                Nhập mã OTP
              </h3>
              <p className="text-sm text-gray-600 text-center mb-4">
                Vui lòng nhập mã OTP gồm 6 chữ số được gửi đến email của bạn
              </p>
              <OTPInput
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
              {errorMessage && (
                <p className="text-red-500 mt-2 ml-2">{errorMessage}</p>
              )}
              <button
                className="mt-6 w-full py-3 bg-indigo-600 text-white text-lg font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                onClick={() => handleSubmitOTP(otp)}
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
                  onClick={resendTimer === 0 ? handleCheckEmail : undefined}
                >
                  {resendTimer > 0 ? `Gửi lại sau ${resendTimer}s` : "Gửi lại"}
                </span>
              </p>
            </div>
          </div>

        )}
        {newPassword && (
          <PasswordResetPopup
            onClose={() => setNewPassword(false)}
            onSubmit={handlePasswordReset}
          />
        )}
      </div>
    </div>
  );
};

export default Login;
