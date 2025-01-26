import React, { useEffect, useState } from "react";
import Loading from "../LoadingComponent/Loading";
import * as UserServices from "../../services/UserServices";
import "./Login.scss";
// react - ui
import { useMutationHooks } from "../../hooks/useMutationHook";
import { AiFillCloseSquare } from "react-icons/ai";
import { TbFaceIdError } from "react-icons/tb";
import { RxCheckCircled } from "react-icons/rx";
// JWT
import { jwtDecode } from "jwt-decode";
// react redux
import { useDispatch } from "react-redux";
import { updateUser } from "../../redux/slides/userSlides";

// image
import backgroundRegister from "../../assets/image/background_login.png";


const Login = ({
  isLoginActive,
  setLoginHiddent,
  setRegisterActive,
  setActive,
  active,
}) => {
  // Variables
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [stateNotification, setStateNotification] = useState(false);
  const dishpatch = useDispatch();

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

  // USER INFOMATIONS
  const handleGetDetailsUser = async (id, token) => {
    const res = await UserServices.getDetailsUser(id, token);
    dishpatch(updateUser({ ...res?.data, access_token: token }));
  };

  // CLICK BTN LOGIN
  const handleLogin = async () => {
    const data = { email, password };
    mutation.mutate(data);
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
      className={`login-container overlay-all flex-center-center ${isLoginActive && active ? "active" : "hiddent"
        } `}
    >
      {/* Wrapper Login */}
      <div className="Login-wapper Width items-center bg-cover max-w-full w-full h-full grid md:grid-cols-2"
        style={{ backgroundImage: `url("${backgroundRegister}")` }}>
        <div className="Info-Sign-In bg-white rounded-2xl pt-12 pb-6  md:ml-8 w-11/12 lg:w-8/12 mx-auto">
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
            <div className="forget-password">
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
        {/* Button Close Form */}
        <AiFillCloseSquare
          className="btn-close-form"
          onClick={() => handleClickCloseBtn()}
        ></AiFillCloseSquare>
      </div>
    </div>
  );
};

export default Login;
