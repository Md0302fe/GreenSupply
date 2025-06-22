import axios from "axios";

export const getAllProducts = async (
  limit = 100,
  page = 0,
  sort = {},
  filter = {}
) => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/product/getAllProduct`,
    {
      params: {
        limit,
        page,
        sort,
        filter: JSON.stringify(filter), // Convert filter object to string
      },
    }
  );

  return res?.data;
};

export const getAllOrdersDetail = async (id) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/product/getProductDetail/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết thành phẩm:", error);
    throw new Error("Không thể tải dữ liệu, vui lòng thử lại!");
  }
};
