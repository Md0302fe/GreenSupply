import axios from "axios";

export const axiosJWT = axios.create(); 

export const getAllProducts = async () => {
  const res = await axiosJWT.get(`${process.env.REACT_APP_API_URL}/product/getAllProduct`, {
  });

  return res?.data?.products;
};
