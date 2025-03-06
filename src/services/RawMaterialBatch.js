import axios from "axios";
export const axiosJWT = axios.create();

export const getAllRawMaterialBatches = async () => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/raw-material-batch/getAllRawMaterialBatch`
  );
  return res?.data.requests;
};

export const getRawMaterialBatchById = async (id) => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/raw-material-batch/getRawMaterialBatchById/${id}`
  );
  return res?.data.batch;
};

export const getAllFuelTypes = async () => {
  const res = await axiosJWT.get(
    `${process.env.REACT_APP_API_URL}/fuel-management/getAll`
  );
  return res?.data;
};

export const getAllStorages = async () => {
  const res = await axiosJWT.get(
    `${process.env.REACT_APP_API_URL}/raw-material-batch/storages`
  );
  return res?.data;
};

export const generateBatchId = (prefix = "XMTH") => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Định dạng 2 số
  const day = String(today.getDate()).padStart(2, "0"); // Định dạng 2 số

  const batchNumber = Math.floor(Math.random() * 1000).toString().padStart(3, "0");

  return `${prefix}${year}${month}${day}-${batchNumber}`;
};

export const createRawMaterialBatch = async (dataResquest) => {
  const {formData} = dataResquest;
  const res = await axiosJWT.post(
    `${process.env.REACT_APP_API_URL}/raw-material-batch/createRawMaterialBatch`,
    { formData },
    {
      headers: {
        Authorization: `Bearer ${dataResquest.access_token}`,
      },
    }
  );
  return res?.data;
};

export const getAllProcessing = async (data) => {
  const { access_token, dataRequest } = data;
  const res = await axiosJWT.get(
    `${process.env.REACT_APP_API_URL}/product-request/getAllProcessing`,
    dataRequest,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res?.data;
};
