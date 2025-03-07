import axios from "axios";

const API_URL = "http://localhost:3001/api";

export const getUserAddresses = async (userId) => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/user-addresses?user_id=${userId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách địa chỉ:", error);
    throw new Error(error.response?.data?.message || "Có lỗi xảy ra!");
  }
};
