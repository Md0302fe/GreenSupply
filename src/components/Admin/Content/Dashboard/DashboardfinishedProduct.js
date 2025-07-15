import React, { useEffect, useState } from "react";
import { Card, Statistic, Table, message, Spin, Alert } from "antd";
import { Bar } from "@ant-design/plots";
import axios from "axios";
import moment from "moment";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const DashboardfinishedProduct = () => {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const navigate = useNavigate();

  const userRedux = useSelector((state) => state.user);
  const token = userRedux?.access_token || localStorage.getItem("access_token");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/product/getProductDashboard`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.status === "SUCCESS") {
        setDashboardData(res.data.data);
      }
    } catch (error) {
      console.error("Lỗi khi fetch dashboard:", error);
      message.error("Không thể tải dữ liệu dashboard sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  const stockBarData = [
  { status: "Chưa nhập kho lạnh", value: dashboardData?.exported || 0 },
  { status: "Đã nhập kho lạnh", value: dashboardData?.inStock || 0 },
];


  const stockBarConfig = {
    data: stockBarData,
    xField: "status",
    yField: "value",
    colorField: "status",
    legend: false,
    height: 400,
    barWidthRatio: 0.6,
  };

  const latestColumns = [
    { title: "Tên sản phẩm", dataIndex: "name", key: "name" },
    { title: "Mã sản phẩm", dataIndex: "masanpham", key: "masanpham" },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => moment(text).format("DD/MM/YYYY"),
    },
  ];

  const expiringColumns = [
    { title: "Tên sản phẩm", dataIndex: "name", key: "name" },
    { title: "Mã sản phẩm", dataIndex: "masanpham", key: "masanpham" },
    {
      title: "Hạn sử dụng",
      dataIndex: "expiration_date",
      key: "expiration_date",
      render: (text) => (
        <span className="text-red-600 font-medium">
          {moment(text).format("DD/MM/YYYY")}
        </span>
      ),
    },
    {
      title: "Còn lại",
      dataIndex: "days_left",
      key: "days_left",
      render: (num) => (
        <span className="text-red-500 font-bold">{num} ngày</span>
      ),
    },
  ];

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <header className="bg-gradient-to-r from-green-600 to-lime-500 text-white p-6 rounded mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          Dashboard Quản Lý Lô Thành Phẩm
        </h1>
      </header>

      {loading ? (
        <Spin
          size="large"
          className="flex justify-center items-center w-full h-full"
        />
      ) : (
        <>
          {/*  Tổng quan: 3 cột đều nhau */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card
              onClick={() => navigate("/system/admin/finished_product_list")}
              className="cursor-pointer hover:shadow-lg"
            >
              <Statistic
                title={
                  <span>
                    <i className="fas fa-boxes mr-1 text-blue-600" /> Tổng lô thành
                    phẩm
                  </span>
                }
                value={dashboardData?.totalProducts || 0}
              />
            </Card>

            <Card className="h-full">
              <Statistic
                title={
                  <span>
                    <i className="fas fa-warehouse mr-1 text-green-600" /> Thành phẩm còn trong kho
                  </span>
                }
                valueRender={() => (
                  <div className="space-y-1 text-sm">
                    {(dashboardData?.productByType || []).length > 0 ? (
                      dashboardData.productByType.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() =>
                            navigate("/system/admin/finished_product_list", {
                              state: { selectedMaterialId: item._id },
                            })
                          }
                          className="cursor-pointer hover:text-green-600"
                        >
                          <span className="font-medium text-gray-700">
                            {item.type || `Loại #${idx + 1}`}
                          </span>
                          : <strong>{item.value}</strong>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-500">Không có dữ liệu</span>
                    )}
                  </div>
                )}
              />
            </Card>

            <Card className="h-full">
              <Statistic
                title={<span><i className="fas fa-info-circle mr-1 text-gray-600" /> Trạng thái sản phẩm</span>}
                valueRender={() => (
                  <div className="space-y-1 text-base">
                    <div
                      className="cursor-pointer hover:text-green-600"
                      onClick={() =>
                        navigate("/system/admin/finished_product_list", {
                          state: { selectedStatus: "còn hạn" },
                        })
                      }
                    >
                      <i className="fas fa-check-circle text-green-600 mr-1" />
                      Còn hạn:{" "}
                      <strong>{dashboardData?.validProducts || 0}</strong>
                    </div>
                    <div
                      className="cursor-pointer hover:text-red-500"
                      onClick={() =>
                        navigate("/system/admin/finished_product_list", {
                          state: { selectedStatus: "hết hạn" },
                        })
                      }
                    >
                      <i className="fas fa-check-circle text-red-600 mr-1" />
                      Hết hạn:{" "}
                      <strong>{dashboardData?.expiredProducts || 0}</strong>
                    </div>
                    <div
                      className="cursor-pointer hover:text-blue-500"
                      onClick={() =>
                        navigate("/system/admin/finished_product_list", {
                          state: { selectedStatus: "đang giao hàng" },
                        })
                      }
                    >
                      <i className="fas fa-check-circle text-blue-600 mr-1" />
                      Đang giao:{" "}
                      <strong>{dashboardData?.shippingProducts || 0}</strong>
                    </div>
                  </div>
                )}
              />
            </Card>
          </div>

          {/*  Thành phẩm mới nhất */}
          <div className="bg-white p-6 rounded shadow mb-6">
            <h2 className="text-lg md:text-xl font-semibold mb-3">
              🆕 Lô thành phẩm mới nhất
            </h2>
            <Table
              columns={latestColumns}
              dataSource={dashboardData?.latestProducts || []}
              pagination={false}
              rowKey={(record) => record._id || record.masanpham}
              scroll={{ x: true }}
            />
          </div>

          {/*  Biểu đồ Trạng thái kho */}
          <div className="bg-white p-6 rounded shadow mb-6">
            <h2 className="text-lg md:text-xl font-semibold mb-3">
              📦 Biểu đồ trạng thái lô thành phẩm
            </h2>
            <Bar {...stockBarConfig} />
          </div>

          {/*  Cảnh báo sản phẩm sắp hết hạn */}
          <div className="bg-white p-6 rounded shadow mb-6">
            <h2 className="text-lg md:text-xl font-semibold mb-3">
              ⚠️ Lô thành phẩm sắp hết hạn
            </h2>
            <Table
              columns={expiringColumns}
              dataSource={dashboardData?.expiringProducts || []}
              pagination={{ pageSize: 5 }}
              rowKey={(record) => record._id || record.masanpham}
              scroll={{ x: true }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardfinishedProduct;
