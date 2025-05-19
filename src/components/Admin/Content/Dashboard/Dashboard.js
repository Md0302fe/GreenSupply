import React, { PureComponent, useEffect, useState } from "react";
import LogoSCM from "../../../../assets/NewProject/Logo/logo-SupplyChainManagement.jpg";
import { useNavigate } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Navigation } from "swiper/modules";

import { IoSettingsSharp, IoStatsChart } from "react-icons/io5";
import { FaChartPie, FaRegUser } from "react-icons/fa";
import { LuChartColumnStacked } from "react-icons/lu";
import { MdStackedBarChart } from "react-icons/md";
import { FaChartLine, FaChartColumn } from "react-icons/fa6";
import { RiProductHuntLine, RiBarChartGroupedLine } from "react-icons/ri";
import { RxBarChart } from "react-icons/rx";
import { FcProcess } from "react-icons/fc";

import * as FuelStorageReceiptService from "../../../../services/FuelStorageReceiptService";
import * as MaterialStorageExportService from "../../../../services/MaterialStorageExportService";
import * as RawMaterialBatchServices from "../../../../services/RawMaterialBatch";
import * as ProductionRequestServices from "../../../../services/ProductionRequestServices";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const dataOrderStatus = [
  { day: "Ngày 1", ChờDuyệt: 10, ĐãDuyệt: 3 },
  { day: "Ngày 2", ChờDuyệt: 12, ĐãDuyệt: 4 },
  { day: "Ngày 3", ChờDuyệt: 8, ĐãDuyệt: 5 },
  { day: "Ngày 4", ChờDuyệt: 15, ĐãDuyệt: 6 },
  { day: "Ngày 5", ChờDuyệt: 20, ĐãDuyệt: 10 },
];

const dataProductionStatus = [
  { date: "Ngày 1", ĐangSảnXuất: 50, HoànThành: 20 },
  { date: "Ngày 2", ĐangSảnXuất: 70, HoànThành: 30 },
  { date: "Ngày 3", ĐangSảnXuất: 40, HoànThành: 10 },
  { date: "Ngày 4", ĐangSảnXuất: 80, HoànThành: 20 },
  { date: "Ngày 5", ĐangSảnXuất: 90, HoànThành: 10 },
  { date: "Ngày 6", ĐangSảnXuất: 60, HoànThành: 30 },
  { date: "Ngày 7", ĐangSảnXuất: 55, HoànThành: 25 },
];

