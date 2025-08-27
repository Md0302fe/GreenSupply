import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { Modal, Input, Select, Form, message } from "antd";
import { converDateString, convertDateStringV1 } from "../../ultils";
import * as ProductionRequestServices from "../../services/ProductServices";

import "./process.css";

import product_carton_img from "../../assets/Feature_warehouse/prouct_carton_img.jpg";

const StageComponent = ({
  stage,
  isOpen,
  noStage,
  onToggle,
  stageName,
  handleComplete,
  data,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { quantity, dataStage, dataProcess } = data;
  const [prevDataStage, setPrevDataStage] = useState();
  const [isCheckProduct, setIsCheckProduct] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [dataConsolidate, setDataConsolidate] = useState(
    dataProcess?.production_request_id || []
  );
  const [processType, setProcessType] = useState("");

  console.log("processType ", processType);

  // Data Product
  const [dataProduct, setDataProduct] = useState({
    name: "", // tên sản phẩm
    masanpham: "", // mã sản phẩm
    image: product_carton_img, // hình ảnh sản phẩm
    description: "", // mô tả của sản phẩm
    quantity: "", // khối lượng tịnh
    raw_material_type: "",
    created_date: "", // ngày tạo
    expiration_date: "", // ngày hết hạng
    certifications: "", // chứng chỉ
    origin_production_request_id: "", // mã yêu cầu
    numberOfVacuum: "", // số lượng túi chân không
    numberOfBag: "", // số lượng thùng carton
    nameOfVacuum: "", // tên loại túi chân không
    nameOfBag: "", // tên loại thùng carton
  });

  // Data Request
  const [dataRequest, setDataRequest] = useState({
    requestName: "", // tên kế hoạch
    requestCode: "", // mã kế hoạch
    requestType: "", // loại kế hoạch
    raw_material_quantity: "", // số lượng nguyên liệu thô
    loss_percentage: "", // ước tính % hao hụt
    product_quantity: "", // khối lượng thành phẩm đầu ra (kg)
    cteated_request: "", // ngày tạo kế hoạch
    end_date_request: "", // ngày kết thúc kế hoạch
    product_code: "", // mã thành phẩm
  });

  // dataUpdateStage1
  const [dataUpdateStage1, setDataUpdateStage1] = useState({
    lastQuantityStage1: 0,
    lossPercentStage1: 0,
    currentQuantity: 0,
  });
  // dataUpdateStage2
  const [dataUpdateStage2, setDataUpdateStage2] = useState({
    lastQuantityStage2: 0,
    lossPercentStage2: 0,
    currentQuantity: 0,
  });

  // dataUpdateStage4
  const [dataUpdateStage4, setDataUpdateStage4] = useState({
    lastQuantityStage4: 0,
    lossPercentStage4: 0,
    solutionConcentration: 0,
    soakingTime: 0,
    moistureBeforeDrying: 0,
    currentQuantity: 0,
    currentSolutionConcentration: 0,
    curentSoakingTime: 0,
    currentMoistureBeforeDrying: 0,
  });

  // dataUpdateStage5
  const [dataUpdateStage5, setDataUpdateStage5] = useState({
    lastQuantityStage5: 0,
    lossQuantityByDrying: 0,
    dryingTime: 0,
    currentDryingTime: 0,
    currentQuantity: 0,
  });

  // dataUpdateStage6
  const [dataUpdateStage6, setDataUpdateStage6] = useState({
    finalQuantityProduction: dataProcess?.finalQuantityProduction,
    totalVacum: 0,
    totalBag: 0,
    currentQuantity: 0,
  });

  // useEffect
  useEffect(() => {
    if (
      dataStage &&
      JSON.stringify(dataStage) !== JSON.stringify(prevDataStage)
    ) {
      // set type của quy trình
      setProcessType(dataProcess?.process_type);

      // prepare data for stage 1
      setDataUpdateStage1({
        ...dataStage[0],
        currentQuantity: dataStage[0]?.lastQuantityStage1,
      });
      // prepare data for stage 2
      setDataUpdateStage2({
        ...dataStage[1],
        currentQuantity: dataStage[1]?.lastQuantityStage2,
      });

      // prepare data for stage 4
      setDataUpdateStage4({
        ...dataStage[3],
        currentQuantity: dataStage[3]?.lastQuantityStage4,
        curentSoakingTime: dataStage[3]?.soakingTime,
        currentSolutionConcentration: dataStage[3]?.solutionConcentration,
        currentMoistureBeforeDrying: dataStage[3]?.moistureBeforeDrying,
      });

      // prepare data for stage 5
      setDataUpdateStage5({
        ...dataStage[4],
        currentQuantity: dataStage[4]?.lastQuantityStage5,
      });

      // prepare data for stage 6
      setDataUpdateStage6({
        ...dataStage[5],
        currentQuantity: dataStage[5]?.lastQuantityStage6,
        currentDryingTime: dataStage[5]?.dryingTime || 0,
        totalVacum: dataProcess?.production_request_id?.packaging?.vacuumBag,
        totalBag: dataProcess?.production_request_id?.packaging?.carton,
        finalQuantityProduction: dataProcess?.finalQuantityProduction,
      });

      setPrevDataStage(dataStage);
      setDataConsolidate(dataProcess?.production_request_id);
      setDataProduct(dataProcess?.production_request_id);
    }
  }, [dataStage, dataProcess]);

  // handle stage = 7
  // useEffect(() => {
  //   const fetchProductDetails = async () => {
  //     if (dataProcess) {
  //       if (parseInt(dataProcess?.current_stage) === 7) {
  //         const productCode = dataProcess?.production_request_id?.production_id;
  //         // Call API GET DATA PRODUCT
  //         const dataDetailsProduct =
  //           await ProductionRequestServices.getProductDetails(productCode);
  //         // if existed product
  //         if (dataDetailsProduct) {
  //           // get first record
  //           setProductData(dataDetailsProduct[0]);
  //           // Nếu đã save kho thì auto call API cập nhật stage cuối cùng
  //         }
  //       }
  //     }
  //   };
  //   fetchProductDetails();
  // }, [dataProcess]);

  const getDataUpdateByStage = () => {
    switch (parseInt(noStage)) {
      case 1:
        return dataUpdateStage1;
      case 2:
        return dataUpdateStage2;
      case 4:
        return dataUpdateStage4;
      case 5:
        return dataUpdateStage5;
      case 6:
        return dataUpdateStage6;
      case 7:
        return {};
      default:
        return null;
    }
  };

  const statusKeyMap = {
    "Đang thực thi": "executing",
    "Hoàn thành": "done",
    "Đã hủy": "cancelled",
    // Nếu API trả key tiếng Anh (executing, done...) thì có thể map ngược lại cũng được
    executing: "executing",
    done: "done",
    cancelled: "cancelled",
  };

  const statusKey = statusKeyMap[stage?.status];

  const getBackgroundColor = (statusKey) => {
    switch (statusKey) {
      case "executing":
        return "bg-yellow-200";
      case "done":
        return "bg-green-200";
      case "cancelled":
        return "bg-red-200";
      default:
        return "bg-gray-200";
    }
  };

  // Render form infomation for each stage
  const renderInfomation = () => {
    // render following stage
    switch (parseInt(noStage)) {
      case 1: {
        return renderNoStage1();
      }
      case 2: {
        return renderNoStage2();
      }
      case 3: {
        return renderNoStage3();
      }
      case 4: {
        return renderNoStage4();
      }
      case 5: {
        return renderNoStage5();
      }
      case 6: {
        return renderNoStage6();
      }
      case 7: {
        return renderNoStage7();
      }

      default:
        return null;
    }
  };

  // renderNoStage1
  const renderNoStage1 = () => {
    return (
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="info-box flex flex-col items-start text-left">
          <label
            htmlFor="id1"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ⚖️ {t("details_stage.quantity_sorting")}
          </label>
          <input
            type="number"
            min="0"
            id="id1"
            value={
              parseInt(dataUpdateStage1?.lastQuantityStage1) === 0
                ? undefined
                : dataUpdateStage1?.lastQuantityStage1
            }
            disabled={dataUpdateStage1?.currentQuantity > 0}
            onChange={(e) => {
              const inputValue = parseFloat(e.target.value) || 0;
              setDataUpdateStage1({
                lastQuantityStage1: inputValue,
                lossPercentStage1: ((quantity - inputValue) / quantity) * 100,
              });
            }}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
              dataUpdateStage1?.lastQuantityStage1
                ? "bg-gray-100 cursor-not-allowed"
                : ""
            }`}
            placeholder={t("details_stage.quantity_sorting")}
          />
        </div>

        <div className="info-box flex flex-col items-start text-left">
          <label
            htmlFor="id2"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ❌🥭 {t("details_stage.rejection_rate")}
          </label>
          <div
            id="id2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {`${dataUpdateStage1.lossPercentStage1}%`}
          </div>
        </div>
      </div>
    );
  };

  // renderNoStage2
  const renderNoStage2 = () => {
    return (
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="info-box flex flex-col items-start text-left">
          <label
            htmlFor="id1"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ⚖️ {t("details_stage.weight_after_cut")}
          </label>
          <input
            type="number"
            min="0"
            id="id2"
            value={
              parseInt(dataUpdateStage2?.lastQuantityStage2) === 0
                ? undefined
                : dataUpdateStage2?.lastQuantityStage2
            }
            disabled={dataUpdateStage2?.currentQuantity > 0}
            onChange={(e) => {
              const inputValue = parseFloat(e.target.value) || 0;
              const baseQuantity =
                parseFloat(dataUpdateStage1?.lastQuantityStage1) || 1; // tránh chia 0

              setDataUpdateStage2({
                lastQuantityStage2: inputValue,
                lossPercentStage2: parseFloat(
                  (((baseQuantity - inputValue) / baseQuantity) * 100).toFixed(
                    2
                  )
                ),
              });
            }}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
              dataUpdateStage2?.lastQuantityStage2
                ? "bg-gray-100 cursor-not-allowed"
                : ""
            }`}
            placeholder={t("details_stage.weight_after_cut")}
          />
        </div>

        <div className="info-box flex flex-col items-start text-left">
          <label
            htmlFor="id2"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ❌🥭 {t("details_stage.removal_rate")}
          </label>
          <div
            id="id2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {dataUpdateStage2?.lossPercentStage2} %
          </div>
        </div>
      </div>
    );
  };

  // renderNoStage3
  const renderNoStage3 = () => {
    return <> </>;
  };

  // renderNoStage4
  const renderNoStage4 = () => {
    return (
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Nồng độ dung dịch */}
        <div className="info-box flex flex-col items-start text-left">
          <label
            htmlFor="id1"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ⚖️{t("details_stage.weight_after_soaking")}
          </label>
          <input
            type="number"
            min="0"
            id="id4"
            value={
              parseInt(dataUpdateStage4?.lastQuantityStage4) === 0
                ? undefined
                : dataUpdateStage4?.lastQuantityStage4
            }
            disabled={dataUpdateStage4?.currentQuantity > 0}
            onChange={(e) => {
              const inputValue = parseFloat(e.target.value) || 0;
              const baseQuantity = parseFloat(quantity) || 1; // quantity: khối lượng ban đầu hoặc từ stage trước

              setDataUpdateStage4((prev) => ({
                ...prev,
                lastQuantityStage4: inputValue,
                lossPercentStage4: parseFloat(
                  (((baseQuantity - inputValue) / baseQuantity) * 100).toFixed(
                    2
                  )
                ),
              }));
            }}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
              dataUpdateStage4?.lastQuantityStage4
                ? "bg-gray-100 cursor-not-allowed"
                : ""
            }`}
            placeholder={t("details_stage.weight_after_soaking")}
          />
        </div>

        {/* Nồng độ dung dịch */}
        <div className="info-box flex flex-col items-start text-left">
          <label
            htmlFor="id1"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
          ⚖️{t("details_stage.solution_concentration")}
          </label>
          <input
            type="text"
            id="id1"
            value={
              parseInt(dataUpdateStage4?.solutionConcentration) === 0
                ? undefined
                : dataUpdateStage4?.solutionConcentration
            }
            disabled={dataUpdateStage4?.currentSolutionConcentration > 0}
            onChange={(e) => {
              setDataUpdateStage4((prev) => ({
                ...prev,
                solutionConcentration: e.target.value,
              }));
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder={t("details_stage.solution_concentration")}
          />
        </div>

        {/* Thời gian ngâm */}
        <div className="info-box flex flex-col items-start text-left">
          <label
            htmlFor="id1"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ⚖️{t("details_stage.soaking_time")}
          </label>
          <input
            type="number"
            min="0"
            id="id1"
            value={
              parseInt(dataUpdateStage4?.soakingTime) === 0
                ? undefined
                : dataUpdateStage4?.soakingTime
            }
            disabled={dataUpdateStage4?.soakingTime > 0}
            onChange={(e) => {
              setDataUpdateStage4((prev) => ({
                ...prev,
                soakingTime: e.target.value,
              }));
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder={t("details_stage.soaking_time")}
          />
        </div>

        {/* Độ ẩm trước khi xấy */}
        <div className="info-box flex flex-col items-start text-left">
          <label
            htmlFor="id1"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("details_stage.pre_drying_moisture")}
          </label>
          <input
            type="number"
            min="0"
            id="id1"
            value={
              parseInt(dataUpdateStage4?.moistureBeforeDrying) === 0
                ? undefined
                : dataUpdateStage4?.moistureBeforeDrying
            }
            disabled={dataUpdateStage4?.currentMoistureBeforeDrying > 0}
            onChange={(e) => {
              setDataUpdateStage4((prev) => ({
                ...prev,
                moistureBeforeDrying: e.target.value,
              }));
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder={t("details_stage.pre_drying_moisture")}
          />
        </div>
      </div>
    );
  };

  // renderNoStage5
  const renderNoStage5 = () => {
    return (
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Nồng độ dung dịch */}
        <div className="info-box flex flex-col items-start text-left">
          <label
            htmlFor="id1"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ⚖️{t("details_stage.weight_after_drying")}
          </label>
          <input
            type="text"
            id="id1"
            value={
              parseInt(dataUpdateStage5?.lastQuantityStage5) === 0
                ? undefined
                : dataUpdateStage5?.lastQuantityStage5
            }
            disabled={dataUpdateStage5?.currentQuantity > 0}
            onChange={(e) => {
              setDataUpdateStage5((prev) => ({
                ...prev,
                lastQuantityStage5: e.target.value,
                lossQuantityByDrying:
                  ((dataUpdateStage4?.lastQuantityStage4 -
                    parseFloat(e.target.value)) /
                    dataUpdateStage4?.lastQuantityStage4) *
                  100,
              }));
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder={t("details_stage.weight_after_drying")}
          />
        </div>
        {/* % hao hụt do mất nước */}
        <div className="info-box flex flex-col items-start text-left">
          <label
            htmlFor="id2"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ❌🥭% {t("details_stage.weight_loss_rate")}
          </label>
          <div
            id="id2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {`${dataUpdateStage5.lossQuantityByDrying}%`}
          </div>
        </div>

        {/* Thời gian ngâm */}
        <div className="info-box flex flex-col items-start text-left">
          <label
            htmlFor="id1"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ⚖️{t("details_stage.drying_time")}
          </label>
          <input
            type="number"
            min="0"
            id="id1"
            value={
              parseInt(dataUpdateStage6?.dryingTime) === 0
                ? undefined
                : dataUpdateStage6?.dryingTime
            }
            disabled={dataUpdateStage6?.currentDryingTime > 0}
            onChange={(e) => {
              setDataUpdateStage5((prev) => ({
                ...prev,
                dryingTime: e.target.value,
              }));
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder={t("details_stage.drying_time")}
          />
        </div>
      </div>
    );
  };

  // renderNoStage6
  const renderNoStage6 = () => {
    return (
      <>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Nồng độ dung dịch */}
          <div className="info-box flex flex-col items-start text-left">
            <label
              htmlFor="id1"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              ⚖️{t("details_stage.weight_after_cooling")}
            </label>
            <input
              type="text"
              id="id1"
              value={
                parseInt(dataUpdateStage6?.finalQuantityProduction) === 0
                  ? undefined
                  : dataUpdateStage6?.finalQuantityProduction
              }
              disabled={dataProcess?.finalQuantityProduction > 0}
              onChange={(e) => {
                setDataUpdateStage6((prev) => ({
                  ...prev,
                  finalQuantityProduction: e.target.value,
                }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder={t("details_stage.weight_after_cooling")}
            />
          </div>

          {processType === "single_processes" && (
            <>
              <div className="info-box flex flex-col items-start text-left">
                <label
                  htmlFor="id2"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  💨{t("details_stage.bags_quantity")}
                </label>
                <div
                  id="id2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {`${dataUpdateStage6?.totalVacum}`}
                </div>
              </div>
              {/* Số lượng thùng cần dùng - đối với quy trình đơn */}
              <div className="info-box flex flex-col items-start text-left">
                <label
                  htmlFor="id2"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  📦{t("details_stage.cartons_quantity")}
                </label>
                <div
                  id="id2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {`${dataUpdateStage6?.totalBag}`}
                </div>
              </div>
            </>
          )}
          {/* Form Product Data */}
          {renderProductFormData()}
        </div>
        {/* data product || nếu là 1 array thì foreach ra data*/}
        {processType === "single_processes" ? (
          <div className="flex flex-wrap gap-3">
            <div
              className="min-w-52 h-32 bg-cover bg-center rounded-lg shadow-md cursor-pointer transform transition duration-300 hover:scale-105"
              style={{ backgroundImage: `url(${product_carton_img})` }}
              onClick={() => {
                setIsModalVisible(true);
              }}
            >
              <div className="bg-black bg-opacity-50 text-white h-full w-full flex flex-col justify-center items-center rounded-lg px-2">
                <p className="text-sm text-white font-semibold">
                  Mã SP: {dataProduct?.production_id}
                </p>
                <p className="text-sm text-white">
                  Khối lượng: {dataProduct?.product_quantity}
                </p>
                <p className="text-xs text-white mt-1 italic">Xem Thành Phẩm</p>
              </div>
            </div>
          </div>
        ) : (
          // trường hợp là 1 array các yêu cầu - thành phẩm
          <div className="flex flex-wrap gap-3">
            {processType === "consolidated_processes" &&
              dataConsolidate &&
              dataConsolidate?.map((item, index) => (
                <div
                  key={index}
                  className="min-w-52 h-32 bg-cover bg-center rounded-lg shadow-md cursor-pointer transform transition duration-300 hover:scale-105"
                  style={{ backgroundImage: `url(${product_carton_img})` }}
                  onClick={() => {
                    setDataRequest(item);
                    setDataProduct(item);
                    setIsModalVisible(true);
                  }}
                >
                  <div className="bg-black bg-opacity-50 text-white h-full w-full flex flex-col justify-center items-center rounded-lg px-2">
                    <p className="text-sm text-white font-semibold">
                      Mã SP: {item?.production_id}
                    </p>
                    <p className="text-sm text-white">
                      Khối lượng: {item?.product_quantity}
                    </p>
                    <p className="text-xs text-white mt-1 italic">
                      Xem Thành Phẩm
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </>
    );
  };

  // renderNoStage1
  const renderNoStage7 = () => {
    return (
      <div className="info-box flex flex-col items-start text-left mr-1">
        <p className="text-gray-500 text-xs mb-1">
          🔄 {t("stage.field.status")}
        </p>
        <span
          className={`inline-block text-xs px-1 py-0.5 rounded
            ${
              stage?.status === t("processDetails.status.executing")
                ? "bg-yellow-100 text-yellow-700"
                : stage?.status === t("processDetails.status.done")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
        >
          {stage?.status}
        </span>
      </div>
    );
  };

  const handleSaveCheckProduct = () => {
    // const requiredFields = {
    //   quantity: "Khối lượng tịnh",
    // };

    // const missingFields = Object.entries(requiredFields).filter(
    //   ([key]) =>
    //     dataProduct[key] === "" ||
    //     dataProduct[key] === null ||
    //     dataProduct[key] === undefined
    // );

    // // kiểm tra - thông báo khi không đủ thông tin
    // if (missingFields.length > 0) {
    //   const firstMissing = missingFields[0][1];
    //   message.error(`Vui lòng nhập ${firstMissing}`);
    //   return;
    // }
    setIsCheckProduct(true);
    setIsModalVisible(false);
  };

  // Render data of product
  const renderProductFormData = () => {
    if (!dataProduct)
      return message.warning("Dữ liệu sản phẩm hiện không sẳn có");

    // set 1 số thông số trước của sản phẩm
    const created_date = new Date(); // Ngày tạo = hôm nay
    const expiration_date = new Date(created_date);
    expiration_date.setMonth(expiration_date.getMonth() + 5); // Cộng thêm 5 tháng

    const product = {
      ...dataProduct,
      masanpham: dataProduct?.production_id, // get product code from production request plan
      raw_material_type: dataProduct?.material?.fuel_type_id?.type_name, // tên nguyên liệu
      created_date: convertDateStringV1(created_date), // ngày tạo hàng
      expiration_date: convertDateStringV1(expiration_date), // ngày hết hạn
      origin_production_request_id: dataProduct?._id,
      // data package
      numberOfVacuum: dataProduct?.packaging?.vacuumBag,
      numberOfBag: dataProduct?.packaging?.carton,
      nameOfVacuum:
        dataProduct?.packaging?.vacuumBagBoxId?.package_material_name,
      nameOfBag: dataProduct?.packaging?.cartonBoxId?.package_material_name,
    };

    return (
      <Modal
        title={
          <span
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              position: "relative",
              top: "10px",
            }}
          ></span>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => handleSaveCheckProduct()} // hàm lưu dữ liệu
        width={800}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* THÔNG TIN SẢN PHẨM */}
          <Form form={form} layout="vertical">
            <div className="space-y-4">
              <h3 className="font-bold text-lg border-b p-2 bg-gray-100">
                Thông tin sản phẩm
              </h3>

              {/* Mã kế hoạch */}
              <Form.Item>
                <Input
                  readOnly
                  value={`Mã kế hoạch : ${product?.origin_production_request_id}`}
                />
              </Form.Item>

              {/* Mã thành phẩm */}
              <Form.Item>
                <Input
                  readOnly
                  placeholder={t("finishedProductList.productCode")}
                  value={`Mã thành phẩm : ${product.masanpham}`}
                />
              </Form.Item>

              {/* Tên sản phẩm (cho nhập + required) */}
              {/* <Form.Item
                name="name"
                rules={[
                  { required: true, message: "Vui lòng nhập tên sản phẩm" },
                ]}
              >
                <Input
                  placeholder={t("finishedProductList.productName")}
                  value={product.name}
                  onChange={(e) =>
                    setDataProduct({ ...product, name: e.target.value })
                  }
                />
              </Form.Item> */}

              {/* Khối lượng tịnh (cho nhập + required) */}
              <Form.Item>
                <Input
                  readOnly
                  placeholder="Khối lượng thành phẩm"
                  value={`Thành phẩm : ${product?.product_quantity}`}
                />
              </Form.Item>

              {/* Ngày tạo sản phẩm */}
              <Form.Item>
                <Input
                  readOnly
                  className="w-full"
                  placeholder={t("finishedProductList.productionDate")}
                  value={`Ngày tạo : ${product?.created_date}`}
                />
              </Form.Item>

              {/* Ngày hết hạn */}
              <Form.Item>
                <Input
                  readOnly
                  className="w-full"
                  placeholder={t("finishedProductList.expirationDate")}
                  value={`Ngày hết hạn : ${product?.expiration_date}`}
                />
              </Form.Item>

              {/* Loại nguyên liệu */}
              <Form.Item>
                <Input
                  readOnly
                  placeholder={t("finishedProductList.materialType")}
                  value={`Nguyên liệu : ${product?.raw_material_type}`}
                />
              </Form.Item>
            </div>
          </Form>

          {/* CHI TIẾT YÊU CẦU SẢN XUẤT */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg border-b p-2 bg-gray-100">
              Chi tiết kế hoạch sản xuất
            </h3>
            {/* mã kế hoạch */}
            <Input
              placeholder={t("finishedProductList.productionId")}
              value={`Mã kế hoạch : ${product?.origin_production_request_id}`}
            />

            {/* Mã thành phẩm */}
            <Input
              placeholder={t("finishedProductList.productCode")}
              value={`Mã thành phẩm : ${product.masanpham}`}
            />

            <Input
              placeholder={t("finishedProductList.requestName")}
              value={`${dataProduct?.request_name}`}
            />

            <Input
              type="text"
              placeholder={t("finishedProductList.productQuantity")}
              value={`Khối lượng thành phẩm ước tính : ${dataProduct?.product_quantity} (kg)`}
            />

            <Input
              placeholder={t("finishedProductList.requestType")}
              value={dataProduct?.request_type}
            />

            <Input
              type="text"
              placeholder={t("finishedProductList.lossPercentage")}
              value={`Ước tính hao hụt : ${dataProduct?.loss_percentage}%`}
            />

            <Input
              type="text"
              placeholder={t("finishedProductList.materialQuantity")}
              value={`Nguyên liệu : ${product?.raw_material_type} - ${dataProduct?.material_quantity} (kg)`}
            />
          </div>

          {/* CHI PHÍ / BAO BÌ */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-bold text-lg border-b p-2 bg-gray-100">
              {t("finishedProductList.packagingInfo")}
            </h3>

            {/* Túi Chân Không */}
            <Input
              type="text"
              placeholder="Túi Chân Không"
              value={`${product?.nameOfVacuum} - Số lượng : ${product?.numberOfVacuum}`}
            />

            {/* Thùng carton */}
            <Input
              type="text"
              placeholder="Thùng carton"
              value={`${product?.nameOfBag} - Số lượng : ${product?.numberOfBag}`}
            />
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <>
      <div
        className={`
    ${statusKey === "executing" ? "bg-animated" : ""}
    w-full max-w-[1000px] rounded-lg shadow-md transition-all duration-300 ease-in-out overflow-hidden flex flex-col relative z-10
    ${getBackgroundColor(statusKey)}
    ${isOpen ? "p-1 lg:p-6 max-h-[500px]" : "px-1 lg:px-4 max-h-[50px]"}
  `}
      >
        <div
          className="grid grid-cols-12 items-center cursor-pointer"
          onClick={onToggle}
        >
          {/* Giai đoạn X - không xuống hàng */}
          <div className="text-black text-sm md:text-lg font-bold p-2 col-span-4 sm:col-span-3 whitespace-nowrap">
            {t("stage.title", { no: noStage })}
          </div>

          {/* Tên giai đoạn - truncate khi đóng, hiển thị đầy đủ khi mở */}
          <div
            className={`
      text-black text-sm md:text-lg font-bold p-2 col-span-7 sm:col-span-8
      ${isOpen ? "whitespace-normal break-words" : "truncate"}
    `}
          >
            🔖 {stageName}
          </div>

          {/* Icon mũi tên */}
          <div className="flex justify-end col-span-1">
            <div
              className="text-black text-lg font-bold rounded p-2 cursor-pointer"
              onClick={onToggle}
            >
              {isOpen ? (
                <span className="transition-transform duration-300 rotate-180">
                  ⬆️
                </span>
              ) : (
                <span className="transition-transform duration-300">⬇️</span>
              )}
            </div>
          </div>
        </div>

        {/* ✨ Animation sổ xuống */}
        <div
          className={`bg-white transition-all duration-500 ease-in-out overflow-hidden p-3 rounded-md m-2
          ${
            isOpen
              ? "opacity-100 scale-y-100 max-h-[500px]"
              : "opacity-0 scale-y-0 max-h-0"
          }
          `}
        >
          {stage && Object.keys(stage).length > 0 ? (
            <>
              <div className="grid grid-cols-1 mt-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs p-0 lg:p-3 min-h-[50px]">
                {/* Gộp ngày bắt đầu và kết thúc thành 1 block để hiển thị dọc ở mobile */}
                <div className="flex flex-col sm:flex-row sm:col-span-2 gap-2 w-full">
                  {/* Ngày bắt đầu */}
                  <div className="info-box flex flex-col items-start text-left w-full">
                    <p className="text-gray-500 text-xs mb-1">
                      📅 {t("stage.field.start")}
                    </p>
                    <p className="font-medium text-gray-800 text-sm">
                      {converDateString(stage?.start_time) || ""}
                    </p>
                  </div>

                  {/* Ngày kết thúc */}
                  <div className="info-box flex flex-col items-start text-left w-full">
                    <p className="text-gray-500 text-xs mb-1">
                      📅 {t("stage.field.end")}
                    </p>
                    <p className="font-medium text-gray-800 text-sm">
                      {converDateString(stage?.end_time)}
                    </p>
                  </div>
                </div>

                {/* Trạng thái */}
                <div className="info-box flex flex-col items-start text-left mr-1">
                  <p className="text-gray-500 text-xs mb-1">
                    🔄 {t("stage.field.status")}
                  </p>
                  <span
                    className={`inline-block text-xs px-1 py-0.5 rounded
            ${
              stage?.status === t("processDetails.status.executing")
                ? "bg-yellow-100 text-yellow-700"
                : stage?.status === t("processDetails.status.done")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
                  >
                    {stage?.status}
                  </span>
                </div>

                {/* Người xử lý */}
                <div className="info-box flex flex-col items-start text-left">
                  <p className="text-gray-500 text-xs mb-1">
                    👤 {t("stage.field.user")}
                  </p>
                  <p className="font-medium text-gray-800 text-sm">
                    {stage?.user?.name || t("stage.system")}
                  </p>
                </div>
              </div>

              {/* Box confirm infomation each stage */}
              <div className="flex flex-col gap-2 mt-2">
                {/* Infomation Render Following NoStage */}
                {renderInfomation()}

                {/* Box note and finish button */}
                <div className="flex gap-4">
                  {/* Ghi chú */}
                  <div className="bg-white shadow-sm border border-gray-200 rounded p-1 w-[85%] col-span-2 sm:col-span-2 md:col-span-3">
                    <p className="text-gray-500 text-xs ">
                      📝 {t("stage.field.note")}
                    </p>
                    <p className="font-medium text-gray-800 text-sm">
                      {stage?.note}
                    </p>
                  </div>
                  {/* Nút hoàn thành */}
                  {stage?.status === "Đang thực thi" && (
                    <div className="info-box flex justify-end items-end">
                      <button
                        className="bg-gradient-to-r from-green-500 to-green-600 
             text-white text-sm font-semibold py-2 px-2 rounded-lg shadow-md 
             transition duration-300 ease-in-out transform 
             hover:scale-105 hover:from-green-600 hover:to-green-700
             disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:from-green-500 disabled:hover:to-green-600"
                        // disabled={
                        //   !isCheckProduct ||
                        //   parseInt(dataProcess?.current_stage) === 7
                        // }
                        onClick={() =>
                          handleComplete({
                            noStage,
                            stage_id: stage._id,
                            dataUpdate: getDataUpdateByStage(),
                          })
                        }
                      >
                        {t("stage.button.complete")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center p-6 min-h-[150px]">
              <p className="text-gray-500 italic text-sm">
                ⚠️ {t("stage.empty")}
              </p>
            </div>
          )}
        </div>
        {/*  */}
      </div>
    </>
  );
};

export default StageComponent;
