import axios from "axios";
export const axiosJWT = axios.create();
// Tạo một instance Axios với cấu hình mặc định
export const axiosOrders = axios.create();

// Hàm lấy thông tin chi tiết đơn hàng
export const fetchOrderDetails = async (type, id) => {
  const res = await axiosOrders.get(`${process.env.REACT_APP_API_URL}/history/${type}/${id}`);
  return res?.data; // Giả sử dữ liệu trả về nằm trong response.data
};

export const getAllOrders = async (access_token) => {
  const res = await axiosJWT.get(
    `${process.env.REACT_APP_API_URL}/orders/fuel-requests`,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res?.data;
};


export const getAllProvideOrders = async (access_token) => {
  const res = await axiosJWT.get(
    `${process.env.REACT_APP_API_URL}/orders/fuel-supply-orders`,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );

  return res?.data;
};


export const getDetailOrders = async (id, access_token) => {
  // thông qua id , và access_token chỉ cho phép get dữ liệu của only user này
  try {
  

    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/orders/fuel-requests/${id}`
    );
     console.log("details order",res)
    return res?.data;
  } catch (error) {
    console.log("Error :", error);
  }
};

export const getDetailProvideOrders = async (id, access_token) => {
  // thông qua id , và access_token chỉ cho phép get dữ liệu của only user này
  try {
  

    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/orders/fuel-supply-orders/${id}`
    );
     console.log("details provide",res)
    return res?.data;
  } catch (error) {
    console.log("Error :", error);
  }
};

export const handleAcceptOrders = async (id,) => {
  // thông qua id , và access_token chỉ cho phép get dữ liệu của only user này
  try {
  

    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/orders/fuel-requests/${id}/accept`
    );
    return res?.data;
  } catch (error) { 
    console.log("Error :", error);
  }
};

export const handleAcceptProvideOrders = async (id,) => {
  // thông qua id , và access_token chỉ cho phép get dữ liệu của only user này
  try {
  

    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/orders/fuel-supply-orders/${id}/accept`
    );
    return res?.data;
  } catch (error) { 
    console.log("Error :", error);
  }
};



export const handleCancelOrders = async (id,) => {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/orders/fuel-requests/${id}/reject`
    );
    return res?.data;
  } catch (error) {
    console.log("Error:", error);
  }
};
export const handleCancelProvideOrders = async (id,) => {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/orders/fuel-supply-orders/${id}/reject`
    );
    return res?.data;
  } catch (error) {
    console.log("Error:", error);
  }
};

export const handleCompleteOrders = async (id) => {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/orders/fuel-requests/${id}/complete`
    );
    return res?.data;
  } catch (error) {
    console.log("Error :", error);
  }
};

export const handleCompleteProvideOrders = async (id) => {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/orders/fuel-supply-orders/${id}/complete`
    );
    return res?.data;
  } catch (error) {
    console.log("Error :", error);
  }
};