const dataPieChart = [
  { name: "Group A", value: 400 },
  { name: "Group B", value: 300 },
  { name: "Group C", value: 300 },
  { name: "Group D", value: 200 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const DashboardComponent = () => {
  const navigate = useNavigate();
  const [totalReceipts, setTotalReceipts] = useState(0);
  const [totalExports, setTotalExports] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [dateRange, setDateRange] = useState("");
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState([]);
  const [completedImportExportData, setCompletedImportExportData] = useState([]);
  const [productionChartData, setProductionChartData] = useState([]);

  useEffect(() => {
    const fetchTotalExportOrders = async () => {
      try {
        // Lấy dữ liệu đơn nhập kho
        const receiptData =
          await FuelStorageReceiptService.getTotalFuelStorageReceipts();
        setTotalReceipts(receiptData.totalReceipts);
        setDateRange(receiptData.dateRange);

        // Lấy dữ liệu đơn xuất kho
        const exportData =
          await MaterialStorageExportService.getTotalMaterialStorageExports();
        setTotalExports(exportData.totalExports);

        // Lấy dữ liệu lô nguyên liệu
        const batchData =
          await RawMaterialBatchServices.getTotalRawMaterialBatches();
        setTotalBatches(batchData.totalBatches);
      } catch (error) {
        console.error("Không thể tải dữ liệu yêu cầu xuất kho:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalExportOrders();
  }, []);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        // Lấy dữ liệu nhập kho và xuất kho
        const importData =
          await FuelStorageReceiptService.getStockImportByDate();
        const exportDataByDate =
          await MaterialStorageExportService.getStockImportByDate();

        // Tạo dữ liệu cho biểu đồ
        const formattedData = importData.map((item) => ({
          name: item._id, // Ngày
          NhậpKho: item.totalImports, // Số đơn nhập kho trong ngày
          XuấtKho: 0, // Ban đầu XuấtKho bằng 0, sẽ cập nhật sau
          Total: item.totalImports, // Tính tổng NhậpKho và XuấtKho sau
        }));

        // Cập nhật số lượng xuất kho cho mỗi ngày
        exportDataByDate.forEach((item) => {
          const existingItem = formattedData.find(
            (data) => data.name === item._id
          );
          if (existingItem) {
            existingItem.XuấtKho = item.totalExports; // Cập nhật số đơn xuất kho
            existingItem.Total += item.totalExports; // Cộng thêm số đơn xuất kho vào tổng
          } else {
            // Nếu ngày xuất kho chưa có trong dữ liệu nhập kho, thêm vào
            formattedData.push({
              name: item._id,
              NhậpKho: 0,
              XuấtKho: item.totalExports,
              Total: item.totalExports, // Cộng thêm số đơn xuất kho vào tổng
            });
          }
        });

        // Lưu dữ liệu cho biểu đồ
        setStockData(formattedData);

        // Tính tổng số đơn nhập kho và xuất kho
        const totalImports = importData.reduce(
          (acc, item) => acc + item.totalImports,
          0
        );
        const totalExports = exportDataByDate.reduce(
          (acc, item) => acc + item.totalExports,
          0
        );

        setTotalReceipts(totalImports);
        setTotalExports(totalExports);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu nhập/xuất kho:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, []);

  const getMaxValue = (data) => {
    let maxValue = 0;
    data.forEach((item) => {
      maxValue = Math.max(maxValue, item.NhậpKho + item.XuấtKho, item.Total);
    });
    return maxValue;
  };
  const maxYValue = getMaxValue(stockData);

  useEffect(() => {
    const fetchCompletedImportExportData = async () => {
      try {
        const importCompletedData =
          await FuelStorageReceiptService.getStockImportCompletedByDate();
        const exportCompletedData =
          await MaterialStorageExportService.getStockExportCompletedByDate();

        const formattedData = [];

        importCompletedData.forEach((item) => {
          formattedData.push({
            name: item._id,
            NhậpKho: item.totalImports,
            XuấtKho: 0,
          });
        });

        exportCompletedData.forEach((item) => {
          const existing = formattedData.find((i) => i.name === item._id);
          if (existing) {
            existing.XuấtKho = item.totalExports;
          } else {
            formattedData.push({
              name: item._id,
              NhậpKho: 0,
              XuấtKho: item.totalExports,
            });
          }
        });

        setCompletedImportExportData(
          formattedData.sort((a, b) => new Date(a.name) - new Date(b.name))
        );
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu hoàn thành nhập/xuất kho:", error);
      }
    };

    fetchCompletedImportExportData();
  }, []);

  useEffect(() => {
    const fetchProductionChartData = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("access_token")); 
        const res = await ProductionRequestServices.getProductionChartData({ access_token: token });
  
        const formatted = res.data.map((item) => ({
          day: item.date,
          ChờDuyệt: item["Đang sản xuất"] || 0,
          ĐãDuyệt: item["Đã duyệt"] || 0,
        }));
  
        setProductionChartData(formatted);
      } catch (error) {
        console.error("Lỗi khi tải biểu đồ yêu cầu sản xuất:", error);
      }
    };
  
    fetchProductionChartData();
  }, []);
  

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="font-montserrat text-[#000000]">
      <div className="font-nunito w-full p-4 rounded-lg border border-[rgba(0,0,0,0.1)] shadow-md flex items-center gap-5 mb-4">
        <div className="info w-[80%] pl-10">
          <h1 className="text-[28px] font-bold leading-9 mb-3">
            Tổng Quan Hệ Thống
          </h1>
          <h1 className="font-bold text-[#006838] text-[40px] mb-4">
            GreenSupply🌿
          </h1>
          <p className="w-[70%] mb-4">
            Đây là trang Dashboard dành cho quản trị viên của hệ thống
            GreenSupply, nơi bạn có thể theo dõi và quản lý các chỉ số quan
            trọng trong quy trình sản xuất, tồn kho và phân phối xoài.
          </p>

          <div className="flex items-center gap-3">
            <button
              className="bg-[#005a2c] hover:bg-[#00a34b] text-white font-bold text-sm py-1 px-2 rounded"
              onClick={() => navigate("/system/admin/C_purchase-order")}
            >
              Tạo yêu cầu cung cấp
            </button>

            <button
              className="bg-[#005a2c] hover:bg-[#00a34b] text-white font-bold text-sm py-1 px-2 rounded"
              onClick={() => navigate("/system/admin/production-request")}
            >
              Tạo yêu cầu sản xuất
            </button>

            <button
              className="bg-[#005a2c] hover:bg-[#00a34b] text-white font-bold text-sm py-1 px-2 rounded"
              onClick={() => navigate("/system/admin/production-processing")}
            >
              Tạo quy trình sản xuất
            </button>

            <button
              className="bg-[#005a2c] hover:bg-[#00a34b] text-white font-bold text-sm py-1 px-2 rounded"
              onClick={() => navigate("/system/admin/material-storage-export")}
            >
              Tạo yêu cầu xuất kho
            </button>

            <button
              className="bg-[#005a2c] hover:bg-[#00a34b] text-white font-bold text-sm py-1 px-2 rounded"
              onClick={() => navigate("/system/admin/View-Order-Success")}
            >
              Tạo yêu cầu nhập kho
            </button>
          </div>
        </div>
        <img src={LogoSCM} className="w-[300px] pr-10" />
      </div>

      <div className="mb-4">
        <Swiper
          slidesPerView={4}
          spaceBetween={10}
          navigation={true}
          modules={[Navigation]}
          className="dashboardBoxesSlider"
        >
          <SwiperSlide>
            <div className="box p-4 cursor-pointer hover:bg-[#f1f1f1] rounded-lg border border-[rgba(0,0,0,0.1)] flex items-center gap-3">
              <RiProductHuntLine className="text-[40px] text-[#312be1d8]" />
              <div className="info w-[70%]">
                <h3 className="text-sm mb-2 font-semibold">Yêu cầu nhập kho</h3>
                <h1 className="text-lg mb-2 font-bold">{totalReceipts}</h1>
                <p className="text-xs text-stone-500">{dateRange}</p>
              </div>
              <IoStatsChart className="text-[50px] text-[#312be1d8]" />
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="box p-4 cursor-pointer hover:bg-[#f1f1f1] rounded-md border border-[rgba(0,0,0,0.1)] flex items-center gap-3">
              <IoSettingsSharp className="text-[40px] text-[#3872fa]" />
              <div className="info w-[70%]">
                <h3 className="text-sm mb-2 font-semibold">Yêu cầu xuất kho</h3>
                <h1 className="text-lg mb-2 font-bold">{totalExports}</h1>
                <p className="text-xs text-stone-500">{dateRange}</p>
              </div>
              <RiBarChartGroupedLine className="text-[70px] text-[#3872fa]" />
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="box p-4 cursor-pointer hover:bg-[#f1f1f1] rounded-md border border-[rgba(0,0,0,0.1)] flex items-center gap-3">
              <FaChartPie className="text-[40px] text-[#10b981]" />
              <div className="info w-[70%]">
                <h3 className="text-sm mb-2 font-semibold">
                  Số lượng lô nguyên liệu
                </h3>
                <h1 className="text-lg mb-2 font-bold">{totalBatches}</h1>
                <p className="text-xs text-stone-500">{dateRange}</p>
              </div>
              <RxBarChart className="text-[70px] text-[#10b981]" />
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="box p-4 cursor-pointer hover:bg-[#f1f1f1] rounded-md border border-[rgba(0,0,0,0.1)] flex items-center gap-3">
              <FcProcess className="text-[40px] text-[#7928ca]" />
              <div className="info w-[70%]">
                <h3 className="text-sm mb-2 font-semibold">
                  Số lượng lô thành phẩm
                </h3>
                <h1 className="text-lg mb-2 font-bold">11</h1>
                <p className="text-xs text-stone-500">
                  Từ 1 tháng 1 - 25 tháng 3
                </p>
              </div>
              <IoStatsChart className="text-[50px] text-[#7928ca]" />
            </div>
          </SwiperSlide>
        </Swiper>
      </div>

      {/* BIỂU ĐỒ NHẬP/XUẤT KHO */}
      <div className="flex gap-4 mb-4">
        {/* Biểu đồ đường nhập/xuất kho */}
        <div className="w-1/2 min-h-[420px] overflow-hidden rounded-lg border border-[rgba(0,0,0,0.1)] shadow-md p-4">
          <div className="flex items-center gap-3 mb-3">
            <FaChartLine className="text-[24px]" />
            <h3 className="text-lg font-semibold text-[#333] mb-0">
              Số Lượng Yêu Cầu Nhập/Xuất Kho (Theo Ngày)
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                padding={{ left: 20, right: 20 }}
                tickMargin={20}
              />
              <YAxis domain={[0, maxYValue]} />
              <Tooltip />
              <Legend
                wrapperStyle={{
                  position: "relative",
                  top: 5,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              />
              <Line
                type="monotone"
                dataKey="NhậpKho"
                stroke="#4A90E2"
                strokeWidth={2}
                dot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="XuấtKho"
                stroke="#E74C3C"
                strokeWidth={2}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Biểu đồ cột bên phải */}
        <div className="w-1/2 overflow-hidden rounded-lg border border-[rgba(0,0,0,0.1)] shadow-md p-4">
          <div className="flex items-center gap-3 mb-3">
            <FaChartColumn className="text-[24px]" />
            <h3 className="text-lg font-semibold text-[#333] mb-0">
              Số Lượng Yêu Cầu Nhập/Xuất Kho Đã Hoàn Thành (Theo Ngày)
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={completedImportExportData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tickMargin={20} />
              <YAxis />
              <Tooltip />
              <Legend
                wrapperStyle={{
                  position: "relative",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              />
              <Bar dataKey="NhậpKho" fill="#4A90E2" barSize={20} />
              <Bar dataKey="XuấtKho" fill="#E74C3C" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        {/* Biểu đồ tròn */}
        {/* <div className="w-1/2 overflow-hidden rounded-lg border border-[rgba(0,0,0,0.1)] shadow-md p-4">
          <div className="flex items-center gap-3 mb-4">
            <FaChartLine className="text-[24px]" />
            <h3 className="text-lg font-semibold text-[#333]">
              Số Lượng Quy Trình Sản Xuất Đã Được Thực Hiện (Theo Ngày)
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={400} height={200}>
              <PieChart>
                <Tooltip
                  formatter={(value, name) => [`${value}`, `${name}`]}
                  contentStyle={{
                    backgroundColor: "#f9f9f9",
                    borderRadius: "5px",
                  }}
                />
                <Pie
                  data={dataPieChart}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div>
              <h4 className="text-md font-semibold text-[#333] mb-2">
                Mục Lục Màu Sắc
              </h4>
              <ul className="text-sm text-[#666]">
                {dataPieChart.map((entry, index) => (
                  <li key={index} className="flex items-center mb-2">
                    <div
                      className="w-4 h-4 mr-2"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span>
                      {entry.name}:{" "}
                      {`${(
                        (entry.value /
                          dataPieChart.reduce(
                            (acc, item) => acc + item.value,
                            0
                          )) *
                        100
                      ).toFixed(1)}%`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div> */}
        <div className="w-1/2 overflow-hidden rounded-lg border border-[rgba(0,0,0,0.1)] shadow-md p-4">
          <div className="flex items-center gap-3 mb-4">
            <FaChartColumn className="text-[24px]" />
            <h3 className="text-lg font-semibold text-[#333] mb-0">
              Số Lượng Yêu Cầu Chờ Tạo Quy Trình Sản Xuất (Theo Ngày)
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productionChartData}>
              <CartesianGrid strokeDasharray="2 2" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ChờDuyệt" fill="#FAB12F" barSize={20} />
              <Bar dataKey="ĐãDuyệt" fill="#A0C878" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="w-1/2 overflow-hidden rounded-lg border border-[rgba(0,0,0,0.1)] shadow-md p-4">
          <div className="flex items-center gap-3 mb-4">
            <MdStackedBarChart className="text-[24px]" />
            <h3 className="text-lg font-semibold text-[#333] mb-0">
              Số Lượng Quy Trình Sản Xuất Đã Hoàn Thành (Theo Ngày)
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={dataProductionStatus}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="ĐangSảnXuất"
                stackId="a"
                fill="#F6E96B"
                barSize={25}
              />
              <Bar
                dataKey="HoànThành"
                stackId="a"
                fill="#88D66C"
                barSize={25}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardComponent;
