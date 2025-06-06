import axios from "axios";
export const axiosJWT = axios.create();

export const getAllFuelEntry = async (params = {}, access_token , user_id) => {
  const query = new URLSearchParams(params).toString();
  const url = `${process.env.REACT_APP_API_URL}/fuel/fuel-list${
    query ? `?${query}` : ""
  }`;

  const res = await axiosJWT.get(url, {
    params: {
      user_id: user_id,
    },
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
  });
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
