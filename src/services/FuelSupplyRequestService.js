import axios from "axios";
const API_URL = "http://localhost:3001/api/fuel-supply-request";
export const axiosJWT = axios.create();

export const createFuelSupplyRequest = async (supplyRequest) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/fuel-supply-request/createFuelSupplyRequest`,
      supplyRequest
      // { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo:", error);
    throw new Error(error.response?.data?.message || "Có lỗi xảy ra!");
  }
};

export const getAllFuelSupplyRequest = async (access_token, user_id) => {
  try {
    const response = await axios.get(`${API_URL}/getAllFuelSupplyRequest`, {
      params: {
        user_id: user_id,
      },
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data.requests;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách yêu cầu:", error);
    throw new Error("Không thể tải dữ liệu, vui lòng thử lại!");
  }
};

export const updateFuelSupplyRequest = async (id, updatedData) => {
  try {
    const response = await axios.put(
      `${API_URL}/updateFuelSupplyRequest/${id}`,
      updatedData,
      { headers: { "Content-Type": "application/json" } }
    );

    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật:", error);
    throw new Error(error.response?.data?.message || "Có lỗi xảy ra!");
  }
};

export const deleteFuelRequest = async (id) => {
  try {
    const response = await axios.put(
      `${API_URL}/deleteFuelSupplyRequest/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi hủy yêu cầu:", error);
    throw new Error(error.response?.data?.message || "Có lỗi xảy ra!");
  }
};

export const getFuelSupplyRequestById = async (access_token, id) => {
  try {
    const response = await axios.get(
      `${API_URL}/getFuelSupplyRequestById/${id}`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );
    return response.data.request;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết yêu cầu:", error);
    throw new Error(
      "Không thể lấy dữ liệu yêu cầu cung cấp, vui lòng thử lại!"
    );
  }
};
