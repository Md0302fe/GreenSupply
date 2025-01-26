import React, { useEffect, useState } from "react";
import "./Login.scss";
import { AiFillCloseSquare } from "react-icons/ai";
import backgroundRegister from "../../assets/image/background_login.png";
import * as UserServices from "../../services/UserServices";
import { useMutationHooks } from "../../hooks/useMutationHook";
import Loading from "../LoadingComponent/Loading";

import { TbFaceIdError } from "react-icons/tb";
import { RxCheckCircled } from "react-icons/rx";

const Register = ({
  setLoginActive,
  isRegisterActive,
  setRegisterHiddent,
  setActive,
  active,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [role_check, setRoleCheck] = useState(false);
  const [gender, setGender] = useState("");

  const mutation = useMutationHooks((data) => UserServices.userRegister(data));
  const { isPending, data, isSuccess } = mutation;

  useEffect(() => {
    if (isSuccess && data.status === "OK") {
      setTimeout(() => {
        setLoginActive();
        setRegisterHiddent();
      }, 1500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  // Click Submit Sau Khi Điền Form
  const HandleSubmitFormRegister = () => {
    const data = { name, email, password, confirmPassword, phone, date, role_check, gender };
    mutation.mutate(data);
  };

  // Click Btn Đóng Form
  const handleClickCloseBtn = () => {
    setRegisterHiddent();
    setActive(false);
  };

  // Clik Btn Đăng Nhập
  const handleSignIn = () => {
    setLoginActive();
    setRegisterHiddent();
  };

  return (
    <div
      className={`login-container overlay-all flex-center-center ${active && isRegisterActive ? "active" : "hiddent"
        } `}
    >
      <div className="Login-wapper Width items-center bg-cover max-w-full w-full h-full grid grid-cols-2"
        style={{ backgroundImage: `url("${backgroundRegister}")` }}
      >
        {/* Button Close Form */}
        <AiFillCloseSquare
          className="btn-close-form"
          onClick={() => handleClickCloseBtn()}
        ></AiFillCloseSquare>

        <div className="Info-Sign-In  bg-white rounded-2xl pb-4 md:ml-8 w-11/12 lg:w-8/12 mx-auto">
          <div className="col-4 mx-auto py-2 pt-4 font-bold text-3xl text-center text-supply-primary mb-4">Đăng Ký</div>
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
                className="border-[1px] shadow-[inset_1px_1px_2px_1px_#00000024] border-supply-primary text-black"
                value={password}
                placeholder="Mật khẩu"
                onChange={(event) => setPassword(event.target.value)}
                required
              />
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
              {/* <label>
                Phone <span style={{ color: "red" }}>*</span>
              </label> */}
              <input
                type={"text"}
                className="border-[1px] shadow-[inset_1px_1px_2px_1px_#00000024] border-supply-primary text-black"
                value={phone}
                placeholder="Số điện thoại"
                onChange={(event) => setPhone(event.target.value)}
                required
              ></input>
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
                type={"date"}
                className="border-[1px] shadow-[inset_1px_1px_2px_1px_#00000024] border-supply-primary text-black "
                id="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              ></input>
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

            <Loading isPending={isPending}>
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
                  onClick={() => HandleSubmitFormRegister()}
                >
                  Đăng ký
                </button>
              </div>
            </Loading>
          </div>
          <div className="mt-4 text-center">
            <p>Bạn đã có tài khoản <span onClick={() => handleSignIn()} className="text-supply-primary underline cursor-pointer">Đăng nhập</span></p>
            <p className="text-[8px]">@2025 bản quyền thuộc về Green supply</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center text-center">
          <img src="image/logo-white.png" alt="" />
          <p className="text-white font-semibold text-3xl">Giải pháp hiệu quả <br /> dành cho nông sản của bạn</p>
          <div className="flex items-center gap-3 justify-center mt-3">
            <img src="image/icon/fb.png" alt="" />
            <img src="image/icon/yt.png" alt="" />
            <img src="image/icon/tt.png" alt="" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
