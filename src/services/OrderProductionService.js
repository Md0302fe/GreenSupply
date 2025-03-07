import axios from "axios";

const API_URL = "http://localhost:3001/api/orders-production";
export const axiosJWT = axios.create();

export const createOrderProduction = async (orderData) => {
  try {
    console.log("Gửi request đến API:", `${API_URL}/orders-production/createOrderProduction`, orderData);
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/orders-production/createOrderProduction`,
      orderData,
    );
    console.log("Kết quả từ API:", response.data);  
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng sản xuất:", error);
    throw new Error(error.response?.data?.message || "Có lỗi xảy ra!");
  }
};

export const getAllOrders = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString(); 
    const response = await axios.get(`${API_URL}/getAllOrders?${queryParams}`);
    return response.data.orders; 
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    throw new Error("Không thể tải dữ liệu, vui lòng thử lại!");
  }
};

