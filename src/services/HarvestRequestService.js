import axios from "axios";
const API_URL = "http://localhost:3001/api/harvest-request";
export const axiosJWT = axios.create();

export const createHarvestRequest = async (harvestRequest) => {
  try {
    const response = await axios.post(
      `${API_URL}/createHarvestRequest`,
      harvestRequest,
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo:", error);
    throw new Error(error.response?.data?.message || "Có lỗi xảy ra!");
  }
};

export const getAllHarvestRequests = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await axios.get(
      `${API_URL}/getAllHarvestRequests?${queryParams}`
    );
    return response.data.requests;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách yêu cầu:", error);
    throw new Error("Không thể tải dữ liệu, vui lòng thử lại!");
  }
};

export const updateHarvestRequest = async (id, updatedData) => {
  try {
    const response = await axios.put(
      `${API_URL}/updateHarvestRequest/${id}`,
      updatedData,
      { headers: { "Content-Type": "application/json" } }
    );

    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật:", error);
    throw new Error(error.response?.data?.message || "Có lỗi xảy ra!");
  }
};

export const cancelHarvestRequest = async (id) => {
  try {
    const response = await axios.put(`${API_URL}/cancelHarvestRequest/${id}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi hủy yêu cầu:", error);
    throw new Error(error.response?.data?.message || "Có lỗi xảy ra!");
  }
};
