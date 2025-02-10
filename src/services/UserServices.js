import axios from "axios";
export const axiosJWT = axios.create();

export const userLogin = async (data) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/user/sign-in`,
    data
  );
  return res?.data;
};
export const checkEmail = async (data) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/user/check-email`,
    data
  );
  return res?.data;
};
export const checkPassword = async (data) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/user/check-password`,
    data
  );
  return res?.data;
};
export const checkOtp = async (data) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/user/check-otp`,
    data
  );
  return res?.data;
};
export const checkOtpChangePassword = async (data) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/user/check-otp-change-password`,
    data
  );
  return res?.data;
};
export const updatePassword = async (data) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/user/update-password`,
    data
  );
  return res?.data;
};
export const sendOtp = async (data) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/user/create-otp`,
    data
  );
  return res?.data;
};

export const userRegister = async (data) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/user/sign-up`,
    data
  );
  return res?.data;
};
export const completeProfile = async (data) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/user/complete-profile`,
    data
  );
  return res?.data;
};

export const getDetailsUser = async (id, access_token) => {
  // thông qua id , và access_token chỉ cho phép get dữ liệu của only user này
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_API_URL}/user/detail-user/${id}`,
      {
        headers: {
          token: `Bearer ${access_token}`,
        },
      }
    );
    return res?.data;
  } catch (error) {
    console.log("Error :", error);
  }
};

export const refreshToken = async () => {
  // thông qua id , và access_token chỉ cho phép get dữ liệu của only user này
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/user/refresh-token`,
    {
      withCredentials: true,
    }
  );
  return res?.data;
};

export const logoutUser = async () => {
  // gọi api / clearCookie("refresh_token") ;
  const res = await axios.post(`${process.env.REACT_APP_API_URL}/user/log-out`);
  return res.data;
};

export const getAllUser = async (access_token) => {
  // gọi api / clearCookie("refresh_token") ;
  const res = await axiosJWT.get(
    `${process.env.REACT_APP_API_URL}/user/getAll`,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res?.data;
};

export const updateUser = async (data) => {
  // gọi api / clearCookie("refresh_token") ;
  const res = await axiosJWT.put(
    `${process.env.REACT_APP_API_URL}/user/update-user/${data?.id}`,
    data.data,
    {
      headers: {
        token: `Bearer ${data?.access_token}`,
      },
    }
  );
  return res?.data;
};
export const updateAccount = async (data) => {
  // gọi api / clearCookie("refresh_token") ;
  const res = await axiosJWT.put(
    `${process.env.REACT_APP_API_URL}/user/update-account/${data?.id}`,
    data.data,
    {
      headers: {
        token: `Bearer ${data?.access_token}`,
      },
    }
  );
  return res?.data;
};

export const blockUser = async (id, access_token) => {
  // gọi api / clearCookie("refresh_token") ;
  const res = await axiosJWT.put(
    `${process.env.REACT_APP_API_URL}/user/block-user/${id}`,
    {},
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  console.log("Respone Data From Delete User : ", res);
  return res?.data;
};

export const unBlockUser = async (id, access_token) => {
  // gọi api / clearCookie("refresh_token") ;
  const res = await axiosJWT.put(
    `${process.env.REACT_APP_API_URL}/user/unblock-user/${id}`,
    {},
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res?.data;
};

// -----------------------FUNCTION---------------------- //
/* 
Gọi API update-user: Khi bạn gọi API update-user, nếu token vẫn hợp lệ, yêu cầu sẽ được gửi đi ngay lập tức.

Token hết hạn: Nếu token đã hết hạn (thường trả về mã lỗi 401 - Unauthorized),
interceptor mà bạn đã cấu hình sẽ tự động can thiệp.

Refresh token: Interceptor kiểm tra và gọi API để refresh token (thông qua refresh token).
Sau khi có token mới, interceptor sẽ tự động thêm token mới vào request ban đầu (/user/update-user/:id)
và gửi lại yêu cầu.

*/
