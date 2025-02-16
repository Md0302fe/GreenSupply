import axios from "axios";
const API_URL = "http://localhost:3001/api/fuel-supply-request";
export const axiosJWT = axios.create();

export const createFuelSupplyRequest = async (supplyRequest) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/fuel-supply-request/createFuelSupplyRequest`,
      supplyRequest,
      // { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo:", error);
    throw new Error(error.response?.data?.message || "Có lỗi xảy ra!");
  }
};

export const getAllSupplyRequest = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await axios.get(
      `${API_URL}/getAllSupplyRequest?${queryParams}`
    );
    return response.data.requests;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách yêu cầu:", error);
    throw new Error("Không thể tải dữ liệu, vui lòng thử lại!");
  }
};

export const updateSupplyRequest = async (id, updatedData) => {
  try {
    const response = await axios.put(
      `${API_URL}/updateSupplyRequest/${id}`,
      updatedData,
      { headers: { "Content-Type": "application/json" } }
    );

    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật:", error);
    throw new Error(error.response?.data?.message || "Có lỗi xảy ra!");
  }
};

export const cancelSupplyRequest = async (id) => {
  try {
    const response = await axios.put(`${API_URL}/cancelSupplyRequest/${id}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi hủy yêu cầu:", error);
    throw new Error(error.response?.data?.message || "Có lỗi xảy ra!");
  }
};