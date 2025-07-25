import React, { useEffect, useState } from "react";
import "./styles";
import {
  MDBCol,
  MDBContainer,
  MDBRow,
  MDBCard,
  MDBCardText,
  MDBCardBody,
  MDBBtn,
  MDBBreadcrumb,
  MDBBreadcrumbItem,
} from "mdb-react-ui-kit";

import { Upload, message } from "antd";
import { getBase64 } from "../../ultils";
import { updateUser } from "../../redux/slides/userSlides";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useMutationHooks } from "./../../hooks/useMutationHook";

import * as UserServices from "../../services/UserServices";
import Loading from "../../components/LoadingComponent/Loading";

import {
  CardBodys,
  FlexCenterCenter,
  FlexCenterCenterCol,
  InPut,
  StyledMDBCardImage,
  WrapperContent,
  WrapperProfileUser,
} from "./styles";

import userImage from "../../assets/DefaultUser.jpg";
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

  const navigate = useNavigate();
  const dishpatch = useDispatch();
  const location = useLocation();

  // kiểm tra state từ phía Payment
  const fromPayment = location.state?.fromPayment;

  // 2: Mutation
  const mutation = useMutationHooks((Res) => {
    const { id, access_token, data } = Res;
    return UserServices.updateAccount({ id, data, access_token });
  });
  const { isPending, isSuccess, data } = mutation;

  const formatDateForInput = (date) => {
    if (!date) return "";
    return date.split("T")[0]; // Lấy phần YYYY-MM-DD từ "YYYY-MM-DDTHH:MM:SS.ZZZZ"
  };

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
  }

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
  const handleClickBtnUpdate = () => {
    const nameError = validateFullName(full_name);
    const emailError = validateEmail(email);
    const phoneError = validatePhone(phone);
    const genderError = validateGender(gender);

    setFullNameError(nameError);
    setEmailError(emailError);
    setPhoneError(phoneError);
    setGenderError(genderError);

    if (nameError || emailError || phoneError || genderError) return; // Nếu có lỗi, không gửi API

    const data = {
      full_name,
      email,
      phone,
      address,
      avatar,
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
    if (!newPassword || !password || !confirmNewPassword) {
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

  const handleChangeName = (value) => {
    setFullName(value);
    const error = validateFullName(value);
    setFullNameError(error);
  };
  const handleChangeEmail = (value) => {
    setEmail(value);
    const error = validateEmail(value);
    setEmailError(error);
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
  const handleChangeAvatar = async (info) => {
    // C2: getBase64
    const file = info.fileList[0];
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setAvatar(file.preview);
  };

  return (
    <div className="User-Profile Container flex-center-center">
      <div className="Wrapper Width">
        {/* <WrapperProfileTitle>THÔNG TIN NGƯỜI DÙNG</WrapperProfileTitle> */}
        <Loading isPending={isPending}>
          <WrapperContent className="pt-3 mb-4 mt-4">
            <WrapperProfileUser>
              <MDBContainer>
                <MDBRow>
                  <MDBCol>
                    <MDBBreadcrumb className="bg-light rounded-3 p-3 mb-4 flex flex-row w-full justify-between items-center min-h-[60px]">
                      <div className="flex flex-row items-center">
                        <MDBBreadcrumbItem>
                          <span
                            onClick={() => navigate("/home")}
                            className="cursor-pointer hover:border-b hover:border-black transition-all duration-200"
                          >
                            Home
                          </span>
                        </MDBBreadcrumbItem>
                        <MDBBreadcrumbItem active>
                          {t("userProfile")}
                        </MDBBreadcrumbItem>
                      </div>
                      {fromPayment && (
                        <div>
                          <MDBBreadcrumbItem>
                            <span
                              onClick={() => navigate("/Payment")}
                              className="cursor-pointer border-b border-black uppercase transition-all duration-200 hover:text-[17px]"
                            >
                              {t("continueShopping")}
                            </span>
                          </MDBBreadcrumbItem>
                        </div>
                      )}
                    </MDBBreadcrumb>
                  </MDBCol>
                </MDBRow>
                <MDBRow>
                  <MDBCol lg="4">
                    <FlexCenterCenterCol className="mb-2">
                      {/* avatar here */}
                      <CardBodys>
                        <StyledMDBCardImage
                          src={avatar || userImage}
                          alt="avatar"
                          fluid
                        />
                        <p className="text-muted mb-1">{full_name}</p>
                        <p className="text-muted mb-4">
                          Bay Area, San Francisco, CA
                        </p>
                        <FlexCenterCenter>
                          <MDBBtn
                            onClick={(e) =>
                              handleClickBtnUpdate(e.target.value)
                            }
                          >
                            {t("saveInfo")}
                          </MDBBtn>
                        </FlexCenterCenter>
                      </CardBodys>
                    </FlexCenterCenterCol>
                    <FlexCenterCenterCol className="mb-2">
                      {/* avatar here */}
                      <CardBodys>
                        <FlexCenterCenter>
                          <MDBBtn onClick={() => navigate("/Address")}>
                            {t("addressList")}
                          </MDBBtn>
                        </FlexCenterCenter>
                      </CardBodys>
                    </FlexCenterCenterCol>
                    <FlexCenterCenterCol className="mb-4">
                      {/* avatar here */}
                      <CardBodys>
                        <FlexCenterCenter>
                          <MDBBtn onClick={() => handleChagePasswordModal()}>
                            {t("changePassword")}
                          </MDBBtn>
                        </FlexCenterCenter>
                      </CardBodys>
                    </FlexCenterCenterCol>
                  </MDBCol>
                  <MDBCol lg="8">
                    <MDBCard className="mb-4">
                      <MDBCardBody className="flex flex-col gap-4">
                        <MDBRow>
                          <MDBCol sm="3">
                            <MDBCardText>{t("name")}</MDBCardText>
                          </MDBCol>
                          <MDBCol sm="9" className="cursor-pointer">
                            <MDBCardText className="flex justify-center items-center h-[20px] max-w-full text-muted">
                              <InPut
                                type="text"
                                value={full_name}
                                onChange={(e) =>
                                  handleChangeName(e.target.value)
                                }
                              />
                            </MDBCardText>
                            {fullNameError && (
                              <p
                                style={{
                                  color: "red",
                                  fontSize: "12px",
                                  marginTop: "10px",
                                }}
                              >
                                {fullNameError}
                              </p>
                            )}
                          </MDBCol>
                        </MDBRow>
                        <MDBRow>
                          <MDBCol sm="3">
                            <MDBCardText>{t("email")}</MDBCardText>
                          </MDBCol>
                          <MDBCol sm="9">
                            <MDBCardText className="flex justify-center items-center h-[20px] max-w-full text-muted">
                              <InPut
                                type="email"
                                value={email}
                                disabled
                                onChange={(e) =>
                                  handleChangeEmail(e.target.value)
                                }
                              />
                            </MDBCardText>
                            {emailError && (
                              <p
                                style={{
                                  color: "red",
                                  fontSize: "12px",
                                  marginTop: "6px",
                                }}
                              >
                                {emailError}
                              </p>
                            )}
                          </MDBCol>
                        </MDBRow>
                        <MDBRow>
                          <MDBCol sm="3">
                            <MDBCardText>{t("phone")}</MDBCardText>
                          </MDBCol>
                          <MDBCol sm="9">
                            <MDBCardText className="flex justify-center items-center h-[20px] max-w-full text-muted">
                              <InPut
                                type="number"
                                value={phone}
                                onChange={(e) =>
                                  handleChangePhone(e.target.value)
                                }
                              />
                            </MDBCardText>
                            {phoneError && (
                              <p
                                style={{
                                  color: "red",
                                  fontSize: "12px",
                                  marginTop: "10px",
                                }}
                              >
                                {phoneError}
                              </p>
                            )}
                          </MDBCol>
                        </MDBRow>

                        <MDBRow>
                          <MDBCol sm="3">
                            <MDBCardText>{t("birthDate")}</MDBCardText>
                          </MDBCol>
                          <MDBCol sm="9">
                            {/* <InPut
                              type="date"
                               value={formatDateForInput(birth_day)}
                              onChange={(e) => setBirthday(e.target.value)}
                            /> */}
                            <InPut
                              type="date"
                              value={formatDateForInput(birth_day)}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (validateBirthDay(value)) {
                                  setBirthday(value);
                                }
                              }}
                            />
                            {birthDayError && (
                              <p style={{ color: "red", fontSize: "12px" }}>
                                {birthDayError}
                              </p>
                            )}
                          </MDBCol>
                        </MDBRow>
                        <MDBRow>
                          <MDBCol sm="3">
                            <MDBCardText>{t("gender")}</MDBCardText>
                          </MDBCol>
                          <MDBCol sm="9">
                            <select
                              value={gender}
                              onChange={(e) =>
                                handleChangeGender(e.target.value)
                              }
                              className="w-full p-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                              <option value="" disabled>{t("selectGender")}</option>
                              <option value="male">{t("male")}</option>
                              <option value="female">{t("female")}</option>
                              <option value="other">{t("other")}</option>
                            </select>
                            {genderError && (
                              <p
                                style={{
                                  color: "red",
                                  fontSize: "12px",
                                  marginTop: "4px",
                                }}
                              >
                                {genderError}
                              </p>
                            )}
                          </MDBCol>
                        </MDBRow>

                        <div className="flex justify-between items-center min-h-[20vh]">
                          <div className="flex-[0.25]">
                            <MDBCardText>{t("avatar")}</MDBCardText>
                          </div>
                          {/* setting image here */}
                          <div className="flex-[0.74]">
                            <Upload.Dragger
                              listType="picture"
                              showUploadList={{ showRemoveIcon: true }}
                              accept=".png, .jpg, .jpeg, .gif, .webp, .avif, .eps"
                              maxCount={1}
                              beforeUpload={(file) => {
                                return false;
                              }}
                              onChange={(event) => handleChangeAvatar(event)}
                            >
                              <button> Upload Your Image</button>
                            </Upload.Dragger>
                          </div>
                        </div>
                      </MDBCardBody>
                    </MDBCard>
                  </MDBCol>
                </MDBRow>
              </MDBContainer>
            </WrapperProfileUser>
          </WrapperContent>
        </Loading>
      </div>

      {isSubmitEmail && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <div
              onClick={() => setIsSubmitEmail(false)}
              className="absolute top-4 right-4 cursor-pointer"
            >
              <img src="/image/icon/close.png" alt="" className="w-4" />
            </div>
            <h2 className="text-lg font-semibold text-gray-700">
              {t("confirmEmail")}
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              {t("pleaseEnterEmail")}
            </p>
            <input
              type="email"
              required
              placeholder={t("enterEmail")}
              onChange={(event) => setEmailSubmit(event.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            />
            {errorMessage && (
              <p className="text-red-500 mt-2 ml-2">{errorMessage}</p>
            )}
            <button
              onClick={() => handleCheckEmail()}
              disabled={sendOtpLoading}
              className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition"
            >
              {sendOtpLoading === true ? (
                <div role="status" className="w-fit mx-auto">
                  <svg
                    aria-hidden="true"
                    className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                </div>
              ) : (
                <span>{t("sendRequest")}</span>
              )}
            </button>

            {sendOtpLoading === false ?? (
              <div
                onClick={() => setIsSubmitEmail(false)}
                className="absolute top-3 right-3 cursor-pointer"
              >
                <img
                  src="/image/icon/close.png"
                  alt="Đóng"
                  className="w-4 opacity-70 hover:opacity-100 transition"
                />
              </div>
            )}
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <div
              onClick={() => setIsChangePassword(false)}
              className="absolute top-4 right-4 cursor-pointer"
            >
              <img src="/image/icon/close.png" alt="" className="w-4" />
            </div>
            <h2 className="text-lg font-semibold text-gray-700">
              {t("changePassword")}
            </h2>
            {havePassword && (
              <div>
                <p className="text-gray-500 text-sm my-2 mt-3">
                  {t("enterOldPassword")}
                </p>
                <input
                  type="password"
                  required
                  placeholder={t("enterOldPassword")}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                />
              </div>
            )}
            <p className="text-gray-500 text-sm my-2 mt-3">
              {t("enterNewPassword")}
            </p>
            <input
              type="password"
              required
              placeholder={t("enterNewPassword")}
              onChange={(event) => setNewPassword(event.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            />
            <p className="text-gray-500 text-sm my-2 mt-3">
              {t("confirmNewPassword")}
            </p>
            <input
              type="password"
              required
              placeholder={t("confirmNewPassword")}
              onChange={(event) => setconfirmNewPassword(event.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            />
            {errorMessage && (
              <p className="text-red-500 mt-2 ml-2">{errorMessage}</p>
            )}
            <button
              onClick={() => handleCheckPassword()}
              disabled={sendOtpLoading}
              className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition"
            >
              {sendOtpLoading === true ? (
                <div role="status" className="w-fit mx-auto">
                  <svg
                    aria-hidden="true"
                    className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                </div>
              ) : (
                <span>{t("sendRequest")}</span>
              )}
            </button>

            {sendOtpLoading === false ?? (
              <div
                onClick={() => setIsChangePassword(false)}
                className="absolute top-3 right-3 cursor-pointer"
              >
                <img
                  src="/image/icon/close.png"
                  alt="Đóng"
                  className="w-4 opacity-70 hover:opacity-100 transition"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
