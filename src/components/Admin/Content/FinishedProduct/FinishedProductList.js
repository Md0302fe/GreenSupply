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
import { AiFillProduct } from "react-icons/ai";
import { useLocation } from "react-router-dom";
const FinishedProductList = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [materialTypes, setMaterialTypes] = useState([]);
  const location = useLocation();
  const selectedMaterialId = location?.state?.selectedMaterialId || null;
  const [selectedType, setSelectedType] = useState(selectedMaterialId || "");
  const selectedStatus = location?.state?.selectedStatus || null;
  const [status, setStatus] = useState(selectedStatus || "");


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
      if (status) {
        filter["status"] = status;
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
  }, [searchText, selectedType, page, status]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-8">
      <div
        style={{ marginBottom: 24, marginTop: 24 }}
        className="flex items-center justify-between w-full"
      >
        {/* Nút quay lại bên trái */}
        <Button
          onClick={() => navigate(-1)}
          type="primary"
          className="flex items-center justify-center md:justify-start text-white font-semibold transition duration-300 shadow-sm px-2 md:px-3 py-1 bg-black hover:opacity-70 rounded-md min-w-[20px] md:min-w-[100px]"
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
        <h2 className="flex justify-center items-center gap-2 text-center font-bold text-[16px] md:text-2xl flex-grow mx-4 mt-1 mb-1 text-gray-800">
          <AiFillProduct></AiFillProduct>
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
        {products && products.length === 0 && !loading ? (
          <div className="text-center w-full py-10 text-gray-500 font-semibold text-lg">
            {t("harvestRequest.no_data")}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {products?.map((item) => (
              <div
                onClick={() => handleItemClick(item._id)}
                key={item._id}
                className="border rounded-xl p-2 cursor-pointer text-center bg-white shadow-md"
              >
                <img
                  src={default_image}
                  alt={item.name}
                  className="w-full h-40 object-contain mb-2"
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
        )}
      </Spin>
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
            {/* THÔNG TIN SẢN PHẨM */}
            <Form layout="vertical">
              <div className="space-y-4">
                <h3 className="font-bold text-lg border-b p-2 bg-gray-100">
                  {t("finishedProductList.orderInfo")}
                </h3>

                <Form.Item>
                  <Input
                    readOnly
                    value={`Mã thành phẩm: ${selectedProductDetail?.masanpham}`}
                  />
                </Form.Item>

                <Form.Item>
                  <Input
                    readOnly
                    value={`Tên thành phẩm: ${selectedProductDetail?.name}`}
                  />
                </Form.Item>

                <Form.Item>
                  <Input
                    readOnly
                    value={`Ngày sản xuất: ${selectedProductDetail?.created_date?.slice(0, 10)}`}
                  />
                </Form.Item>

                <Form.Item>
                  <Input
                    readOnly
                    value={`Hạn sử dụng: ${selectedProductDetail?.expiration_date}`}
                  />
                </Form.Item>

                <Form.Item>
                  <Input
                    readOnly
                    value={`Tình trạng: ${t(
                      `finishedProductList.statuses.${selectedProductDetail?.status}`
                    )}`}
                    style={{
                      color:
                        selectedProductDetail.status === "còn hạn"
                          ? "green"
                          : selectedProductDetail.status === "sắp hết hạn"
                            ? "orange"
                            : "red",
                    }}
                  />
                </Form.Item>

                <Form.Item>
                  <Input
                    readOnly
                    value={`Loại nguyên liệu: ${selectedProductDetail?.type_material_id?.fuel_type_id?.type_name
                      }`}
                  />
                </Form.Item>

                <Form.Item>
                  <Input
                    readOnly
                    value={`Số lượng tồn kho: ${selectedProductDetail?.quantity}`}
                  />
                </Form.Item>
              </div>
            </Form>

            {/* CHI TIẾT KẾ HOẠCH SẢN XUẤT */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg border-b p-2 bg-gray-100">
                {t("finishedProductList.productionRequestDetail")}
              </h3>

              <Input
                readOnly
                value={`Mã kế hoạch: ${selectedProductDetail?.origin_production_request_id?.production_id
                  }`}
              />
              <Input
                readOnly
                value={`Tên kế hoạch: ${selectedProductDetail?.origin_production_request_id?.request_name
                  }`}
              />
              <Input
                readOnly
                value={`Loại yêu cầu: ${selectedProductDetail?.origin_production_request_id?.request_type
                  }`}
              />
              <Input
                readOnly
                value={`Nguyên liệu sử dụng: ${selectedProductDetail?.origin_production_request_id?.material_quantity
                  } Kg`}
              />
              <Input
                readOnly
                value={`Ước tính hao hụt: ${selectedProductDetail?.origin_production_request_id?.loss_percentage
                  }%`}
              />
              <Input
                readOnly
                value={`Thành phẩm ước tính: ${selectedProductDetail?.origin_production_request_id?.product_quantity
                  } Kg`}
              />
              <Input
                readOnly
                value={`Mức độ ưu tiên: ${selectedProductDetail?.origin_production_request_id?.priority ?? "-"
                  }`}
              />
            </div>

            {/* BAO BÌ */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="font-bold text-lg border-b p-2 bg-gray-100">
                {t("finishedProductList.packagingInfo")}
              </h3>
              <Input
                readOnly
                value={`Túi chân không: ${selectedProductDetail?.origin_production_request_id?.packaging?.vacuumBagBoxId?.package_material_name || "-"
                  } - Số lượng: ${selectedProductDetail?.origin_production_request_id?.packaging?.vacuumBag || 0}`}
              />

              <Input
                readOnly
                value={`Thùng carton: ${selectedProductDetail?.origin_production_request_id?.packaging?.cartonBoxId?.package_material_name || "-"
                  } - Số lượng: ${selectedProductDetail?.origin_production_request_id?.packaging?.carton || 0}`}
              />
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
