import axios from "axios";
export const axiosJWT = axios.create();

export const getAllFuelType = async (data) => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/fuel-management/getAll`,
  );

  return res?.data;
};
