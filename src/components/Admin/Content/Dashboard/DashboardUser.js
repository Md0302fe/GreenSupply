import React, { useEffect, useState } from "react";
import { Card, Statistic, Table, message, Spin, Alert } from "antd";
import axios from "axios";
import { useSelector } from "react-redux";
import { Pie } from "@ant-design/plots";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const DashboardUser = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const userRedux = useSelector((state) => state.user);
  const token = userRedux?.access_token || localStorage.getItem("access_token");
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/user/Dashborad-User`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.status === "OK") {
        setDashboardData(res.data.data);
      } else {
        message.error(t("userDashboard.error.fetchUserFail"));
      }
    } catch (error) {
      console.error("Lỗi khi gọi API người dùng:", error);
      message.error(t("userDashboard.error.serverConnectionFail"));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const pieData =
    dashboardData?.role?.map((item) => ({
      type: item.role,
      value: item.count,
    })) || [];

  const pieConfig = {
    data: pieData,
    angleField: "value",
    colorField: "type",
    radius: 0.9,
    height: 400,
  };

  const latestUsers =
    dashboardData?.latestUsers?.map((user, index) => ({
      key: index,
      full_name: user.full_name,
      email: user.email,
      role: user.role_id?.role_name || t("userDashboard.table.unknown"),
      createdAt: moment(user.createdAt).format("DD/MM/YYYY HH:mm"),
    })) || [];

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <header className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white p-6 rounded mb-4 md:mb-6">
        <h1 className="text-[20px] md:text-3xl font-bold">
          {t("userDashboard.title")}
        </h1>
      </header>

      {loading ? (
        <Spin
          size="large"
          className="flex justify-center items-center w-full h-full"
        />
      ) : (
        <>
          {/* 🔹 Thống kê tổng quan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4 md:mb-6">
            <Card
              hoverable
              onClick={() => navigate("/system/admin/manage-users")}
              className="transition-transform hover:scale-105 duration-300 shadow"
            >
              <Statistic
                title={
                  <span className="font-medium">
                    {t("userDashboard.totalUsers")}
                  </span>
                }
                value={dashboardData?.totalUser || 0}
              />
            </Card>

            <Card
              hoverable
              onClick={() =>
                navigate("/system/admin/manage-blocked-users?status=active")
              }
              className="transition-transform hover:scale-105 duration-300 shadow"
            >
              <Statistic
                title={
                  <span className="flex items-center gap-1">
                    <span className="text-green-600">🟢</span>
                    <span className="font-medium">
                      {t("userDashboard.activeUsers")}
                    </span>
                  </span>
                }
                value={dashboardData?.totalActive || 0}
              />
            </Card>

            <Card
              hoverable
              onClick={() =>
                navigate("/system/admin/manage-blocked-users?status=blocked")
              }
              className="transition-transform hover:scale-105 duration-300 shadow"
            >
              <Statistic
                title={
                  <span className="font-medium">
                    {t("userDashboard.blockedUsers")}
                  </span>
                }
                value={dashboardData?.totalBlocked || 0}
                valueStyle={{ color: "#ff4d4f" }}
              />
            </Card>
          </div>

          {/* 🔹 Biểu đồ phân bổ vai trò */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-4 md:mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {t("userDashboard.roleDistribution")}
            </h2>
            {pieData.length > 0 ? (
              <Pie {...pieConfig} />
            ) : (
              <Alert message={t("userDashboard.noRoleData")} type="info" />
            )}
          </div>

          {/* 🔹 Danh sách người dùng mới nhất */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-4 md:mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {t("userDashboard.latestUsers")}
            </h2>
            <Table
              columns={[
                {
                  title: t("userDashboard.table.fullName"),
                  dataIndex: "full_name",
                  key: "full_name",
                },
                {
                  title: t("userDashboard.table.email"),
                  dataIndex: "email",
                  key: "email",
                },
                {
                  title: t("userDashboard.table.role"),
                  dataIndex: "role",
                  key: "role",
                },
                {
                  title: t("userDashboard.table.createdAt"),
                  dataIndex: "createdAt",
                  key: "createdAt",
                },
              ]}
              dataSource={latestUsers}
              pagination={{ pageSize: 5 }}
              scroll={{ x: "max-content" }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardUser;
