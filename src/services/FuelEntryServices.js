import axios from "axios";
export const axiosJWT = axios.create();

export const getAllFuelEntry = async () => {
  const res = await axiosJWT.get(
    `${process.env.REACT_APP_API_URL}/fuel/fuel-list`,
  );

  return res?.data;
};






