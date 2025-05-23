import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;
export const axiosJWT = axios.create();

export const getAllProvideOrders = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await axios.get(
      `${API_URL}/fuel-provide-orders?${queryParams}`
    );
    return response.data.requests;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách yêu cầu:", error);
    throw new Error("Không thể tải dữ liệu, vui lòng thử lại!");
  }
};

export const getProvideOrderHistories = async (access_token , user_id) => {
  try {
    const response = await axios.get(
      `${API_URL}/provide-order/provide-order-histories`,
      {
        params: {
          user_id: user_id,
        },
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("get success => ", response.data)
    return response.data.requests;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách yêu cầu:", error);
    throw new Error("Không thể tải dữ liệu, vui lòng thử lại!");
  }
};
