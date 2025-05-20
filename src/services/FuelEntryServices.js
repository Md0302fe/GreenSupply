import axios from "axios";
export const axiosJWT = axios.create();

export const getAllFuelEntry = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const url = `${process.env.REACT_APP_API_URL}/fuel/fuel-list${
    query ? `?${query}` : ""
  }`;

  const res = await axiosJWT.get(url);
  return res?.data;
};

export const getFuelEntryDetail = async (id) => {
  // thông qua id , và access_token chỉ cho phép get dữ liệu của only user này
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/fuel/fuel-detail/${id}`
    );
    console.log("details provide", res.data);
    return res?.data;
  } catch (error) {
    console.log("Error :", error);
  }
};
