import React, { useEffect, useState } from "react";
import "./styles";

import { Upload, message } from "antd";
import { getBase64 } from "../../ultils";
import { updateUser } from "../../redux/slides/userSlides";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useMutationHooks } from "./../../hooks/useMutationHook";

import * as UserServices from "../../services/UserServices";
import Loading from "../../components/LoadingComponent/Loading";

import OTPInput from "react-otp-input";
import { useTranslation } from "react-i18next";
const ProfilePage = () => {
  const { t } = useTranslation();
  // 1: Variables
  const userRedux = useSelector((state) => state.user);
  console.log("userRedux:", userRedux);

  // const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [avatar, setAvatar] = useState("");
  const [birth_day, setBirthday] = useState("");
  const [gender, setGender] = useState("Other");
  const [full_name, setFullName] = useState("");
  const [birthDayError, setBirthDayError] = useState(""); // Lưu lỗi của ngày sinh
  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [genderError, setGenderError] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setconfirmNewPassword] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [otp, setOtp] = useState("");
  const [otpPopupVisible, setOtpPopupVisible] = useState("");
  const [isChagePassword, setIsChangePassword] = useState(false);
  const [isSubmitEmail, setIsSubmitEmail] = useState(false);
  const [emailSubmit, setEmailSubmit] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [sendOtpLoading, setsendOtpLoading] = useState(false);
  const [havePassword, setHavepassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const dishpatch = useDispatch();
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // 2: Mutation
  const mutation = useMutationHooks((Res) => {
    const { id, access_token, data } = Res;
    return UserServices.updateAccount({ id, data, access_token });
  });
  const { isPending, isSuccess, data } = mutation;

  ////Hàm check name
  const validateFullName = (name) => {
    if (!name.trim()) return t("validation.fullNameRequired");
    if (name.length < 2 || name.length > 50)
      return t("validation.fullNameLength");
    if (/\d/.test(name)) return t("validation.fullNameNoNumber");
    return "";
  };

  ////Hàm check email
  const validateEmail = (email) => {
    if (!email.trim()) return t("validation.emailRequired");
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return t("validation.emailInvalid");
    return "";
  };

  ///Hàm check phone
  const validatePhone = (phone) => {
    if (!phone.trim()) return t("validation.phoneRequired");
    if (phone.includes("-")) return t("validation.phoneNegative");
    if (phone.length !== 10) return t("validation.phoneLength");
    return "";
  };

  ///////hàm check giới tính
  const validateGender = (gender) => {
    if (!gender.trim()) return t("validation.genderRequired");
  };

  const validateBirthDay = (date, setBirthDayError) => {
    if (!date) {
      setBirthDayError("");
      return true;
    }
    const today = new Date();
    const selectedDate = new Date(date);
    if (selectedDate > today) {
      setBirthDayError(t("validation.birthDayInFuture"));
      return false;
    }
    setBirthDayError("");
    return true;
  };

  // 3: useEffect
  useEffect(() => {
    if (isSuccess) {
      if (data?.status === "OK") {
        message.success(data?.message);
        handleGetDetailsUser(userRedux?.id, userRedux?.access_token);
      } else if (data?.status === "ERROR") {
        message.error(data?.message);
      }
    }
  }, [isSuccess]);

  // CLICK BUTTON BTN UPDATE -> CALL API HANDLE UPDATE USER - CLICK CẬP NHẬT
  const handleClickBtnUpdate = (customAvatar = null) => {
    console.log("🛠 Running handleClickBtnUpdate");
    const nameError = validateFullName(full_name);
    const emailError = validateEmail(email);
    const phoneError = validatePhone(phone);
    const genderError = validateGender(gender);

    setFullNameError(nameError);
    setEmailError(emailError);
    setPhoneError(phoneError);
    setGenderError(genderError);

    if (nameError || emailError || phoneError || genderError) {
      console.log("🚫 Dừng lại vì có lỗi form");
      return;
    }
    const data = {
      full_name,
      email,
      phone,
      address,
      avatar: customAvatar || avatar,
      birth_day,
      gender,
    };
    mutation.mutate({
      id: userRedux?.id,
      data,
      access_token: userRedux?.access_token,
    });
  };

  // USER INFOMATIONS AFTER UPDATE
  const handleGetDetailsUser = async (id, token) => {
    const res = await UserServices.getDetailsUser(id, token);
    console.log("API Response:", res);
    dishpatch(updateUser({ ...res?.data, access_token: token }));
  };
  // Hàm xử lý gửi OTP
  const requestOtp = async () => {
    if (resendTimer > 0) return; // Không cho gửi lại nếu còn thời gian chờ

    try {
      const result = await UserServices.sendOtp({
        password,
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

        message.success(t("otpSent"));
      } else {
        message.error(result.message || "Không thể gửi OTP.");
      }
    } catch (error) {
      console.error("Lỗi khi yêu cầu OTP:", error.message);
      message.error(t("otpSendFailRetry"));
    }
  };
  // Click Submit Sau Khi Điền Form
  const HandleSubmitForm = async () => {
    if (!otp || otp.length !== 6) {
      // Kiểm tra OTP
      message.error(t("invalidOtp"));
      return;
    }
    if (havePassword) {
      const data = { email, otp };
      const res = await UserServices.checkOtpChangePassword(data);
      if (res.status === "OK") {
        console.log(newPassword);
        setOtpPopupVisible(false);
        handleChangePassword();
      }
    } else {
      setIsChangePassword(true);
      return;
    }
  };
  const handleCheckPassword = async () => {
    if ((!password && havePassword) || !newPassword || !confirmNewPassword) {
      message.error(t("fieldsRequired"));
      return;
    }
    if (newPassword !== confirmNewPassword) {
      message.error(t("passwordMismatch"));
      return;
    }
    if (password === newPassword) {
      message.error(t("passwordSameAsOld"));
      return;
    }
    if (!havePassword) {
      handleChangePassword();
      return;
    }

    setsendOtpLoading(true);
    setErrorMessage("");
    try {
      const res = await UserServices.checkPassword({ email, password });
      if (res.status === "ERROR") {
        setErrorMessage(res.message);
      }
      if (res.status === "OK") {
        setOtpPopupVisible(true);
        setIsChangePassword(false);
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

        message.success(t("otpSent"));
      }
    } catch (error) {
      console.error("API call failed:", error);
      message.error(t("emailNotExist"));
    } finally {
      setsendOtpLoading(false);
    }
  };
  const handleCheckEmail = async () => {
    setsendOtpLoading(true);
    setErrorMessage("");
    try {
      const res = await UserServices.checkEmail({ emailForgot: emailSubmit });
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

        message.success("OTP đã được gửi!");
      }
    } catch (error) {
      console.error("API call failed:", error);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setsendOtpLoading(false);
    }
  };
  const handleChagePasswordModal = () => {
    if (havePassword) {
      setIsChangePassword(true);
    } else {
      setIsSubmitEmail(true);
    }
  };
  const handleChangePassword = async () => {
    const access_token = userRedux.access_token;
    const res2 = await UserServices.updatePassword({
      newPassword,
      email,
      access_token,
    });
    if (res2.status === "OK") {
      message.success(t("passwordChangedSuccess"));
      handleGetDetailsUser(userRedux?.id, userRedux?.access_token);
      window.location.reload();
    }
  };
  // get value redux after userRedux change
  useEffect(() => {
    setFullName(userRedux?.full_name);
    // setName(userRedux?.name);
    setEmail(userRedux?.email);
    setPhone(userRedux?.phone);
    setAddress(userRedux?.address);
    setAvatar(userRedux?.avatar);
    setBirthday(userRedux?.birth_day);
    setGender(userRedux?.gender);
    if (userRedux?.password) {
      setHavepassword(true);
    }
  }, [userRedux]);
  const formatDateForInput = (isoString) => {
    if (!isoString) return "";
    return isoString.split("T")[0]; // chỉ lấy phần yyyy-MM-dd
  };
  const handleChangeName = (value) => {
    if (value.length > 40) return; // Không làm gì nếu vượt quá 40 ký tự

    setFullName(value);
    const error = validateFullName(value);
    setFullNameError(error);
  };
  const handleChangeBirthday = (value) => {
    setBirthday(value);
    validateBirthDay(value, setBirthDayError);
  };
  const handleChangePhone = (value) => {
    setPhone(value);
    const error = validatePhone(value);
    setPhoneError(error);
  };
  const handleCloseOtpPopup = () => {
    setOtp("");
    setOtpPopupVisible(false);
    setResendTimer(0);
  };
  const handleChangeAddress = (value) => {
    setAddress(value);
  };

  const handleChangeGender = (value) => {
    setGender(value);
    const error = validateGender(value);
    setGenderError(error);
  };

  // Tuy nhiên, cần lưu ý rằng event trong trường hợp này sẽ là một đối tượng chứa thông tin về tệp tải lên,
  // Ant Design cung cấp một đối tượng info trong onChange, chứa thông tin chi tiết về tệp và quá trình tải lên.
  const handleChangeAvatar = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Preview để hiển thị
    const preview = await getBase64(file);
    setAvatar(preview); // dùng để hiển thị ảnh

    // Gọi cập nhật luôn, dùng preview để truyền vào API
    handleClickBtnUpdate(preview);
  };

  return (
    <div className="User-Profile Container flex-center-center">
      <div className="Wrapper Width">
        <Loading isPending={isPending}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 py-4">
            {/* Left Sidebar */}
            <div className="lg:col-span-1 flex justify-center items-center h-full">
              {/* Profile Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 max-w-[280px]">
                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div className="relative mb-6">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                      <div className="w-full h-full rounded-full overflow-hidden bg-white">
                        {avatar ? (
                          <img
                            src={avatar || "/placeholder.svg"}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                            {full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                        )}
                      </div>
                    </div>
                    <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full cursor-pointer shadow-lg transition-all duration-200 hover:scale-110">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleChangeAvatar}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-2 max-w-[80%] line-clamp-1">
                    {full_name}
                  </h2>
                  <p className="text-gray-600 mb-4">{email}</p>

                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-6">
                    {t("profile.verifiedAccount")}
                  </div>

                  {/* Action Buttons */}
                  <div className="w-full space-y-3">
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      👤{" "}
                      {isEditing
                        ? t("profile.cancelEdit")
                        : t("profile.editProfile")}
                    </button>

                    <button
                      onClick={() => handleChagePasswordModal()}
                      className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
                    >
                      🔒 {t("changePassword")}
                    </button>

                    <button
                      onClick={() => navigate("/Address")}
                      className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
                    >
                      📍 {t("addressList")}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 flex items-center w-full">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden w-full">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">
                        {t("profile.personalInfo")}
                      </h3>
                      <p className="text-blue-100">{t("profile.updateHint")}</p>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => handleClickBtnUpdate(avatar)}
                        disabled={isPending}
                        className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 disabled:opacity-50"
                      >
                        {isPending
                          ? `💾 ${t("profile.saving")}`
                          : `💾 ${t("profile.saveChanges")}`}
                      </button>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-2 ">
                  {/* Full Name */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      👤 {t("profile.fullName")}
                    </label>
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={full_name}
                        onChange={(e) => handleChangeName(e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                          !isEditing
                            ? "bg-gray-50 border-gray-200 text-gray-600"
                            : "bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        } ${fullNameError ? "border-red-500" : ""}`}
                        placeholder={t("profile.enterFullName")}
                      />
                      {fullNameError && (
                        <p className="text-red-500 text-sm mt-2 flex items-center">
                          ⚠️ {fullNameError}
                        </p>
                      )}
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  {/* Email */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      📧 {t("profile.emailAddress")}
                    </label>
                    <div className="md:col-span-2">
                      <input
                        type="email"
                        value={email}
                        disabled={true}
                        className="w-full px-4 py-3 rounded-lg border-2 bg-gray-50 border-gray-200 text-gray-600"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        🔒 {t("profile.emailNoChange")}
                      </p>
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  {/* Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      📱 {t("profile.phoneNumber")}
                    </label>
                    <div className="md:col-span-2">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => handleChangePhone(e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                          !isEditing
                            ? "bg-gray-50 border-gray-200 text-gray-600"
                            : "bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        } ${phoneError ? "border-red-500" : ""}`}
                        placeholder={t("profile.enterPhone")}
                      />
                      {phoneError && (
                        <p className="text-red-500 text-sm mt-2 flex items-center">
                          ⚠️ {phoneError}
                        </p>
                      )}
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  {/* Birth Date */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      🎂 {t("profile.birthDate")}
                    </label>
                    <div className="md:col-span-2">
                      <input
                        type="date"
                        value={formatDateForInput(birth_day)}
                        onChange={(e) => handleChangeBirthday(e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                          !isEditing
                            ? "bg-gray-50 border-gray-200 text-gray-600"
                            : "bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        } ${birthDayError ? "border-red-500" : ""}`}
                      />
                      {birthDayError && (
                        <p className="text-red-500 text-sm mt-2 flex items-center">
                          ⚠️ {birthDayError}
                        </p>
                      )}
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  {/* Gender */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      ⚧ {t("profile.gender")}
                    </label>
                    <div className="md:col-span-2">
                      <select
                        value={gender}
                        onChange={(e) => handleChangeGender(e.target.value)}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                          !isEditing
                            ? "bg-gray-50 border-gray-200 text-gray-600"
                            : "bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        } ${genderError ? "border-red-500" : ""}`}
                      >
                        <option value="male">{t("male")}</option>
                        <option value="female">{t("female")}</option>
                        <option value="other">{t("other")}</option>
                      </select>
                      {genderError && (
                        <p className="text-red-500 text-sm mt-2 flex items-center">
                          ⚠️ {genderError}
                        </p>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <span className="text-blue-600 mr-2">ℹ️</span>
                        <p className="text-blue-800 text-sm">
                          {t("profile.editHint")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Loading>
      </div>

      {isSubmitEmail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden transform transition-all duration-300 scale-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
              <button
                onClick={() => setIsSubmitEmail(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <h2 className="text-xl font-bold mb-1">
                {t("confirmEmail") || "Confirm Email"}
              </h2>
              <p className="text-blue-100 text-sm">
                {t("pleaseEnterEmail") ||
                  "Please enter your email to receive OTP"}
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t("enterEmail") || "Email Address"}
                </label>
                <input
                  type="email"
                  required
                  placeholder="example@email.com"
                  onChange={(e) => setEmailSubmit(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
                />
                {errorMessage && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {errorMessage}
                  </p>
                )}
              </div>

              <button
                onClick={handleCheckEmail}
                disabled={sendOtpLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {sendOtpLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="w-5 h-5 mr-3 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {t("sending") || "Sending..."}
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {t("sendRequest") || "Send Request"}
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {otpPopupVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative">
            <div
              onClick={handleCloseOtpPopup}
              className="absolute top-4 right-4 cursor-pointer"
            >
              <img src="/image/icon/close.png" alt="" className="w-4" />
            </div>
            <h3 className="text-2xl font-semibold text-center text-gray-800 mb-6 mt-2">
              {t("enterOtp")}
            </h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              {t("otpInstruction")}
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
            <button
              className="mt-6 w-full py-3 bg-indigo-600 text-white text-lg font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
              onClick={() => HandleSubmitForm(otp)}
            >
              {t("confirmOtp")}
            </button>
            <p className="text-sm text-gray-500 text-center mt-4">
              {t("notReceiveOtp")}{" "}
              <span
                className={`cursor-pointer ${
                  resendTimer > 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-indigo-600 hover:underline"
                }`}
                onClick={resendTimer === 0 ? requestOtp : undefined}
              >
                {resendTimer > 0
                  ? t("resendIn", { seconds: resendTimer })
                  : t("resendNow")}
              </span>
            </p>
          </div>
        </div>
      )}
      {isChagePassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md relative shadow-xl">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => setIsChangePassword(false)}
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              🔒 {t("profile.changePassword")}
            </h2>

            {havePassword && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("profile.currentPassword")}
                </label>
                <input
                  type={showPassword.current ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border rounded-md focus:ring focus:border-blue-500"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("profile.newPassword")}
              </label>
              <input
                type={showPassword.new ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border rounded-md focus:ring focus:border-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("profile.confirmPassword")}
              </label>
              <input
                type={showPassword.confirm ? "text" : "password"}
                value={confirmNewPassword}
                onChange={(e) => setconfirmNewPassword(e.target.value)}
                className="w-full p-3 border rounded-md focus:ring focus:border-blue-500"
              />
              {newPassword !== confirmNewPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {t("profile.passwordMismatch")}
                </p>
              )}
            </div>

            {errorMessage && (
              <p className="text-red-500 text-sm mb-2">{errorMessage}</p>
            )}

            <button
              onClick={handleCheckPassword}
              disabled={sendOtpLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              {sendOtpLoading ? t('profile.updating') : t('profile.updatePassword')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
