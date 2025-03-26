import axios from "axios";

const API_URL = "http://localhost:3001/api/product-orders";
export const axiosJWT = axios.create();



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


export const getAllOrdersDetail = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/order-detail/${id}`);
    return response.data; 
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
    throw new Error("Không thể tải dữ liệu, vui lòng thử lại!");
  }
};


// Cập nhật trạng thái thành "Đang xử lý"
export const updateOrderProcessing = async (orderId) => {
  try {
    const response = await axios.put(`${API_URL}/order-processing/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái Đang xử lý:", error);
    throw error;
  }
};

// Cập nhật trạng thái thành "Đang vận chuyển"
export const updateOrderShipping = async (orderId) => {
  try {
    const response = await axios.put(`${API_URL}/order-shipping/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái Đang vận chuyển:", error);
    throw error;
  }
};

// Cập nhật trạng thái thành "Đã giao hàng"
export const updateOrderDelivered = async (orderId) => {
  try {
    const response = await axios.put(`${API_URL}/order-delivered/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái Đã giao hàng:", error);
    throw error;
  }
};






