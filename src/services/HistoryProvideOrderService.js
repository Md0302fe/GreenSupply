import axios from "axios";
const API_URL = "http://localhost:3001/api/provide-order";
export const axiosJWT = axios.create();

export const getAllProvideOrders= async (filters = {}) => {
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

