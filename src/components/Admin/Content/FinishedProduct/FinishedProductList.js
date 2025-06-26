// frontend/CreateBox.js
import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  message,
  Upload,
  Spin,
  Pagination,
  Modal,
} from "antd";

import { UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import * as ProductServices from "../../../../services/ProductServices";
import { useTranslation } from "react-i18next";
import default_image from "../../../../assets/Feature_warehouse/prouct_carton_img.jpg";

const FinishedProductList = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [materialTypes, setMaterialTypes] = useState([]);

  // Phân trang
  const [page, setPage] = useState(1); // Lưu trang hiện tại
  const [total, setTotal] = useState(0); // Tổng số sản phẩm
  const pageSize = 8; // Số sản phẩm mỗi trang

  // popup chi tiết
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState(null);

  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  const fetchData = async () => {
    setLoading(true);
    try {
      const filter = {};
      if (searchText) {
        filter.$or = [
          { name: { $regex: searchText, $options: "i" } },
          { masanpham: { $regex: searchText, $options: "i" } },
        ];
      }
      if (selectedType) {
        filter["type_material_id"] = selectedType;
      }

      const res = await ProductServices.getAllProducts(
        pageSize,
        page - 1,
        {},
        filter
      );

      const uniqueTypes = [
        ...new Map(
          res.products.map((p) => [
            p.type_material_id._id,
            {
              _id: p.type_material_id._id,
              fuel_type_id: p.type_material_id.fuel_type_id,
            },
          ])
        ).values(),
      ];

      setMaterialTypes(uniqueTypes);
      setProducts(res.products);
      setTotal(res.totalCount);
    } catch (error) {
      console.error("LỖI API getAllProducts:", error);
      message.error(t("finishedProductList.fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = async (productId) => {
    setLoading(true);
    try {
      const detail = await ProductServices.getAllOrdersDetail(productId);
      setSelectedProductDetail(detail.productDetail);
      setIsModalVisible(true);
    } catch (error) {
      message.error(t("finishedProductList.detailError"));

      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchText, selectedType, page]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-100 p-2 lg:p-6">
      <div
        style={{ marginBottom: 24, marginTop: 24 }}
        className="flex items-center justify-between w-full"
      >
        {/* Nút quay lại bên trái */}
        <Button
          onClick={() => navigate(-1)}
          type="primary"
          className="flex items-center justify-center md:justify-start text-white font-semibold transition duration-300 shadow-sm px-2 md:px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded-md min-w-[20px] md:min-w-[100px]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 md:h-4 md:w-4 md:mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12H3m0 0l6-6m-6 6l6 6"
            />
          </svg>
          <span className="hidden md:inline">{t("fuelOrderStatus.back")}</span>
        </Button>

        {/* Tiêu đề ở giữa */}
        <h2 className="text-center font-bold text-[16px] md:text-4xl flex-grow mx-4 mt-1 mb-1">
          {t("finishedProductList.title")}
        </h2>

        {/* Phần tử trống bên phải để cân bằng với nút bên trái */}
        <div className="min-w-[20px] md:min-w-[100px]"></div>
      </div>
      <div className="flex flex-col md:flex-row gap-2 w-full max-w-5xl mb-4 items-center justify-center">
        <Input.Search
          placeholder={t("finishedProductList.searchPlaceholder")}
          allowClear
          enterButton={t("finishedProductList.searchButton")}
          size="large"
          className="w-full md:w-2/3"
          onSearch={(value) => {
            setSearchText(value);
          }}
        />

        <Select
          size="large"
          placeholder={t("finishedProductList.selectMaterialType")}
          className="w-full md:w-1/3"
          onChange={(value) => setSelectedType(value)}
          allowClear
          value={selectedType || undefined}
        >
          {materialTypes.map((type) => (
            <Select.Option key={type._id} value={type._id}>
              {type.fuel_type_id?.type_name || t("finishedProductList.unknown")}
            </Select.Option>
          ))}
        </Select>
      </div>

      <Spin spinning={loading} tip={t("finishedProductList.loading")}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {products?.map((item, index) => (
            <div
              onClick={() => handleItemClick(item._id)}
              key={item._id}
              className="border rounded-xl p-2 cursor-pointer text-center bg-white shadow-md"
            >
              <img
                src={default_image}
                alt={item.name}
                className="w-full h-24 object-contain mb-2"
              />
              <div className="text-sm font-semibold">
                {t("finishedProductList.productCode")}: {item.masanpham}
              </div>
              <div className="text-sm text-red-600">
                {t("finishedProductList.importDate")}: {item.created_date}
              </div>
              <div className="flex items-center gap-2 justify-center">
                <div className="text-sm font-bold text-black mt-1">
                  {t(`finishedProductList.statuses.${item?.status}`)}
                </div>
                <div
                  className="w-3 h-3 mt-1 rounded-full"
                  style={{
                    backgroundColor:
                      item.status === "còn hạn"
                        ? "green"
                        : item.status === "sắp hết hạn"
                        ? "orange"
                        : "red",
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 w-full">
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={(p) => setPage(p)}
            showSizeChanger={false}
            align="end"
          />
        </div>
      </Spin>
      <Modal
        title={
          <span style={{ fontSize: "24px", fontWeight: "bold" }}>
            {t("finishedProductList.modalTitle")}
          </span>
        }
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedProductDetail ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* THÔNG TIN ĐƠN HÀNG */}
            <div className="space-y-2">
              <h3 className="font-bold text-lg border-b p-2 bg-gray-100">
                {t("finishedProductList.orderInfo")}
              </h3>
              <p className="pl-2">
                <strong>{t("finishedProductList.productCode")}:</strong>{" "}
                {selectedProductDetail?.masanpham}
              </p>
              <p className="pl-2">
                <strong>{t("finishedProductList.productName")}:</strong>{" "}
                {selectedProductDetail?.name}
              </p>
              <p className="pl-2">
                <strong>{t("finishedProductList.productionDate")}:</strong>{" "}
                {selectedProductDetail?.created_date?.slice(0, 10)}
              </p>
              <p className="pl-2">
                <strong>{t("finishedProductList.expirationDate")}:</strong>{" "}
                {selectedProductDetail?.expiration_date}
              </p>
              <p className="pl-2">
                <strong>{t("finishedProductList.status")}:</strong>{" "}
                <span
                  style={{
                    color:
                      selectedProductDetail.status === "còn hạn"
                        ? "green"
                        : selectedProductDetail.status === "sắp hết hạn"
                        ? "orange"
                        : "red",
                  }}
                >
                  {t(`finishedProductList.statuses.${selectedProductDetail?.status}`)}
                </span>
              </p>
              <p className="pl-2">
                <strong>{t("finishedProductList.materialType")}:</strong>{" "}
                {
                  selectedProductDetail?.type_material_id?.fuel_type_id
                    ?.type_name
                }
              </p>
              <p className="pl-2">
                <strong>{t("finishedProductList.stockQuantity")}:</strong>{" "}
                {selectedProductDetail?.quantity}
              </p>
            </div>

            {/* THÔNG TIN CHI TIẾT */}
            <div className="space-y-2">
              <h3 className="font-bold text-lg border-b p-2 bg-gray-100">
                {t("finishedProductList.productionRequestDetail")}
              </h3>
              <p className="pl-2">
                <strong>{t("finishedProductList.productionId")}:</strong>{" "}
                {
                  selectedProductDetail?.origin_production_request_id
                    ?.production_id
                }
              </p>
              <p className="pl-2">
                <strong>{t("finishedProductList.requestName")}:</strong>{" "}
                {
                  selectedProductDetail?.origin_production_request_id
                    ?.request_name
                }
              </p>
              <p className="pl-2">
                <strong>{t("finishedProductList.requestType")}:</strong>{" "}
                {
                  selectedProductDetail?.origin_production_request_id
                    ?.request_type
                }
              </p>
              <p className="pl-2">
                <strong>{t("finishedProductList.materialQuantity")}:</strong>{" "}
                {
                  selectedProductDetail?.origin_production_request_id
                    ?.material_quantity
                }
              </p>
              <p className="pl-2">
                <strong>{t("finishedProductList.lossPercentage")}:</strong>{" "}
                {
                  selectedProductDetail?.origin_production_request_id
                    ?.loss_percentage
                }
                %
              </p>
              <p className="pl-2">
                <strong>{t("finishedProductList.productQuantity")}:</strong>{" "}
                {
                  selectedProductDetail?.origin_production_request_id
                    ?.product_quantity
                }
              </p>
              <p className="pl-2">
                <strong>{t("finishedProductList.priority")}:</strong>{" "}
                {selectedProductDetail?.origin_production_request_id?.priority}
              </p>
            </div>

            {/* CHI PHÍ / BAO BÌ nếu cần */}
            <div className="md:col-span-2 space-y-2">
              <h3 className="font-bold text-lg border-b p-2 bg-gray-100">
                {t("finishedProductList.packagingInfo")}
              </h3>
              <p className="pl-2">
                <strong>{t("finishedProductList.vacuumBag")}:</strong>{" "}
                {selectedProductDetail?.packaging?.vacuumBag} {t("finishedProductList.unit.bag")}
              </p>
              <p className="pl-2">
                <strong>{t("finishedProductList.cartonBox")}:</strong>{" "}
                {selectedProductDetail?.packaging?.carton} {t("finishedProductList.unit.carton")}
              </p>
            </div>
          </div>
        ) : (
          <p>{t("finishedProductList.noDetail")}</p>
        )}
      </Modal>
    </div>
  );
};

export default FinishedProductList;
