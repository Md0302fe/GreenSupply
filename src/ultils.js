import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// check JSON string
export const isJsonString = (data) => {
  try {
    // chuyển đổi json thành 1 đối tượng js
    JSON.parse(data);
  } catch (error) {
    return false;
  }
  return true;
};

// get base x64
export const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

// Conver Price from ',' to '.'
export const convertPrice = (price) => {
  try {
    // pass price
    const result = price.toLocaleString().replaceAll(",", ".");
    return result;
  } catch (error) {
    return null;
  }
};

export const converDateString = (dateString) => {
  try {
    if (!dateString) return "Chưa diễn ra";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Thời gian không hợp lệ";

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.log("Lỗi trong quá trình convert thời gian : ", error);
    return "Lỗi xử lý thời gian";
  }
};
// Convert Date To String 
export const convertDateStringV1 = (dateString) => {
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`; // Chỉ lấy ngày-tháng-năm
  } catch (error) {
    console.log("Lỗi trong quá trình convert thời gian: ", error);
    return ""; // Tránh lỗi hiển thị nếu có lỗi
  }
};

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
