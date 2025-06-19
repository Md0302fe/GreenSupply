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
import { useTranslation } from "react-i18next";

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
        const res = await ProductionRequestServices.getProductionChartData({
          access_token: token,
        });

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
              className="w-full md:w-auto bg-[#005a2c] hover:bg-[#00a34b] text-white font-bold text-sm py-1 px-2 rounded"
              onClick={() => navigate("/system/admin/C_purchase-order")}
            >
              {t("dashboard.button.createPurchase")}
            </button>

            <button
              className="w-full md:w-auto bg-[#005a2c] hover:bg-[#00a34b] text-white font-bold text-sm py-1 px-2 rounded"
              onClick={() => navigate("/system/admin/production-request")}
            >
              {t("dashboard.button.createProduction")}
            </button>

            <button
              className="w-full md:w-auto bg-[#005a2c] hover:bg-[#00a34b] text-white font-bold text-sm py-1 px-2 rounded"
              onClick={() => navigate("/system/admin/production-processing")}
            >
              {t("dashboard.button.createProcess")}
            </button>

            <button
              className="w-full md:w-auto bg-[#005a2c] hover:bg-[#00a34b] text-white font-bold text-sm py-1 px-2 rounded"
              onClick={() => navigate("/system/admin/material-storage-export")}
            >
              {t("dashboard.button.createExport")}
            </button>

            <button
              className="w-full md:w-auto bg-[#005a2c] hover:bg-[#00a34b] text-white font-bold text-sm py-1 px-2 rounded"
              onClick={() => navigate("/system/admin/View-Order-Success")}
            >
              {t("dashboard.button.createImport")}
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
              data={dataProductionStatus}
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

    </div>
  );
};

export default DashboardComponent;
