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
