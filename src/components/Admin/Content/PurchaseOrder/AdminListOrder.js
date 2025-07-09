import React, { useEffect, useRef, useState } from "react";
import "./Order.scss";

import { Button, Form, Input, Space, Upload , message } from "antd";

import * as UserServices from "../../../../services/UserServices";
import * as PurchaseOrderServices from "../../../../services/PurchaseOrderServices";

import { Tag } from "antd";

import { SearchOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useMutationHooks } from "../../../../hooks/useMutationHook";
import { useQuery } from "@tanstack/react-query";
import { convertDateStringV1 } from "../../../../ultils";

import TableOrder from "./TableOrder";
import Loading from "../../../LoadingComponent/Loading";
import ModalComponent from "../../../ModalComponent/ModalComponent";
import DrawerComponent from "../../../DrawerComponent/DrawerComponent";
import Highlighter from "react-highlight-words";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { useLocation, useNavigate } from "react-router-dom";
import { getBase64, convertPrice } from "../../../../ultils";

import { HiOutlineDocumentSearch } from "react-icons/hi";

import * as FuelTypeServices from "../../../../services/FuelTypesServices";
import { useTranslation } from "react-i18next";
const UserComponent = () => {
  const { t } = useTranslation();
  // gọi vào store redux get ra user
  const [rowSelected, setRowSelected] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoadDetails, setIsLoadDetails] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [isConfirmUpdateOpen, setIsConfirmUpdateOpen] = useState(false);
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);
  const [isConfirmAccept, setIsConfirmAccept] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const [fuel_types, setFuel_Types] = useState({});

  const user = useSelector((state) => state.user);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const filterStatus = queryParams.get("status"); // Ví dụ: "Chờ duyệt"

  const navigate = useNavigate();

  //  Search Props
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const [formUpdate] = Form.useForm();
  const searchInput = useRef(null);

  //  State Details quản lý products khi có req edit
  const [purchaseDetails, setPurchaseDetails] = useState({
    request_name: "",
    quantity: 0,
    quantity_remain: 0,
    status: "",
    estimate_price: 0,
    fuel_type: "",
    note: "",
    updatedAt: "",
    fuel_image: "",
  });

  // Fetch : Get User Details
  const fetchGetPurchaseDetail = async ({ id, access_token }) => {
    try {
      setIsLoadDetails(true);
      const res = await PurchaseOrderServices.getDetailPurchaseOrder(
        id,
        access_token
      );

      if (res?.PurchaseOrderDetail) {
        setPurchaseDetails({
          request_name: res.PurchaseOrderDetail.request_name,
          start_received: res.PurchaseOrderDetail.start_received,
          end_received: res.PurchaseOrderDetail.end_received,
          due_date: res.PurchaseOrderDetail.due_date,
          quantity: res.PurchaseOrderDetail.quantity,
          quantity_remain: res.PurchaseOrderDetail.quantity_remain,
          status: res.PurchaseOrderDetail.status,
          price: res.PurchaseOrderDetail.price,
          fuel_type: res.PurchaseOrderDetail.fuel_type,
          updatedAt: res.PurchaseOrderDetail.updatedAt,
          fuel_image: res.PurchaseOrderDetail.fuel_image,
          total_price: res.PurchaseOrderDetail.total_price,
          priority: res.PurchaseOrderDetail.priority,
          note: res.PurchaseOrderDetail.note,
        });
      }
    } catch (error) {
      console.error("Error fetching purchase details:", error);
    } finally {
      setIsLoadDetails(false);
    }
  };

  // Handle Click Btn Edit Detail Product : Update product
  const handleDetailsProduct = () => {
    setIsDrawerOpen(true);
    fetchGetPurchaseDetail({
      id: rowSelected,
      access_token: user?.access_token,
    });
  };

  const mutationUpdatePurchaseOrder = useMutationHooks((data) => {
    return PurchaseOrderServices.updatePurchaseOrder(data);
  });

  const { isSuccess: updateSuccess, data: dataUpdate } =
    mutationUpdatePurchaseOrder;

  useEffect(() => {
    if (updateSuccess) {
      if (dataUpdate.status) {
        message.success("Update Purchased Order Success");
        setIsDrawerOpen(false);
      } else {
        message.success("Update Purchased Order Fail");
      }
    }
  }, [updateSuccess]);

  const mutationAcceptPurchaseOrder = useMutationHooks((data) => {
    return PurchaseOrderServices.acceptPurchaseOrder(data);
  });

  const { isSuccess: AcceptSuccess, data: dataAccept } =
    mutationAcceptPurchaseOrder;

  useEffect(() => {
    if (AcceptSuccess) {
      if (dataAccept.status) {
        message.success("Accept Purchased Order Success");
        setIsDrawerOpen(false);
      } else {
        message.success("Accept Purchased Order Fail");
      }
    }
  }, [AcceptSuccess]);

  const mutationSoftDelete = useMutationHooks((data) => {
    return PurchaseOrderServices.deletePurchaseOrder(
      data.id,
      data.access_token
    );
  });

  // Cập nhật thông tin
  const handleUpdatePurchaseOrder = () => {
    const validationErrors = validatePurchaseDetails();

    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => message.warning(error));
      return; // Dừng lại nếu có lỗi
    }

    mutationUpdatePurchaseOrder.mutate(
      {
        id: rowSelected,
        access_token: user?.access_token,
        dataUpdate: purchaseDetails,
      },
      {
        onSettled: () => {
          queryPurchased.refetch(); // Cập nhật danh sách đơn hàng
        },
      }
    );
  };

  // Cập nhật trạng thái - Duyệt đơn
  const handleAcceptPurchaseOrder = () => {
    const validationErrors = validatePurchaseDetails();

    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => message.warning(error));
      return; // Dừng lại nếu có lỗi
    }

    mutationAcceptPurchaseOrder.mutate(
      {
        id: rowSelected,
        access_token: user?.access_token,
        dataUpdate: purchaseDetails,
      },
      {
        onSettled: () => {
          queryPurchased.refetch(); // Cập nhật danh sách đơn hàng
        },
      }
    );
  };

  const validatePurchaseDetails = () => {
    const errors = [];

    if (
      !purchaseDetails.request_name ||
      purchaseDetails.request_name.trim() === ""
    ) {
      errors.push("Tên đơn hàng không được để trống!");
    }

    if (!purchaseDetails.fuel_type || purchaseDetails.fuel_type.trim() === "") {
      errors.push("Loại Nguyên liệu không được để trống!");
    }

    if (!purchaseDetails.start_received) {
      errors.push("Vui lòng chọn ngày bắt đầu nhận đơn!");
    }

    if (!purchaseDetails.end_received) {
      errors.push("Vui lòng chọn ngày kết thúc nhận đơn!");
    }

    if (!purchaseDetails.due_date) {
      errors.push("Vui lòng chọn hạn chót hoàn thành đơn!");
    }

    // Điều kiện 1: Ngày bắt đầu phải <= ngày kết thúc
    // Điều kiện 1: Ngày bắt đầu phải <= ngày kết thúc
    return errors;
  };

  // Mutation - Delete Productd
  const mutationDelete = useMutationHooks((data) => {
    const { id, token } = data;
    return UserServices.blockUser(id, token);
  });

  const {
    data: deleteRespone,
    isPending: isPendingDelete,
    isSuccess: isSuccessDelete,
  } = mutationDelete;

  // Handle Notification and set loading for delete function
  useEffect(() => {
    if (isSuccessDelete) {
      if (deleteRespone?.status === "OK") {
        setIsOpenDelete(false);
        message.success(deleteRespone?.message);
      } else {
        message.success(deleteRespone?.message);
        setIsOpenDelete(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessDelete]);

  useEffect(() => {
    if (rowSelected && isDrawerOpen) {
      fetchGetPurchaseDetail({
        id: rowSelected,
        access_token: user?.access_token,
      });
    }
  }, [rowSelected, isDrawerOpen]);

  // Update stateDetails for form
  useEffect(() => {
    formUpdate.setFieldsValue(purchaseDetails);
  }, [formUpdate, setPurchaseDetails, purchaseDetails]);
  // handle Notification update product

  // -------------------------------------------------\\

  // GET ALL PRODUCT FROM DB
  const fetchGetAllPurchaseOrder = async () => {
    const access_token = user?.access_token;
    const res = await PurchaseOrderServices.getAllPurchaseOrder(access_token);
    return res.data;
  };

  // Usequery TỰ GET DỮ LIỆU TỪ PHÍA BE NGAY LẦN ĐẦU RENDER COMPONENT Này (Hiển thị list sản phẩm).
  // Tự động lấy dữ liệu: Ngay khi component chứa useQuery được render, useQuery sẽ tự động gọi hàm fetchGetAllProduct để lấy danh sách sản phẩm từ API.
  const queryPurchased = useQuery({
    queryKey: ["purchase_order"],
    queryFn: fetchGetAllPurchaseOrder,
  });
  const { isLoading, data: data_purchase } = queryPurchased;

  // Handle Confirm Delete Product
  const handleConfirmDelete = () => {
    mutationDelete.mutate(
      { id: rowSelected, token: user?.access_token },
      {
        onSettled: () => {
          queryPurchased.refetch();
        },
      }
    );
  };

  const handleCancelDelete = () => {
    setIsOpenDelete(false);
  };

  // CANCEL MODAL - Close Modal - CLOSE FORM UPDATE
  const handleCancelUpdate = () => {
    if (!rowSelected) {
      message.error(t("order.toast.no_order_selected"));
      return;
    }

    console.log("🟢 Hủy đơn hàng với ID:", rowSelected);

    mutationSoftDelete.mutate(
      {
        id: rowSelected,
        access_token: user?.access_token,
      },
      {
        onSuccess: () => {
          message.success(t("order.toast.cancel_success"));
          queryPurchased.refetch(); // Cập nhật danh sách đơn hàng
          setIsDrawerOpen(false); // 🔹 Đóng form sau khi hủy
        },
        onError: (error) => {
          console.error("🔴 Lỗi khi gọi API:", error);
          message.error(t("order.toast.cancel_failed"));
        },
      }
    );
  };

  // ONCHANGE FIELDS - UPDATE
  const handleOnChangeDetails = (value, name) => {
    setPurchaseDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Get All Fuel List here
  const fetchGetAllFuelType = async () => {
    const response = await FuelTypeServices.getAllFuelType();
    return response;
  };

  const queryAllFuelType = useQuery({
    queryKey: ["fuel_list"],
    queryFn: fetchGetAllFuelType,
  });

  const { data: fuelType, isSuccess: getFuelSuccess } = queryAllFuelType;

  useEffect(() => {
    if (getFuelSuccess) {
      if (fuelType.success) {
        setFuel_Types(fuelType.requests);
      }
    }
  }, [getFuelSuccess, isLoading]);

  // Xử lý input
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "start_received") {
      if (value <= currentDate) {
        message.error("Vui lòng chọn ngày bắt đầu nhận đơn từ hôm nay trở đi.");
        return;
      }
    } else if (name === "end_received") {
      if (value < purchaseDetails.start_received) {
        message.error("Ngày kết thúc nhận đơn phải sau ngày bắt đầu nhận đơn.");
        return;
      }
    } else if (name === "due_date") {
      if (value < purchaseDetails.end_received) {
        message.error("Hạn chót nhận đơn phải sau ngày kết thúc nhận đơn.");
        return;
      }
    }
    // Kiểm tra Tên yêu cầu (Không chứa ký tự đặc biệt)
    if ((name === "quantity" || name === "price") && value === "0") {
      return;
    }
    setPurchaseDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Khi bấm "Cập Nhật" -> Hiện Modal xác nhận cập nhật
  const handleOpenConfirmUpdate = () => {
    setIsConfirmUpdateOpen(true);
  };

  // Khi bấm "Cập Nhật" -> Hiện Modal xác nhận cập nhật
  const handleOpenConfirmAccept = () => {
    setIsConfirmAccept(true);
  };

  // Khi bấm "Hủy yêu cầu" -> Hiện Modal xác nhận hủy cập nhật
  const handleOpenConfirmCancel = () => {
    setIsConfirmCancelOpen(true);
  };

  // Khi chọn "Có" trong Modal Xác Nhận Cập Nhật
  const handleConfirmUpdate = () => {
    setIsConfirmUpdateOpen(false);
    handleUpdatePurchaseOrder(); // Thực hiện cập nhật đơn hàng
  };

  const handleConfirmAccept = () => {
    setIsConfirmAccept(false);
    handleAcceptPurchaseOrder();
  };

  // Khi chọn "Có" trong Modal Xác Nhận Hủy
  const handleConfirmCancel = () => {
    setIsConfirmCancelOpen(false); // 🔹 Đóng modal xác nhận trước
    setIsDrawerOpen(false); // 🔹 Đóng drawer ngay lập tức để UI phản hồi nhanh hơn

    // 🔹 Gọi API để cập nhật trạng thái hủy đơn hàng
    mutationSoftDelete.mutate(
      {
        id: rowSelected,
        access_token: user?.access_token,
      },
      {
        onSuccess: () => {
          message.success("Đã hủy đơn hàng!");
          queryPurchased.refetch(); // Cập nhật danh sách đơn hàng
        },
        onError: (error) => {
          console.error("🔴 Lỗi khi gọi API:", error);
          message.error("Hủy đơn hàng thất bại!");
        },
      }
    );
  };

  // Kiểm tra nếu `data_purchase?.data` là một mảng hợp lệ
  // const tableData = Array.isArray(data_purchase?.data)
  //   ? data_purchase.data.map((purchaseOrder) => ({
  //       ...purchaseOrder,
  //       key: purchaseOrder._id || "",
  //       // start_received: convertDateStringV1(purchaseOrder.start_received),
  //       // end_received: convertDateStringV1(purchaseOrder.end_received),
  //     }))
  //   : [];

  const tableData = Array.isArray(data_purchase?.data)
    ? data_purchase.data
        .filter((item) => {
          if (!filterStatus) return true;
          return item.status === filterStatus;
        })
        .map((purchaseOrder) => ({
          ...purchaseOrder,
          key: purchaseOrder._id || "",
        }))
    : [];

  // Actions
  const renderAction = (text, record) => {
    return (
      <div
        className="flex justify-center items-center text-black gap-2 cursor-pointer hover:bg-gray-200 p-2 rounded-lg transition-all duration-200 w-[60%] min-w-[125px]"
        onClick={() => handleDetailsProduct(record)}
      >
        <Button
          icon={<HiOutlineDocumentSearch style={{ color: "dodgerblue" }} />}
          size="middle"
        />
      </div>
    );
  };

  const handleChangeFuelImage = async (info) => {
    // C2: getBase64
    if (!info.fileList.length) {
      setPurchaseDetails((prev) => ({
        ...prev,
        fuel_image: purchaseDetails.fuel_image,
      }));
      return;
    }

    const file = info.fileList[0];
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPurchaseDetails((prev) => ({
      ...prev,
      fuel_image: file.preview,
    }));
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

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

  const drawerWidth = isMobile ? "100%" : "40%";

  // Customize Filter Search Props
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const statusColors = {
    "Chờ duyệt": "gold",
    "Đang xử lý": "blue",
    "Từ chối": "red",
    "Đã huỷ": "volcano",
    "Đã Hoàn Thành": "green",
  };
  const statusMap = {
    "Chờ duyệt": "pending",
    "Đang xử lý": "approve",
    "Từ chối": "rejected",
    "Đã huỷ": "cancelled",
    "Đã Hoàn Thành": "completed",
  };
  // Định nghĩa danh sách mức độ ưu tiên
  const priorityOptions = [
    { id: 1, label: "Cao" },
    { id: 2, label: "Trung bình" },
    { id: 3, label: "Thấp" },
  ];

  // Chuyển đổi từ số (API trả về) sang text hiển thị
  const priorityText =
    priorityOptions.find((p) => p.id === purchaseDetails.priority)?.label || "";

  // Xử lý sự kiện thay đổi giá trị
  const handlePriorityChange = (e) => {
    const selectedPriority = priorityOptions.find(
      (p) => p.label === e.target.value
    );
    setPurchaseDetails((prev) => ({
      ...prev,
      priority: selectedPriority ? selectedPriority.id : "",
    }));
  };
  const columns = [
    {
      title: t("order.table.image"),
      dataIndex: "fuel_image",
      key: "fuel_image",
      render: (fuel_image) =>
        fuel_image ? (
          <img
            src={fuel_image} // Base64 hoặc URL hình ảnh
            alt="Fuel"
            style={{
              width: "60px",
              height: "60px",
              objectFit: "cover",
              borderRadius: "5px",
            }}
          />
        ) : (
          <span style={{ color: "red" }}>{t("order.table.no_image")}</span> // Hiển thị nếu không có ảnh
        ),
    },
    {
      title: (
        <div style={{ textAlign: "center" }}>
          {t("order.table.request_name")}
        </div>
      ),
      dataIndex: "request_name",
      key: "request_name",
      ...(getColumnSearchProps("request_name") || {}),
      sorter: (a, b) => a?.request_name.length - b?.request_name.length,
      align: "right",
    },
    {
      title: (
        <div style={{ textAlign: "center" }}>
          {t("order.table.quantity_remain")}
        </div>
      ),
      dataIndex: "quantity_remain",
      className: "text-center",
      key: "quantity_remain",
      sorter: (a, b) => a?.quantity_remain - b?.quantity_remain,
      render: (quantity_remain) => convertPrice(quantity_remain),
    },

    {
      title: (
        <div style={{ textAlign: "center" }}>
          {t("order.table.total_quantity")}
        </div>
      ),
      dataIndex: "quantity",
      key: "quantity",
      className: "text-center",
      filters: [
        { text: "Trên 200kg", value: "above200" },
        { text: "Dưới 500kg", value: "under500" },
        { text: "Trên 1000kg", value: "above1000" },
      ],
      onFilter: (value, record) => {
        if (value === "above200") return record.quantity > 200;
        if (value === "under500") return record.quantity < 500;
        if (value === "above1000") return record.quantity > 1000;
        return true;
      },
      sorter: (a, b) => a.quantity - b.quantity, // Sắp xếp từ nhỏ đến lớn
      render: (quantity) => `${convertPrice(quantity)} Kg`,
    },
    {
      title: (
        <div style={{ textAlign: "center" }}>{t("order.table.start_date")}</div>
      ),
      dataIndex: "start_received",
      className: "text-center",
      key: "start_received",
      sorter: (a, b) => new Date(a.start_received) - new Date(b.start_received),
      render: (date) => convertDateStringV1(date), // Hiển thị ngày đã format
    },

    {
      title: (
        <div style={{ textAlign: "center" }}>{t("order.table.end_date")}</div>
      ),
      dataIndex: "end_received",
      className: "text-center",
      key: "end_received",
      sorter: (a, b) => new Date(a.end_received) - new Date(b.end_received),
      render: (date) => convertDateStringV1(date), // Hiển thị ngày đã format
    },

    {
      title: (
        <div style={{ textAlign: "center" }}>{t("order.table.status")}</div>
      ),
      dataIndex: "status",
      className: "text-center",
      key: "status",
      filters: [
        { text: t("status.pending"), value: "Chờ duyệt" },
        { text: t("status.approve"), value: "Đang xử lý" },
        { text: t("status.rejected"), value: "Từ chối" },
        { text: t("status.cancelled"), value: "Đã huỷ" },
        { text: t("status.completed"), value: "Đã Hoàn Thành" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag
          color={statusColors[status] || "default"}
          style={{ textAlign: "center", fontSize: "12px", padding: "3px" }}
        >
          {t(`status.${statusMap[status]}`) || status}
        </Tag>
      ),
    },
    {
      title: (
        <div style={{ textAlign: "center", width: "100%" }}>
          {t("order.table.action")}
        </div>
      ),
      dataIndex: "action",
      className: "text-center",
      render: (text, record) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          {renderAction(text, record)}
        </div>
      ),
      align: "center",
    },
  ];
  return (
    <div className="Wrapper-Admin-User">
      <div className="Main-Content p-6">
        {/* Nút Quay lại */}

        <div
          style={{ marginBottom: 24, marginTop: 24 }}
          className="flex items-center justify-between"
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
            <span className="hidden md:inline">{t("fuelProvide.back")}</span>
          </Button>

          {/* Title căn giữa */}
          <h5 className="text-center font-bold text-2xl md:text-2xl flex-grow mx-4 text-gray-800">
            🛒 {t("order.title")}
          </h5>

          {/* Phần tử trống bên phải để cân bằng nút quay lại */}
          <div className="min-w-[20px] md:min-w-[100px]"></div>
        </div>
        <div className="content-main-table-user">
          <TableOrder
            // Props List
            scroll={{ x: "max-content" }}
            columns={columns}
            isLoading={isLoading}
            data={tableData}
            setRowSelected={setRowSelected}
            onRow={(record, rowIndex) => {
              return {
                onClick: (event) => {
                  setRowSelected(record._id);
                },
              };
            }}
          ></TableOrder>
        </div>
      </div>

      {/* DRAWER - Update Product */}
      <DrawerComponent
        title={
          <span className="text-[14px] lg:text-lg font-semibold text-gray-800">
            {t("order.drawer_title")}
          </span>
        }
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        placement="right"
        width={drawerWidth}
        forceRender
      >
        <Loading isPending={isLoadDetails}>
          {/* Form cập nhật đơn thu nguyên liệu */}
          <div className="w-full bg-gray-100 p-0 lg:p-6">
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-[16px] sm:text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                🚀 {t("order.update_title")}
              </h2>
              <div className="space-y-4">
                {/* Tên đơn */}
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    {t("order.form.name")}
                  </label>
                  <input
                    type="text"
                    name="request_name"
                    maxLength="50"
                    placeholder={t("order.form.name_placeholder")}
                    value={purchaseDetails.request_name}
                    onChange={handleChange}
                    className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                  />
                </div>

                {/* Loại Nguyên liệu */}
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    {t("order.form.fuel_type")}
                  </label>
                  <select
                    name="fuel_type"
                    value={purchaseDetails.fuel_type}
                    onChange={handleChange}
                    className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                  >
                    <option value="" disabled>
                      {t("order.form.fuel_type_placeholder")}
                    </option>
                    {fuel_types && fuel_types.length > 0 ? (
                      fuel_types.map((fuel) => (
                        <option key={fuel._id} value={fuel._id}>
                          {fuel.fuel_type_id.type_name}
                        </option>
                      ))
                    ) : (
                      <option disabled>{t("order.form.no_data")}</option>
                    )}
                  </select>
                </div>

                {/* Ảnh nguyên liệu */}
                <div className="flex flex-col gap-4 min-h-[20vh]">
                  {/* Tiêu đề */}
                  <div className="text-gray-800 font-semibold">
                    {t("order.form.image")}
                  </div>

                  {/* Upload Button */}
                  <div>
                    <Upload.Dragger
                      listType="picture"
                      showUploadList={{ showRemoveIcon: true }}
                      accept=".png, .jpg, .jpeg, .gif, .webp, .avif, .eps"
                      maxCount={1}
                      beforeUpload={() => false}
                      onChange={handleChangeFuelImage}
                      className="!w-full"
                    >
                      <button className="bg-gray-200 p-2 rounded hover:bg-gray-300 w-full">
                        {t("order.form.upload")}
                      </button>
                    </Upload.Dragger>
                  </div>

                  {/* Hiển thị hình ảnh */}
                  {purchaseDetails?.fuel_image && (
                    <div>
                      <img
                        src={purchaseDetails.fuel_image}
                        alt="Hình ảnh Nguyên liệu"
                        className="w-full h-auto max-h-[300px] object-contain rounded-lg shadow-md border border-gray-300"
                      />
                    </div>
                  )}
                </div>

                {/* Số lượng cần thu */}
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    {t("order.form.quantity")}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      placeholder={t("order.form.quantity_placeholder")}
                      value={purchaseDetails.quantity}
                      onChange={handleChange}
                      className="border border-gray-300 p-2 pr-12 rounded w-full focus:ring focus:ring-yellow-300"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
                      Kg
                    </span>
                  </div>
                </div>

                {/* Giá trên mỗi kg */}
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    {t("order.form.price")}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="price"
                      min="1"
                      placeholder={t("order.form.price_placeholder")}
                      value={purchaseDetails.price}
                      onChange={handleChange}
                      className="border border-gray-300 p-2 pr-14 rounded w-full focus:ring focus:ring-yellow-300"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
                      VND
                    </span>
                  </div>
                </div>

                {/* Ngày nhận đơn */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-800 font-semibold mb-2">
                      {t("order.form.start_date")}
                    </label>
                    <DatePicker
                      selected={purchaseDetails.start_received}
                      onChange={(date) =>
                        handleChange({
                          target: { name: "start_received", value: date },
                        })
                      }
                      dateFormat="dd/MM/yyyy"
                      className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                      placeholderText={t("order.form.date_placeholder")}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-800 font-semibold mb-2">
                      {t("order.form.end_date")}
                    </label>
                    <DatePicker
                      selected={purchaseDetails.end_received}
                      onChange={(date) =>
                        handleChange({
                          target: { name: "end_received", value: date },
                        })
                      }
                      dateFormat="dd/MM/yyyy"
                      className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                      placeholderText={t("order.form.date_placeholder")}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-800 font-semibold mb-2">
                      {t("order.form.due_date")}
                    </label>
                    <DatePicker
                      selected={purchaseDetails.due_date}
                      onChange={(date) =>
                        handleChange({
                          target: { name: "due_date", value: date },
                        })
                      }
                      dateFormat="dd/MM/yyyy"
                      className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                      placeholderText={t("order.form.date_placeholder")}
                    />
                  </div>
                </div>

                {/* Mức độ ưu tiên */}
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    {t("order.form.priority")}
                  </label>
                  <select
                    name="priority"
                    value={priorityText}
                    onChange={handlePriorityChange}
                    className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                  >
                    <option value="" disabled>
                      {t("order.form.priority_placeholder")}
                    </option>
                    <option value="Cao">{t("order.priority.high")}</option>
                    <option value="Trung bình">
                      {t("order.priority.medium")}
                    </option>
                    <option value="Thấp">{t("order.priority.low")}</option>
                  </select>
                </div>

                {/* Ghi chú */}
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    {t("order.form.note")}
                  </label>
                  <textarea
                    name="note"
                    placeholder={t("order.form.note_placeholder")}
                    rows="3"
                    value={purchaseDetails.note}
                    onChange={handleChange}
                    className="border border-gray-300 p-2 rounded w-full focus:ring focus:ring-yellow-300"
                  />
                </div>

                {/* Tổng giá */}
                <div className="font-semibold text-lg text-gray-800">
                  {t("order.form.total_price")}:{" "}
                  <span className="text-red-500 font-bold">
                    {(
                      purchaseDetails.quantity * purchaseDetails.price
                    ).toLocaleString("vi-VN")}{" "}
                    VNĐ
                  </span>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="bg-gray-500 text-white font-bold px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Đóng
                  </button>
                </div>

                {/* Nút bấm */}
                {purchaseDetails?.status === "Chờ duyệt" && (
                  <div className="flex flex-col md:flex-row md:justify-between gap-4">
                    <button
                      onClick={handleOpenConfirmUpdate}
                      className="bg-yellow-200 text-gray-800 font-bold px-4 py-2 rounded hover:bg-yellow-500 w-full md:w-auto"
                    >
                      {t("order.actions.update")}
                    </button>

                    <button
                      onClick={handleOpenConfirmAccept}
                      className="bg-green-600 text-gray-800 font-bold px-4 py-2 rounded hover:bg-yellow-500 w-full md:w-auto"
                    >
                      {t("order.actions.accept")}
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenConfirmCancel} // Chỉ đóng form, không cập nhật
                      className="bg-red-600 text-white font-bold px-4 py-2 rounded hover:bg-gray-700 w-full md:w-auto"
                    >
                      {t("order.actions.cancel")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Loading>
      </DrawerComponent>

      {/* Modal Confirm Delete Product */}
      <ModalComponent
        title={t("order.modal.delete_title")}
        open={isOpenDelete}
        onCancel={handleCancelDelete}
        onOk={handleConfirmDelete}
      >
        <Loading isPending={isPendingDelete}>
          <div>{t("order.modal.delete_confirm")}</div>
        </Loading>
      </ModalComponent>

      {/* Modal Xác Nhận Cập Nhật */}
      <ModalComponent
        title={t("order.modal.update_title")}
        open={isConfirmUpdateOpen}
        onCancel={() => setIsConfirmUpdateOpen(false)}
        onOk={handleConfirmUpdate}
      >
        <p>{t("order.modal.update_confirm")}</p>
      </ModalComponent>

      {/* Modal Xác Nhận Cập Nhật */}
      <ModalComponent
        title={t("order.modal.accept_title")}
        open={isConfirmAccept}
        onCancel={() => setIsConfirmAccept(false)}
        onOk={handleConfirmAccept}
      >
        <p>{t("order.modal.accept_confirm")}</p>
      </ModalComponent>

      {/* Modal Xác Nhận Hủy */}
      <ModalComponent
        title={t("order.modal.cancel_title")}
        open={isConfirmCancelOpen}
        onCancel={() => setIsConfirmCancelOpen(false)}
        onOk={handleCancelUpdate}
      >
        <p>{t("order.modal.cancel_confirm")}</p>
      </ModalComponent>
    </div>
  );
};

export default UserComponent;
