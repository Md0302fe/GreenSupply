import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;
export const axiosJWT = axios.create();

export const createHarvestRequest = async (harvestRequest) => {
  try {
    const response = await axios.post(
      `${API_URL}/harvest-request/createHarvestRequest`,
      harvestRequest,
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo:", error);
    throw new Error(error.response?.data?.message || "Có lỗi xảy ra!");
  }
};

// Havest request order list
export const getAllHarvestRequests = async () => {
  try {
    const response = await axios.get(`${API_URL}/harvest-request/getAllHarvestRequests`);
    return response.data.requests;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách yêu cầu:", error);
    throw new Error("Không thể tải dữ liệu, vui lòng thử lại!");
  }
};

export const updateHarvestRequest = async (id, updatedData) => {
  try {
    const response = await axios.put(
      `${API_URL}/harvest-request/updateHarvestRequest/${id}`,
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
    const response = await axios.put(`${API_URL}/harvest-request/cancelHarvestRequest/${id}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi hủy yêu cầu:", error);
    throw new Error(error.response?.data?.message || "Có lỗi xảy ra!");
  }
};

// Get Harvest Request Histories
export const getHarvestRequestHistory = async (access_token , user_id) => {
  try {
    const response = await axios.get(`${API_URL}/harvest-request/getHarvestRequestHistories`,
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
    return response.data.requests;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách yêu cầu:", error);
    throw new Error("Không thể tải dữ liệu, vui lòng thử lại!");
  }
};