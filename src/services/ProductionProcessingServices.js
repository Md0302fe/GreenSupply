import axios from "axios";
export const axiosJWT = axios.create();

export const createProductionProcessing = async (data) => {
  const { access_token, dataRequest } = data;
  console.log(dataRequest);
  const res = await axiosJWT.post(
    `${process.env.REACT_APP_API_URL}/production-processing/create`,
    dataRequest,
    {
      headers: {
        token: `Bearer ${access_token}`,
      },
    }
  );
  return res?.data;
};

export const getAllProductionProcessing = async (filters, access_token) => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/production-processing/getAll`,
    {
      params: filters, // Gửi params lên server
      headers: { Authorization: `Bearer ${access_token}` },
    }
  );
  return res?.data?.requests;
};

export const getAllExecuteProcess = async (access_token) => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/production-processing/getAllExecuteProcess`,
    {
      headers: { Authorization: `Bearer ${access_token}` },
    }
  );
  return res?.data?.requests;
};
export const updateProductionRequest = async ({ id, token, dataUpdate }) => {
  // Giả sử BE có endpoint put /production-request/:id
  const res = await axios.put(
    `${process.env.REACT_APP_API_URL}/production-processing/${id}`,
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
    `${process.env.REACT_APP_API_URL}/production-processing/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data; 
};

export const approveProductionProcessing = async ({ id, token }) => {
  if (!id) {
    console.error("Lỗi: ID không tồn tại!");
    throw new Error("ID không hợp lệ");
  }

  console.log("Gửi yêu cầu API với ID:", id); // Debug ID

  const res = await axios.put(
    `${process.env.REACT_APP_API_URL}/production-processing/change-status/${id}`,
    {}, // Body cần có (ngay cả khi rỗng)
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data; 
};

export const getDetailsProcessByID = async (process_id, access_token) => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/production-processing/details/${process_id}`,
    {}, // Body cần có (ngay cả khi rỗng)
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
  return res.data; 
};

export const getProcessStageDetails = async (process_id, access_token) => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/production-processing/detailsStage/${process_id}`,
    {}, // Body cần có (ngay cả khi rỗng)
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
  return res.data; 
};

// Handle finish and next stept for process
export const handleFinishStage = async (dataRequest) => {
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/production-processing/finishStage`,
    { dataRequest }, // Body cần có (ngay cả khi rỗng)
    {
      headers: {
        Authorization: `Bearer ${dataRequest.access_token}`,
      },
    }
  );
  return res.data; 
};

// Handle finish and next stept for process
export const getHistoriesProcess = async (dataRequest) => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/production-processing/history_process`,
    {}, // Body cần có (ngay cả khi rỗng)
    {
      headers: {
        Authorization: `Bearer ${dataRequest.access_token}`,
      },
    }
  );
  return res.data; 
};
