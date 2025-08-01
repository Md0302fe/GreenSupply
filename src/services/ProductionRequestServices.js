import axios from "axios";
export const axiosJWT = axios.create();

export const createProductionRequest = async (data) => {
  const { access_token, dataRequest } = data;
  const res = await axiosJWT.post(
    `${process.env.REACT_APP_API_URL}/product-request/createProductionRequest`,
    dataRequest,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res?.data;
};
// get all 
export const getAll = async (data) => {
  const { access_token, dataRequest } = data;
  const res = await axiosJWT.get(
    `${process.env.REACT_APP_API_URL}/product-request/getAll`,
    dataRequest,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res?.data;
};

//  get all with status : "Đã duyệt"
export const getAllv2 = async (data) => {
  const { access_token, dataRequest } = data;
  const res = await axiosJWT.get(
    `${process.env.REACT_APP_API_URL}/product-request/get-production-requests`,
    dataRequest,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res?.data;
};

export const getAllProcessing = async (data) => {
  const { access_token} = data;
  const res = await axiosJWT.get(
    `${process.env.REACT_APP_API_URL}/product-request/getAllProcessing`,{},
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res?.data;
};

export const updateProductionRequest = async ({ id, token, dataUpdate }) => {
  // Giả sử BE có endpoint put /production-request/:id
  const res = await axios.put(
    `${process.env.REACT_APP_API_URL}/product-request/${id}`,
    dataUpdate,
    {
      headers: {
        token: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

export const deleteProductionRequest = async ({ id, token }) => {
  const res = await axios.delete(
      `${process.env.REACT_APP_API_URL}/product-request/${id}`,
      {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      }
  );
  return res.data; // { success: true/false, ...}
};

export const changeStatus = async ({ id, token }) => {
  const res = await axios.put(
      `${process.env.REACT_APP_API_URL}/product-request/change-status/${id}`,
      {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      }
  );
  return res.data; // { success: true/false, ...}
};

export const getProductionChartData = async ({ access_token }) => {
  const res = await axiosJWT.get(
    `${process.env.REACT_APP_API_URL}/product-request/getProductionChartData`,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};

// get product by id

export const getProductById = async ({ access_token }) => {
  const res = await axiosJWT.get(
    `${process.env.REACT_APP_API_URL}/product-request/getProductionChartData`,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res.data;
};

