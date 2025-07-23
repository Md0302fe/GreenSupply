// E:\SEP\src\services\DashboardService.js
import axios from "axios";

export const getDashboardOverview = async () => {
  const res = await axios.get("/api/dashboard/overview");
  return res.data.data;
};
