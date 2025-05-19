import axios from "axios";
export const axiosJWT = axios.create();

export const createMaterialStorageExport = async (dataRequest) => {
  const access_token = localStorage
    .getItem("access_token")
    ?.replace(/^"(.*)"$/, "$1");

  const res = await axiosJWT.post(
    `${process.env.REACT_APP_API_URL}/material-storage-export/createRawMaterialBatch`,
    dataRequest,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res?.data;
};


export const getAllBatchStorageExportHistory = async (dataRequest) => {
  const {access_token} = dataRequest;
  const res = await axiosJWT.get(
    `${process.env.REACT_APP_API_URL}/batch-history/getAllBatchStorageExportHistory`,
    {},
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res?.data;
};

export const getAllBatchStorageExportHistoryDetail = async (storage_export_id,access_token) => {
  const dataRequest = {storage_export_id}
  const res = await axiosJWT.post(
    `${process.env.REACT_APP_API_URL}/batch-history/getBatchStorageExportDetails`,
    {dataRequest},
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return res?.data;
};

export const getAllBatchStorageExport = async (dataRequest) => {
  const {access_token} = dataRequest;
  const res = await axiosJWT.get(
    `${process.env.REACT_APP_API_URL}/material-storage-export/getAllRawMaterialBatch`,
    {},
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res?.data;
};



export const handleAcceptMaterialExport = async (data) => {
  const {access_token , storage_export_id} = data
 
  const res = await axiosJWT.post(
    `${process.env.REACT_APP_API_URL}/material-storage-export/accept_storage_export`,
    {storage_export_id},
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res?.data;
};

export const handleRejectMaterialExport = async (data) => {
  const {access_token , storage_export_id} = data
 
  const res = await axiosJWT.post(
    `${process.env.REACT_APP_API_URL}/material-storage-export/reject_storage_export`,
    {storage_export_id},
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res?.data;
};

// Dashboard
export const getTotalMaterialStorageExports = async () => {
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_API_URL}/material-storage-export/getTotalMaterialStorageExports`
    );
    return res?.data?.data || {}; 
  } catch (error) {
    console.error("Lỗi khi gọi API lấy tổng số đơn xuất kho:", error);
    throw new Error("Không thể lấy dữ liệu tổng số đơn xuất kho");
  }
};

export const getStockImportByDate = async () => {
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_API_URL}/material-storage-export/getStockExportByDate`
    );
    return res?.data?.data || [];
  } catch (error) {
    console.error("Lỗi khi gọi API lấy số lượng nhập kho:", error);
    throw new Error("Không thể lấy dữ liệu nhập kho");
  }
};

export const getStockExportCompletedByDate = async () => {
  try {
    const res = await axiosJWT.get(
      `${process.env.REACT_APP_API_URL}/material-storage-export/getStockExportCompletedByDate`
    );
    return res?.data?.data || [];
  } catch (error) {
    console.error("Lỗi khi gọi API lấy đơn xuất kho hoàn thành:", error);
    throw new Error("Không thể lấy dữ liệu đơn xuất kho đã hoàn thành");
  }
};

