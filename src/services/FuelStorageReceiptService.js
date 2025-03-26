import axios from "axios";
export const axiosJWT = axios.create();

export const getTotalFuelStorageReceipts = async () => {
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_API_URL}/fuel-storage/getTotalFuelStorageReceipts`
    );

    return res?.data?.data || {};
  } catch (error) {
    console.error("Lỗi khi gọi API lấy tổng số đơn:", error);
    throw new Error("Không thể lấy dữ liệu tổng số đơn");
  }
};

export const getStockImportByDate = async () => {
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_API_URL}/fuel-storage/getStockImportByDate`
    );

    return res?.data?.data || [];
  } catch (error) {
    console.error("Lỗi khi gọi API lấy số lượng nhập kho:", error);
    throw new Error("Không thể lấy dữ liệu số lượng nhập kho");
  }
};

export const getStockImportCompletedByDate = async () => {
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_API_URL}/fuel-storage/getStockImportCompletedByDate`
    );
    return res?.data?.data || [];
  } catch (error) {
    console.error("Lỗi khi gọi API lấy số lượng nhập kho hoàn thành:", error);
    throw new Error("Không thể lấy dữ liệu số lượng nhập kho hoàn thành");
  }
};
