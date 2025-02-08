import axios from "axios";
const API_URL = "http://localhost:3001/api/supply-request";
export const axiosJWT = axios.create();

export const createSupplyRequest = async (supplyRequest) => {
  try {
    const response = await axios.post(
      `${API_URL}/createSupplyRequest`,
      supplyRequest,
      // { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo:", error);
    throw new Error(error.response?.data?.message || "Có lỗi xảy ra!");
  }
};