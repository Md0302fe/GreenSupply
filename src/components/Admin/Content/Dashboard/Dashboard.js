import React, { PureComponent, useEffect, useState, useRef } from "react";
import LogoSCM from "../../../../assets/NewProject/Logo/logo-SupplyChainManagement.jpg";
import { useNavigate } from "react-router-dom";

import { Card, Statistic } from "antd";
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
import {
  HomeOutlined,
} from "@ant-design/icons";
import axios from "axios";
// import { getDashboardOverview } from "../../../../services/DashboardService";


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
import { useTranslation } from "react-i18next";

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
const CustomTooltip = ({ active, payload, label }) => {
  const { t } = useTranslation();
  const nameToTranslationKey = {
    NhậpKho: "import",
    XuấtKho: "export",
    ChờDuyệt: "pending",
    ĐãDuyệt: "approved",
    ĐangSảnXuất: "inProgress",
    HoànThành: "completed",
  };
  if (active && payload && payload.length) {
    return (
      <div
        className="custom-tooltip p-2 bg-white border rounded shadow-sm"
        style={{ lineHeight: "1.6", fontSize: "14px" }}
      >
        <p className="label font-bold mb-1">{label}</p>
        {payload.map((entry, index) => {
          const i18nKey = nameToTranslationKey[entry.name] || entry.name;
          return (
            <p key={index} style={{ color: entry.color }}>
              {t(`chart.${i18nKey}`)} : {entry.value}
            </p>
          );
        })}
      </div>
    );
  }

  return null;
};
const DashboardComponent = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const [totalReceipts, setTotalReceipts] = useState(0);
  const [totalExports, setTotalExports] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [dateRange, setDateRange] = useState("");
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState([]);
  const [completedImportExportData, setCompletedImportExportData] = useState(
    []
  );
  const [productionChartData, setProductionChartData] = useState([]);
  const [productionProcessChartData, setProductionProcessChartData] = useState([]);
  const [roleDistribution, setRoleDistribution] = useState([]);
  const [warehouseCapacity, setWarehouseCapacity] = useState(null);
  const [fuelRequestChartData, setFuelRequestChartData] = useState([]);
  const [fuelSupplyChartData, setFuelSupplyChartData] = useState([]);
  const [fuelDistribution, setFuelDistribution] = useState([]);
  const [packagingDistribution, setPackagingDistribution] = useState([]);
  const [summaryStats, setSummaryStats] = useState(null);
  const [productDashboard, setProductDashboard] = useState([]);
  const importExportRef = useRef(null);
  const productionProcessRef = useRef(null);
  const userAndWarehouseRef = useRef(null);
  const supplierRequestRef = useRef(null);
  const materialAndPackagingRef = useRef(null);
  const productionPlanRef = useRef(null);
  const finishedProductRef = useRef(null);

  const getMaxValue = (data) => {
    let maxValue = 0;
    data.forEach((item) => {
      maxValue = Math.max(maxValue, item.NhậpKho + item.XuấtKho, item.Total);
    });
    return maxValue;
  };

  const ROLE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF4D4F",];

  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const maxYValue = getMaxValue(stockData);
  useEffect(() => {
    const fetchDashboardOverview = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/dashboard/overview");

        const data = res.data.data;

        // ✅ Nhập kho - xuất kho - lô
        setTotalReceipts(data.totalReceipts);
        setTotalExports(data.totalExports);
        setTotalBatches(data.totalBatches);

        // ✅ Date range
        setDateRange(data.receiptDateRange); // hoặc ghép cả 3 nếu bạn muốn hiển thị riêng

        setRoleDistribution(data.roleDistribution || []);

        setWarehouseCapacity(data.warehouseCapacity);

        // ✅ Biểu đồ đường nhập/xuất kho
        const stockByDateFormatted = data.stockImportByDate.map((item) => ({
          name: item._id,
          NhậpKho: item.totalImports,
          XuấtKho: 0,
          Total: item.totalImports,
        }));

        data.stockExportCompletedByDate.forEach((item) => {
          const existing = stockByDateFormatted.find((x) => x.name === item._id);
          if (existing) {
            existing.XuấtKho = item.totalExports;
            existing.Total += item.totalExports;
          } else {
            stockByDateFormatted.push({
              name: item._id,
              NhậpKho: 0,
              XuấtKho: item.totalExports,
              Total: item.totalExports,
            });
          }
        });

        setStockData(stockByDateFormatted);

        // Dữ liệu biểu đồ thu nguyên liệu
        setFuelRequestChartData([
          { name: "pending", value: data.supplierOrderStats.fuelRequests.pending },
          { name: "approved", value: data.supplierOrderStats.fuelRequests.approved },
          { name: "completed", value: data.supplierOrderStats.fuelRequests.completed },
        ]);

        setFuelSupplyChartData([
          { name: "pending", value: data.supplierOrderStats.fuelSupplyOrders.pending },
          { name: "approved", value: data.supplierOrderStats.fuelSupplyOrders.approved },
          { name: "completed", value: data.supplierOrderStats.fuelSupplyOrders.completed },
        ]);

        // ✅ Biểu đồ cột - đã hoàn thành nhập xuất
        const completedData = [];

        data.stockImportCompletedByDate.forEach((item) => {
          completedData.push({
            name: item._id,
            NhậpKho: item.totalImports,
            XuấtKho: 0,
          });
        });
        console.log("✅ completedData:", completedData);
        console.log("✅ stockData:", stockByDateFormatted);


        data.stockExportCompletedByDate.forEach((item) => {
          const existing = completedData.find((x) => x.name === item._id);
          if (existing) {
            existing.XuấtKho = item.totalExports;
          } else {
            completedData.push({
              name: item._id,
              NhậpKho: 0,
              XuấtKho: item.totalExports,
            });
          }
        });

        setCompletedImportExportData(
          completedData.sort((a, b) => new Date(a.name) - new Date(b.name))
        );

        // ✅ Biểu đồ yêu cầu sản xuất
        const prodData = data.productionChartData.map((item) => ({
          day: item.date,
          ChờDuyệt: item["Chờ duyệt"] || 0,
          ĐãDuyệt: item["Đã duyệt"] || 0,
          ĐangSảnXuất: item["Đang sản xuất"] || 0,
          HoànThành: item["Hoàn thành"] || 0,
        }));
        setProductionChartData(prodData);
        console.log("🔥 Production Chart Raw:", data.productionProcessChart);

        const processData = data.productionProcessChart.map((item) => ({
          date: item.date,
          ĐangSảnXuất: item["ĐangSảnXuất"] || 0,
          HoànThành: item["HoànThành"] || 0,
        }));
        setProductionProcessChartData(processData);

        // 🟢 Gán trực tiếp mảng nguyên liệu
        setFuelDistribution(data.fuelDistribution || []);
        // 🟡 Chuyển object packaging thành mảng cho Bar chart
        const packagingArr = Object.entries(data.packagingDistribution || {}).map(
          ([type, value]) => ({ type, value })
        );
        setPackagingDistribution(packagingArr);
        setSummaryStats(data.summaryStats);

        setProductDashboard(data.productDashboard || []);



      } catch (err) {
        console.error("Lỗi khi tải tổng quan dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardOverview();
  }, []);


  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // cập nhật ngay khi component mount

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  if (loading) {
    return <div>{t("historyProvideOrder.loading")}</div>;
  }
  const rolePieData = (roleDistribution || []).map((item) => ({
    type: item.role,
    value: item.count,
  }));
  const warehousePieData = warehouseCapacity
    ? [
      { name: "Đã sử dụng", value: warehouseCapacity.used },
      { name: "Còn lại", value: warehouseCapacity.remaining },
    ]
    : [];
  const filteredData = fuelDistribution.filter(item => item.value > 0);

  return (
    <div className="font-montserrat text-[#000000]">
      <div className="font-nunito w-full p-4 rounded-lg border border-[rgba(0,0,0,0.1)] shadow-md flex flex-col md:flex-row items-center gap-5 mb-4">
        <div className="info w-[100%] md:w-[80%] pl-0 md:pl-10">
          <h1 className="text:-[20px] md:text-[28px] font-bold leading-9 mb-3">
            {t("dashboard.title")}
          </h1>
          <h1 className="font-bold text-[#006838] text-[30px] md:text-[40px] mb-4">
            {t("dashboard.subtitle")}
          </h1>
          <p className="w-[100%] md:w-[70%] mb-4">{t("dashboard.description")}</p>

          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 w-full">
            <button
              className="md:w-[200px] h-[50px] bg-[#005a2c] hover:bg-[#00a34b] text-white font-bold text-sm py-1 px-2 rounded"
              onClick={() => {
                importExportRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {t("dashboard.section.importExportRequest")}
            </button>

            <button
              className="w-full md:w-auto min-h-[42px] bg-[#005a2c] hover:bg-[#00a34b] text-white font-bold text-sm py-1 px-2 rounded"
              onClick={() => {
                productionProcessRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {t("dashboard.section.productionProcess")}
            </button>

            <button
              className="w-full md:w-auto min-h-[42px] bg-[#005a2c] hover:bg-[#00a34b] text-white font-bold text-sm py-1 px-2 rounded"
              onClick={() => {
                userAndWarehouseRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {t("dashboard.section.userAndWarehouse")}
            </button>


            <button
              className="w-full md:w-auto min-h-[42px] bg-[#005a2c] hover:bg-[#00a34b] text-white font-bold text-sm py-1 px-2 rounded"
              onClick={() => {
                supplierRequestRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {t("dashboard.section.supplierRequest")}
            </button>

            <button
              className="w-full md:w-auto min-h-[42px] bg-[#005a2c] hover:bg-[#00a34b] text-white font-bold text-sm py-1 px-2 rounded"
              onClick={() => {
                materialAndPackagingRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {t("dashboard.section.materialAndPackaging")}
            </button>


            <button
              className="w-full md:w-auto min-h-[42px] bg-[#005a2c] hover:bg-[#00a34b] text-white font-bold text-sm py-1 px-2 rounded"
              onClick={() => {
                productionPlanRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {t("dashboard.section.productionPlan")}
            </button>

            <button
              className="w-full md:w-auto min-h-[42px] bg-[#005a2c] hover:bg-[#00a34b] text-white font-bold text-sm py-1 px-2 rounded"
              onClick={() => {
                finishedProductRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {t("dashboard.section.finishedProduct")}
            </button>
          </div>

        </div>
        <img src={LogoSCM} alt="" className="w-[300px]  md:pr-10" />
      </div>

      <div className="mb-4">
        {/* Swiper: chỉ hiện khi md trở lên */}
        <div className="hidden md:block">
          <Swiper
            slidesPerView={4}
            spaceBetween={10}
            navigation={true}
            modules={[Navigation]}
            className="dashboardBoxesSlider"
          >
            {[...Array(4)].map((_, index) => (
              <SwiperSlide key={index}>{/* Nội dung tương ứng từng thẻ */}</SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Layout dạng cột cho mobile */}
        <div className="flex flex-col gap-3 md:hidden">
          <div className="box p-4 cursor-pointer hover:bg-[#f1f1f1] rounded-lg border border-[rgba(0,0,0,0.1)] flex items-center gap-3">
            <RiProductHuntLine className="text-[40px] text-[#312be1d8]" />
            <div className="info w-[70%]">
              <h3 className="text-sm mb-2 font-semibold">{t("dashboard.card.import.title")}</h3>
              <h1 className="text-lg mb-2 font-bold">{totalReceipts}</h1>
              <p className="text-xs text-stone-500">{dateRange}</p>
            </div>
            <IoStatsChart className="text-[50px] text-[#312be1d8]" />
          </div>

          <div className="box p-4 cursor-pointer hover:bg-[#f1f1f1] rounded-md border border-[rgba(0,0,0,0.1)] flex items-center gap-3">
            <IoSettingsSharp className="text-[40px] text-[#3872fa]" />
            <div className="info w-[70%]">
              <h3 className="text-sm mb-2 font-semibold">{t("dashboard.card.export.title")}</h3>
              <h1 className="text-lg mb-2 font-bold">{totalExports}</h1>
              <p className="text-xs text-stone-500">{dateRange}</p>
            </div>
            <RiBarChartGroupedLine className="text-[70px] text-[#3872fa]" />
          </div>

          <div className="box p-4 cursor-pointer hover:bg-[#f1f1f1] rounded-md border border-[rgba(0,0,0,0.1)] flex items-center gap-3">
            <FaChartPie className="text-[40px] text-[#10b981]" />
            <div className="info w-[70%]">
              <h3 className="text-sm mb-2 font-semibold">{t("dashboard.card.batch.title")}</h3>
              <h1 className="text-lg mb-2 font-bold">{totalBatches}</h1>
              <p className="text-xs text-stone-500">{dateRange}</p>
            </div>
            <RxBarChart className="text-[70px] text-[#10b981]" />
          </div>

          <div className="box p-4 cursor-pointer hover:bg-[#f1f1f1] rounded-md border border-[rgba(0,0,0,0.1)] flex items-center gap-3">
            <FcProcess className="text-[40px] text-[#7928ca]" />
            <div className="info w-[70%]">
              <h3 className="text-sm mb-2 font-semibold">{t("dashboard.card.finished.title")}</h3>
              <h1 className="text-lg mb-2 font-bold">11</h1>
              <p className="text-xs text-stone-500">
                {t("dashboard.card.finished.dateRange")}
              </p>
            </div>
            <IoStatsChart className="text-[50px] text-[#7928ca]" />
          </div>
        </div>
      </div>

      <div ref={importExportRef} className="w-full bg-gray-100 py-2 px-4 mb-4 flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 ml-2">
          {t("dashboard.section.importExportRequest")}
        </h2>
        <button
          onClick={() => window.location.href = "http://localhost:3000/system/admin/manage-warehouse"}
          className="text-sm text-blue-600 hover:underline"
        >
          {t("dashboard.button.details")}
        </button>
      </div>
      {/* BIỂU ĐỒ NHẬP/XUẤT KHO */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {/* Biểu đồ đường nhập/xuất kho */}
        <div className="w-full md:w-1/2 min-h-[300] md:min-h-[420px] overflow-hidden rounded-lg border border-[rgba(0,0,0,0.1)] shadow-md p-4">
          <div className="flex items-center gap-4 md:gap-3 mb-3">
            <FaChartLine className="text-[24px]" />
            <h3 className="text-[14px] md:text-lg font-semibold text-[#333] mb-0">
              {t("dashboard.chart.importExport.title")}
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
            <LineChart data={stockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                padding={{ left: 20, right: 20 }}
                tickMargin={20}
              />
              <YAxis domain={[0, maxYValue]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  position: "relative",
                  top: 5,
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: "15px",
                }}
                formatter={(value) => {
                  if (value === "NhậpKho") return t("chart.import");
                  if (value === "XuấtKho") return t("chart.export");
                  return value;
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
        <div className="w-full md:w-1/2 overflow-hidden rounded-lg border border-[rgba(0,0,0,0.1)] shadow-md p-4">
          <div className="flex items-center gap-4 md:gap-3 mb-3">
            <FaChartColumn className="text-[24px]" />
            <h3 className="text-[14px] md:text-lg font-semibold text-[#333] mb-0">
              {t("dashboard.chart.importExport.titleCompleted")}
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
            <BarChart data={completedImportExportData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tickMargin={20} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  position: "relative",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: "13px",
                }}
                formatter={(value) => {
                  if (value === "NhậpKho") return t("chart.import");
                  if (value === "XuấtKho") return t("chart.export");
                  return value;
                }}
              />
              <Bar dataKey="NhậpKho" fill="#4A90E2" barSize={20} />
              <Bar dataKey="XuấtKho" fill="#E74C3C" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div ref={productionProcessRef} className="w-full bg-gray-100 py-2 px-4 mb-4 flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 ml-2">
          {t("dashboard.section.productionProcess")}
        </h2>
        <button
          onClick={() => window.location.href = "http://localhost:3000/system/admin/dashboard-production-request"}
          className="text-sm text-blue-600 hover:underline"
        >
          {t("dashboard.button.details")}
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {/* Biểu đồ bên trái */}
        <div className="w-full md:w-1/2 overflow-hidden rounded-lg border border-[rgba(0,0,0,0.1)] shadow-md p-4">
          <div className="flex items-center gap-3 mb-4">
            <FaChartColumn className="text-[24px]" />
            <h3 className="text-[14px] md:text-lg font-semibold text-[#333] mb-0">
              {t("dashboard.chart.importExport.requestsPendingProduction")}
            </h3>
          </div>

          <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
            <BarChart data={productionChartData}>
              <CartesianGrid strokeDasharray="2 2" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "13px" }}
                formatter={(value) => {
                  const labelMap = {
                    NhậpKho: t("chart.import"),
                    XuấtKho: t("chart.export"),
                    ChờDuyệt: t("chart.pending"),
                    ĐãDuyệt: t("chart.approved"),
                    ĐangSảnXuất: t("chart.inProgress"),
                    HoànThành: t("chart.completed"),
                  };
                  return labelMap[value] || value;
                }}
              />
              <Bar dataKey="ChờDuyệt" fill="#FAB12F" barSize={20} />
              <Bar dataKey="ĐãDuyệt" fill="#A0C878" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Biểu đồ bên phải */}
        <div className="w-full md:w-1/2 overflow-hidden rounded-lg border border-[rgba(0,0,0,0.1)] shadow-md p-4">
          <div className="flex items-center gap-3 mb-4">
            <MdStackedBarChart className="text-[24px]" />
            <h3 className="text-[14px] md:text-lg font-semibold text-[#333] mb-0">
              {t("dashboard.chart.importExport.completedProductionProcesses")}
            </h3>
          </div>

          <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
            <BarChart
              data={productionProcessChartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="ĐangSảnXuất" stackId="a" fill="#F6E96B" barSize={20} />
              <Bar dataKey="HoànThành" stackId="a" fill="#88D66C" barSize={20} />
            </BarChart>
          </ResponsiveContainer>

          {/* Custom Legend */}
          <div className="flex justify-center gap-2 mt-[-4] text-[12px]">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-[#F6E96B] rounded-sm" />
              <span className="whitespace-nowrap  text-[#F6E96B]">{t("chart.inProgress")}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-[#88D66C] rounded-sm" />
              <span className="whitespace-nowrap text-[#88D66C]">{t("chart.completed")}</span>
            </div>
          </div>
        </div>
      </div>

      <div ref={userAndWarehouseRef} className="w-full bg-gray-100 py-2 px-4 mb-4 flex items-center">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 ml-2">
          {t("dashboard.section.userAndWarehouse")}
        </h2>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="w-full md:w-[49%] overflow-hidden rounded-lg border border-[rgba(0,0,0,0.1)] shadow-md">
          <div className="flex items-center justify-between px-6 mt-6 mb-4">
            <h3 className="text-[14px] md:text-lg font-semibold text-[#333] mb-0">
              {t("dashboard.chart.role.title")}
            </h3>
            <button
              onClick={() => navigate("/system/admin/dashboard-user")}
              className="text-[13px] text-blue-600 hover:underline font-medium"
            >
              {t("dashboard.button.details")}
            </button>
          </div>

          <ResponsiveContainer width="100%" height={isMobile ? 200 : 260}>
            <PieChart>
              <Pie
                data={rolePieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                label={renderCustomizedLabel}
                dataKey="value"
              >
                {rolePieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={ROLE_COLORS[index % ROLE_COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Phụ lục màu vai trò */}
          <div className="flex justify-center flex-wrap gap-4 mt-2 text-[12px]">
            {rolePieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-1">
                <div
                  className="w-4 h-4 rounded-sm"
                  style={{ backgroundColor: ROLE_COLORS[index % ROLE_COLORS.length] }}
                />
                <span className="text-[#333] whitespace-nowrap">{entry.type}</span>
              </div>
            ))}
          </div>
        </div>
        {warehouseCapacity && (
          <div className="w-full md:w-[49%] overflow-hidden rounded-lg border border-[rgba(0,0,0,0.1)] shadow-md">
            <div className="flex items-center justify-between px-6 mt-6 mb-4">
              <h3 className="text-[14px] md:text-lg font-semibold text-[#333] mb-0 flex items-center">
                <HomeOutlined className="mr-2 text-blue-500" />
                {t("dashboard.chart.warehouse.title")}
              </h3>
              <button
                onClick={() => navigate("/system/admin/manage-warehouse")}
                className="text-[13px] text-blue-600 hover:underline font-medium"
              >
                {t("dashboard.button.details")}
              </button>
            </div>


            <ResponsiveContainer width="100%" height={isMobile ? 200 : 260}>
              <PieChart>
                <Pie
                  data={warehousePieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  label={renderCustomizedLabel}
                  dataKey="value"
                >
                  <Cell key="used" fill="#CCCCCC" />
                  <Cell key="remaining" fill="#0088FE" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Phụ lục màu */}
            <div className="flex justify-center gap-6 mt-2 text-[12px]">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-[#CCCCCC] rounded-sm" />
                <span className="text-[#333] whitespace-nowrap">{t("dashboard.chart.warehouse.used")}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-[#0088FE] rounded-sm" />
                <span className="text-[#333] whitespace-nowrap">{t("dashboard.chart.warehouse.remain")}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div ref={supplierRequestRef} className="w-full bg-gray-100 py-2 px-4 mb-4 flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 ml-2">
          {t("dashboard.section.supplierRequest")}
        </h2>
        <button
          onClick={() => window.location.href = "http://localhost:3000/system/admin/manage-Supplier-orders"}
          className="text-sm text-blue-600 hover:underline"
        >
          {t("dashboard.button.details")}
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {/* Thu nguyên liệu */}
        <div className="w-full md:w-1/2 overflow-hidden rounded-lg border border-[rgba(0,0,0,0.1)] shadow-md p-4">
          <h3 className="text-[14px] md:text-lg font-semibold text-[#333] mb-4">
            {t("dashboard.chart.materialCollection.title")}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fuelRequestChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickFormatter={(value) => t(`dashboard.chart.materialStatus.${value}`)}
              />
              <YAxis allowDecimals={false} />
              <Tooltip
                formatter={(value) => value}
                labelFormatter={(label) => t(`dashboard.chart.materialStatus.${label}`)}
              />
              <Bar dataKey="value" fill="#4A90E2" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cung cấp nhiên liệu */}
        <div className="w-full md:w-1/2 overflow-hidden rounded-lg border border-[rgba(0,0,0,0.1)] shadow-md p-4">
          <h3 className="text-[14px] md:text-lg font-semibold text-[#333] mb-4">
            {t("dashboard.chart.materialSupply.title")}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fuelSupplyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickFormatter={(value) => t(`dashboard.chart.materialStatus.${value}`)}
              />
              <YAxis allowDecimals={false} />
              <Tooltip
                formatter={(value) => value}
                labelFormatter={(label) => t(`dashboard.chart.materialStatus.${label}`)}
              />
              <Bar dataKey="value" fill="#E74C3C" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div ref={materialAndPackagingRef} className="w-full bg-gray-100 py-2 px-4 mb-4 flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 ml-2">
          {t("dashboard.section.materialAndPackaging")}
        </h2>
        <button
          onClick={() => window.location.href = "http://localhost:3000/system/admin/manage-fuel"}
          className="text-sm text-blue-600 hover:underline"
        >
          {t("dashboard.button.details")}
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {/* 🟢 Phân bổ nguyên liệu đầu vào */}
        <div className="w-full h-800px md:w-1/2 overflow-hidden rounded-lg border border-[rgba(0,0,0,0.1)] shadow-md p-4">
          <h3 className="text-[14px] md:text-lg font-semibold text-[#333] mb-4">
            {t("dashboard.chart.rawMaterialDistribution.title")}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={filteredData}
                dataKey="value"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {fuelDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"][index % 5]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 🔵 Phân phối bao bì đã sử dụng */}
        <div className="w-full md:w-1/2 overflow-hidden rounded-lg border border-[rgba(0,0,0,0.1)] shadow-md p-4">
          <h3 className="text-[14px] md:text-lg font-semibold text-[#333] mb-4">
            {t("dashboard.chart.packagingDistribution.title")}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={packagingDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="type"
                tickFormatter={(value) => t(`dashboard.chart.packagingDistribution.${value}`)}
              />
              <YAxis allowDecimals={false} />
              <Tooltip
                formatter={(value) => value}
                labelFormatter={(label) => t(`dashboard.chart.packagingDistribution.${label}`)}
              />
              <Bar dataKey="value" fill="#4CAF50" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div ref={productionPlanRef} className="w-full bg-gray-100 py-2 px-4 mb-4 flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 ml-2">
          {t("dashboard.section.productionPlan")}
        </h2>
        <button
          onClick={() => window.location.href = "http://localhost:3000/system/admin/dashboard-production-request"}
          className="text-sm text-blue-600 hover:underline"
        >
          {t("dashboard.button.details")}
        </button>
      </div>
      {summaryStats && (
        <>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <Card loading={loading} className="shadow-md w-full md:w-1/2">
              <Statistic
                title={
                  <div className="text-lg font-bold text-gray-800">
                    {t("dashboard.process_card.currentActivity.title")}
                  </div>
                }
                valueRender={() => (
                  <div className="grid gap-4 text-gray-700">
                    <div>
                      <div
                        className="text-sm hover:text-blue-600 cursor-pointer transition"
                        onClick={() =>
                          navigate("/system/admin/production-request-list")
                        }
                      >
                        📄 {t("dashboard.process_card.currentActivity.totalPlans")}
                      </div>
                      <div className="text-xl font-semibold text-purple-600">
                        {summaryStats.totalProductionPlans}
                      </div>
                    </div>
                    <div>
                      <div
                        className="text-sm hover:text-blue-600 cursor-pointer transition"
                        onClick={() =>
                          navigate("/system/admin/processing-system?type=single")
                        }
                      >
                        🚀 {t("dashboard.process_card.currentActivity.executingSingle")}
                      </div>
                      <div className="text-xl font-semibold text-blue-600">
                        {summaryStats.executingSingle}
                      </div>
                    </div>
                    <div>
                      <div
                        className="text-sm hover:text-blue-600 cursor-pointer transition"
                        onClick={() =>
                          navigate("/system/admin/processing-system?type=consolidate")
                        }
                      >
                        🔄 {t("dashboard.process_card.currentActivity.executingConsolidate")}
                      </div>
                      <div className="text-xl font-semibold text-blue-600">
                        {summaryStats.executingConsolidate}
                      </div>
                    </div>
                  </div>
                )}
              />
            </Card>

            <Card loading={loading} className="shadow-md w-full md:w-1/2">
              <Statistic
                title={
                  <div className="text-lg font-bold text-gray-800">
                    {t("dashboard.process_card.summary.title")}
                  </div>
                }
                valueRender={() => (
                  <div className="grid gap-4 text-gray-700">
                    <div>
                      <div
                        className="text-sm hover:text-blue-600 cursor-pointer transition"
                        onClick={() =>
                          navigate(
                            "/system/admin/production-processing-list?type=single"
                          )
                        }
                      >
                        📦 {t("dashboard.process_card.summary.totalSingleProcess")}
                      </div>
                      <div className="text-xl font-semibold text-indigo-600">
                        {summaryStats.totalSingleProcess}
                      </div>
                    </div>
                    <div>
                      <div
                        className="text-sm hover:text-blue-600 cursor-pointer transition"
                        onClick={() =>
                          navigate(
                            "/system/admin/production-processing-list?type=consolidate"
                          )
                        }
                      >
                        📦 {t("dashboard.process_card.summary.totalConsolidateProcess")}
                      </div>
                      <div className="text-xl font-semibold text-indigo-600">
                        {summaryStats.totalConsolidateProcess}
                      </div>
                    </div>
                    <div>
                      <div
                        className="text-sm hover:text-blue-600 cursor-pointer transition"
                        onClick={() =>
                          navigate("/system/admin/production-processing?status=Đã duyệt")
                        }
                      >
                        ⏳ {t("dashboard.process_card.summary.waitingProcess")}
                      </div>
                      <div className="text-xl font-semibold text-red-600">
                        {summaryStats.plansWaitingProcessCreate?.length ?? 0}
                      </div>
                    </div>
                  </div>
                )}
              />
            </Card>
          </div>
        </>
      )}

      <div ref={finishedProductRef} className="w-full bg-gray-100 py-2 px-4 mb-4 flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 ml-2">
          {t("dashboard.section.finishedProduct")}
        </h2>
        <button
          onClick={() => window.location.href = "http://localhost:3000/system/admin/dashboard-finished-product"}
          className="text-sm text-blue-600 hover:underline"
        >
          {t("dashboard.button.details")}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Tổng số lô thành phẩm */}
        <Card onClick={() => navigate("/system/admin/finished_product_list")} className="h-full shadow-md">
          <Statistic
            title={
              <span>
                <i className="fas fa-boxes mr-1 text-blue-600" /> {t("dashboard.product.totalBatches")}
              </span>
            }
            value={productDashboard?.totalProducts || 0}
          />
        </Card>

        <Card className="h-full shadow-md">
          <Statistic
            title={
              <span>
                <i className="fas fa-warehouse mr-1 text-green-600" /> {t("dashboard.product.inStock")}
              </span>
            }
            valueRender={() => (
              <div className="space-y-1 text-sm">
                {(productDashboard?.productByType || []).length > 0 ? (
                  productDashboard.productByType.map((item, idx) => (
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
                        {item.type || t("dashboard.product.typeNumber", { number: idx + 1 })}
                      </span>
                      : <strong>{item.value}</strong>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500">{t("common.no_Data")}</span>
                )}
              </div>
            )}
          />
        </Card>

        <Card className="h-full shadow-md">
          <Statistic
            title={
              <span>
                <i className="fas fa-info-circle mr-1 text-gray-600" /> {t("dashboard.product.status")}
              </span>
            }
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
                  {t("dashboard.product.valid")}: <strong>{productDashboard?.validProducts || 0}</strong>
                </div>
                <div
                  className="cursor-pointer hover:text-red-500"
                  onClick={() =>
                    navigate("/system/admin/finished_product_list", {
                      state: { selectedStatus: "hết hạn" },
                    })
                  }
                >
                  <i className="fas fa-times-circle text-red-600 mr-1" />
                  {t("dashboard.product.expired")}: <strong>{productDashboard?.expiredProducts || 0}</strong>
                </div>
                <div
                  className="cursor-pointer hover:text-blue-500"
                  onClick={() =>
                    navigate("/system/admin/finished_product_list", {
                      state: { selectedStatus: "đang giao hàng" },
                    })
                  }
                >
                  <i className="fas fa-truck text-blue-600 mr-1" />
                  {t("dashboard.product.shipping")}: <strong>{productDashboard?.shippingProducts || 0}</strong>
                </div>
              </div>
            )}
          />
        </Card>
      </div>
    </div>
  );
};

export default DashboardComponent;
