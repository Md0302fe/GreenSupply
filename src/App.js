import React, { useEffect, useState } from "react";
import * as UserServices from "./services/UserServices";

import { jwtDecode } from "jwt-decode";
import { isJsonString } from "./ultils";
import { ToastContainer } from "react-toastify";
import { Outlet, useMatch } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateUser } from "./redux/slides/userSlides";

import Header from "./components/HeaderComponent/Header";
import Footer from "./components/FooterComponent/Footer";
import Loading from "./components/LoadingComponent/Loading";

const App = ({ loginActive }) => {
  // dispatch
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  // Bạn có thể sử dụng useMatch để kiểm tra xem route có phải là route của ProductDetails không.
  const match = useMatch("/Product-Detail/:id"); // Kiểm tra route

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    console.log("Token khi load lại trang:", token); // Kiểm tra token sau khi reload
  }, []);
  

  // Effect 1
  useEffect(() => {
    setIsLoading(true);
    // nhận token về
    const { storageData, decoded } = handleDecoded();
    // kiểm tra decoded có tồn tại hay không --> check token trên localStorage.
    if (decoded?.id) {
      // nếu có decoded (chuỗi token sau mã hóa) --> gọi hàm lấy thông tin người dùng.
      handleGetDetailsUser(decoded?.id, storageData);
    }
    setIsLoading(false);
  }, []);


  // Function 8
  const handleDecoded = () => {
    // nhận token về [token này đã có khi người dùng login]
    let storageData = localStorage.getItem("access_token");
    let decoded = {};
    if (storageData && isJsonString(storageData)) {
      // parse dữ liệu thành đối tượng JavaScript , ở đây là chuỗi token.
      storageData = JSON.parse(storageData);
      // giải mã token - get data từ cái token - sinh ra ngay từ lúc user Login
      decoded = jwtDecode(storageData);
    }
    return { decoded, storageData };
  };

  // USER INFOMATIONS // handleGetDetailsUser để lấy thông tin người dùng từ server.
  const handleGetDetailsUser = async (id, token) => {
    const res = await UserServices.getDetailsUser(id, token);
    // dispatch để gửi action updateUser đến Redux để cập nhật thông tin người dùng trong state.
    dispatch(updateUser({ ...res?.data, access_token: token }));
  };

  // Function 7
  UserServices.axiosJWT.interceptors.request.use(
    async (config) => {
      const { decoded } = handleDecoded();
      const currentTime = new Date();
      if (decoded?.exp < currentTime.getTime() / 1000) {
        const data = await UserServices.refreshToken();
        config.headers["token"] = `Bearer ${data?.access_token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );


  return (
    <div>
      <Loading isPending={isLoading}>
        <div>
          {/* Header-App */}
          <div className="header-container mb-5">
            <Header></Header>

            {/* <div className="navigation-container">
              <Navigation></Navigation>
            </div> */}
          </div>

          {/* Main-Body-App */}
          <div className="main-container">
            {/* main-content */}
            <div className="app-content">
              {match ? (
                <Outlet></Outlet>
              ) : (
                <Outlet></Outlet>
              )}
            </div>
          </div>
          {/* Footer */}
          <Footer></Footer>
        </div>
      </Loading>

      {/* Footer App */}
      <div className="footer"></div>

      {/* TOAST - Notification */}
      <ToastContainer
        hideProgressBar={false}
        position="top-right"
        newestOnTop={false}
        pauseOnFocusLoss
        autoClose={3000}
        closeOnClick
        pauseOnHover
        theme="light"
        rtl={false}
        draggable
      />
    </div>
  );
};

export default App;

/* THÔNG TIN CÁC HÀM HERE */
/* 

Function 7 :
CÁI HÀM NÀY NÓ SẼ GET TOKEN ĐANG CÓ TRÊN HEADERS , sao đó kiểm tra xem TOKEN còn hoạt động hay không
NẾU KHÔNG HOẠT ĐỘNG SẼ CẤP LẠI 1 ACCESS_TOKEN mới (axiosJWT) --> CẤP TOKEN MỚI ĐỒNG NGHĨA GET lại DETAILS USER Ở TRANG HEADER.
axiosJWT.interceptors.request.use() : thiết lập 1 config giúp call lại token đã hết hạn mà k cần phải gọi lại hàm refresh_token
  // Function 7
  UserServices.axiosJWT.interceptors.request.use(
    async (config) => {
      const { decoded } = handleDecoded();
      const currentTime = new Date();
      if (decoded?.exp < currentTime.getTime() / 1000) {
        const data = await UserServices.refreshToken();
        config.headers["token"] = `Bearer ${data?.access_token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
*/
