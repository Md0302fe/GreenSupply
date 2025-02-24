import axios from "axios";
export const axiosJWT = axios.create();

export const createPurchaseOrder = async (data) => {
  const { access_token, dataRequest } = data;
  const res = await axiosJWT.post(
    `${process.env.REACT_APP_API_URL}/purchase-order/createPurchaseOrder`,
    dataRequest,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res?.data;
};

export const getAllPurchaseOrder = async (data) => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/purchase-order/getAllPurchaseOrder`
  );
  return res?.data;
};

export const getDetailPurchaseOrder = async (id, access_token) => {
  // thông qua id , và access_token chỉ cho phép get dữ liệu của only user này
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_API_URL}/purchase-order/getPurchaseOrderDetail/${id}`,
      {
        headers: {
          token: `Bearer ${access_token}`,
        },
      }
    );
    return res?.data;
  } catch (error) {
    console.log("Error :", error);
  }
};