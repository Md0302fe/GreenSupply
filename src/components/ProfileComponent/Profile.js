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

import { toast } from "react-toastify";
import { Upload } from "antd";
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
  WrapperProfileTitle,
  WrapperProfileUser,
} from "./styles";

import userImage from "../../assets/DefaultUser.jpg";

const ProfilePage = () => {
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

  const navigate = useNavigate();
  const dishpatch = useDispatch();
  const location = useLocation();

  // kiểm tra state từ phía Payment
  const fromPayment = location.state?.fromPayment;

  // 2: Mutation
  const mutation = useMutationHooks((Res) => {
    const { id, access_token, data } = Res;
    return UserServices.updateUser({ id, data, access_token });
  });
  const { isPending, isSuccess, data } = mutation;

  const formatDateForInput = (date) => {
    if (!date) return "";
    return date.split("T")[0]; // Lấy phần YYYY-MM-DD từ "YYYY-MM-DDTHH:MM:SS.ZZZZ"
  };

  ////Hàm check name
  const validateFullName = (name) => {
    if (!name.trim()) {
      return "Tên không được để trống.";
    }

    if (name.length < 2 || name.length > 50) {
      return "Tên phải có từ 2 đến 40 ký tự.";
    }

    if (/\d/.test(name)) {
      return "Tên không được chứa số.";
    }

    return ""; // Hợp lệ
  };

  ////Hàm check email
  const validateEmail = (email) => {
    if (!email.trim()) {
      return "Email không được để trống.";
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      return "Email không hợp lệ.";
    }

    return ""; // Hợp lệ
  };

  ///Hàm check phone
  const validatePhone = (phone) => {
    if (!phone.trim()) {
      return "Số điện thoại không được để trống.";
    }
    if (phone.includes("-")) return "Số điện thoại không thể là số âm.";

    // if (!/^(03|05|07|08|09)\d{8}$/.test(phone)) {
    //   return "Số điện thoại phải có 10 số và bắt đầu bằng 03, 05, 07, 08 hoặc 09.";
    // }

    if (phone.length !== 10) {
      return "Số điện thoại phải có đúng 10 số.";
    }

    

    return ""; // Hợp lệ
  };

  ///////hàm check giới tính
  const validateGender = (gender) => {
    const validGenders = ["Nam", "Nữ", "Khác"];
    
    if (!gender.trim()) {
        return "Giới tính không được để trống.";
    }

    const formattedGender = gender.trim().charAt(0).toUpperCase() + gender.trim().slice(1).toLowerCase(); // Chuyển chữ cái đầu thành viết hoa

    if (!validGenders.includes(formattedGender)) {
        return "Giới tính chỉ có thể là 'Nam', 'Nữ' hoặc 'Khác'.";
    }

    return ""; // Hợp lệ
};


  // 3: useEffect
  useEffect(() => {
    if (isSuccess) {
      if (data?.status === "OK") {
        toast.success(data?.message);
        handleGetDetailsUser(userRedux?.id, userRedux?.access_token);
      } else if (data?.status === "ERROR") {
        toast.error(data?.message);
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

  const validateBirthDay = (date) => {
    if (!date) {
      setBirthDayError(""); // Không có lỗi nếu người dùng chưa nhập gì
      return true;
    }

    const today = new Date(); // Ngày hiện tại
    const selectedDate = new Date(date);

    if (selectedDate > today) {
      setBirthDayError("Ngày sinh không được lớn hơn ngày hiện tại");
      return false;
    }

    setBirthDayError(""); // Xóa lỗi nếu hợp lệ
    return true;
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
                          User Profile
                        </MDBBreadcrumbItem>
                      </div>
                      {fromPayment && (
                        <div>
                          <MDBBreadcrumbItem>
                            <span
                              onClick={() => navigate("/Payment")}
                              className="cursor-pointer border-b border-black uppercase transition-all duration-200 hover:text-[17px]"
                            >
                              Tiếp tục mua hàng
                            </span>
                          </MDBBreadcrumbItem>
                        </div>
                      )}
                    </MDBBreadcrumb>
                  </MDBCol>
                </MDBRow>
                <MDBRow>
                  <MDBCol lg="4">
                    <FlexCenterCenterCol className="mb-4">
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
                            LƯU THÔNG TIN
                          </MDBBtn>
                        </FlexCenterCenter>
                      </CardBodys>
                    </FlexCenterCenterCol>
                    <FlexCenterCenterCol className="mb-4">
                      {/* avatar here */}
                      <CardBodys>
                        <FlexCenterCenter>
                          <MDBBtn onClick={() => navigate("/Address")}>
                            Danh Sách Địa Chỉ
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
                            <MDBCardText>Tên</MDBCardText>
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
                            <MDBCardText>Email</MDBCardText>
                          </MDBCol>
                          <MDBCol sm="9">
                            <MDBCardText className="flex justify-center items-center h-[20px] max-w-full text-muted">
                              <InPut
                                type="email"
                                value={email}
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
                            <MDBCardText>Số điện thoại</MDBCardText>
                          </MDBCol>
                          <MDBCol sm="9">
                            <MDBCardText className="flex justify-center items-center h-[20px] max-w-full text-muted">
                              <InPut
                                type="text"
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
                            <MDBCardText>Ngày sinh</MDBCardText>
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
                            <MDBCardText>Giới tính</MDBCardText>
                          </MDBCol>
                          <MDBCol sm="9">
                            <InPut
                              type="text"
                              value={gender}
                              onChange={(e) =>
                                handleChangeGender(e.target.value)
                              }
                            />
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
                            <MDBCardText>Avatar</MDBCardText>
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
    </div>
  );
};

export default ProfilePage;
