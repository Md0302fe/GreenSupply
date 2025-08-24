import React, { useEffect, useRef, useState } from "react";
import "./Order.scss";

import { Button, Form, Input, Space, Upload, message } from "antd";

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

import { DatePicker } from "antd";
import dayjs from "dayjs";

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

  const [fuel_types, setFuel_Types] = useState([]);

  const user = useSelector((state) => state.user);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const filterStatus = queryParams.get("status");

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

  const MAX_QTY = 1_000_000;
  const MAX_PRICE = 9_999_999;
  const formatNumber = (n) => n.toLocaleString("vi-VN");
  const [fieldErrors, setFieldErrors] = useState({
    request_name: "",
    quantity: "",
    price: "",
    start_received: "",
    end_received: "",
    due_date: "",
  });

  const safeTotalPrice = () => {
    const q = Number(purchaseDetails.quantity);
    const p = Number(purchaseDetails.price);
    if (
      isNaN(q) ||
      isNaN(p) ||
      !isFinite(q) ||
      !isFinite(p) ||
      q <= 0 ||
      p <= 0 ||
      q > MAX_QTY ||
      p > MAX_PRICE
    )
      return 0;
    return q * p;
  };
  const isEditable = purchaseDetails?.status === "Chờ duyệt";
  const getFuelTypeName = (id) =>
    fuel_types.find((f) => f._id === id)?.fuel_type_id?.type_name || "";
  const today = dayjs().startOf("day");

  // Fetch : Get User Details
  const fetchGetPurchaseDetail = async ({ id, access_token }) => {
    try {
      setIsLoadDetails(true);
      const res = await PurchaseOrderServices.getDetailPurchaseOrder(
        id,
        access_token
      );

      if (res?.PurchaseOrderDetail) {
        const d = res.PurchaseOrderDetail;
        setPurchaseDetails({
          request_name: d.request_name,
          start_received: d.start_received ? dayjs(d.start_received) : null,
          end_received: d.end_received ? dayjs(d.end_received) : null,
          due_date: d.due_date ? dayjs(d.due_date) : null,
          quantity: d.quantity,
          quantity_remain: d.quantity_remain,
          status: d.status,
          price: d.price,
          fuel_type: d.fuel_type,
          updatedAt: d.updatedAt,
          fuel_image: d.fuel_image,
          total_price: d.total_price,
          priority: d.priority,
          note: d.note,
        });
        setFieldErrors({ quantity: "", price: "" });
        revalidateNumbers(d.quantity, d.price);
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
        message.success(t("harvest.success.updated"));
        setIsDrawerOpen(false);
      } else {
        message.success(t("harvest.fail.updated"));
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
        message.success(t("harvest.success.accept"));
        setIsDrawerOpen(false);
      } else {
        message.success(t("harvest.fail.accept"));
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

    const payload = {
      ...purchaseDetails,
      total_price:
        (Number(purchaseDetails.quantity) || 0) *
        (Number(purchaseDetails.price) || 0),
      start_received: purchaseDetails.start_received?.toISOString() || null,
      end_received: purchaseDetails.end_received?.toISOString() || null,
      due_date: purchaseDetails.due_date?.toISOString() || null,
    };

    mutationUpdatePurchaseOrder.mutate(
      {
        id: rowSelected,
        access_token: user?.access_token,
        dataUpdate: payload,
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

    const payload = {
      ...purchaseDetails,
      start_received: purchaseDetails.start_received?.toISOString() || null,
      end_received: purchaseDetails.end_received?.toISOString() || null,
      due_date: purchaseDetails.due_date?.toISOString() || null,
    };

    mutationAcceptPurchaseOrder.mutate(
      {
        id: rowSelected,
        access_token: user?.access_token,
        dataUpdate: payload,
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
    const q = Number(purchaseDetails.quantity);
    const p = Number(purchaseDetails.price);
    const start = purchaseDetails.start_received;
    const end = purchaseDetails.end_received;
    const due = purchaseDetails.due_date;

    // Name & fuel type
    if (!purchaseDetails.request_name?.trim())
      errors.push(t("harvest.validation.empty_name"));
    if (!purchaseDetails.fuel_type?.trim())
      errors.push(t("harvest.validation.empty_fuel_type"));

    // Dates (không lặp lại)
    if (!start) errors.push(t("harvest.validation.empty_start_date"));
    else if (start.isBefore(today))
      errors.push(t("harvest.validation.invalid_start_date"));
    if (!end) errors.push(t("harvest.validation.empty_end_date"));
    else if (start && !end.isAfter(start))
      errors.push(t("harvest.validation.invalid_end_date"));
    if (!due) errors.push(t("harvest.validation.empty_due_date"));
    else if (end && !due.isAfter(end))
      errors.push(t("harvest.validation.invalid_due_date"));

    // Quantity
    if (!purchaseDetails.quantity?.toString().trim())
      errors.push(t("harvest.validation.empty_quantity"));
    else if (isNaN(q) || q <= 0)
      errors.push(t("harvest.validation.invalid_quantity"));
    else if (q > MAX_QTY)
      errors.push(
        t("harvest.validation.exceed_quantity", { max: formatNumber(MAX_QTY) })
      );

    // Price
    if (!purchaseDetails.price?.toString().trim())
      errors.push(t("harvest.validation.empty_price"));
    else if (isNaN(p) || p <= 0)
      errors.push(t("harvest.validation.invalid_price"));
    else if (p > MAX_PRICE)
      errors.push(
        t("harvest.validation.exceed_price", { max: formatNumber(MAX_PRICE) })
      );

    return [...new Set(errors)];
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
        // setIsOpenDelete(false);
        message.success(deleteRespone?.message);
      }
    }
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

  useEffect(() => {
    if (isDrawerOpen) {
      setFieldErrors({ quantity: "", price: "" });
    }
  }, [isDrawerOpen]);

  // handle Notification update product

  // -------------------------------------------------\\

  // GET ALL PRODUCT FROM DB
  const fetchGetAllPurchaseOrder = async () => {
    const access_token = user?.access_token;
    const res = await PurchaseOrderServices.getAllPurchaseOrder(access_token);
    console.log(res);
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
  const handleConfirmDelete = async () => {
    setIsOpenDelete(false);
    mutationDelete.mutate(
      { id: rowSelected, token: user?.access_token },
      {
        onSettled: () => {
          setIsOpenDelete(false);
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

    setIsConfirmCancelOpen(false);
    setIsDrawerOpen(false);

    mutationSoftDelete.mutate(
      {
        id: rowSelected,
        access_token: user?.access_token,
      },
      {
        onSuccess: () => {
          message.success(t("harvest.success.delete"));
          queryPurchased.refetch();
          setIsDrawerOpen(false);
        },
        onError: (error) => {
          console.error("Lỗi khi gọi API:", error);
          message.error(t("harvest.fail.delete"));
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
    const nextErrors = { ...fieldErrors };

    if (!isEditable) return;
    // Name
    if (name === "request_name") {
      const v = (value ?? "").trim();
      nextErrors.request_name = v ? "" : t("harvest.validation.empty_name");
    }

    // ----- Dates -----
    if (name === "start_received") {
      const v = value ? value.startOf("day") : null;
      nextErrors.start_received =
        !v || v.isBefore(today)
          ? t("harvest.validation.invalid_start_date")
          : "";
    }

    if (name === "end_received") {
      const start = purchaseDetails.start_received;
      const end = value ? value.startOf("day") : null;
      nextErrors.end_received =
        !end || !start || !end.isAfter(start)
          ? t("harvest.validation.invalid_end_date")
          : "";
    }

    if (name === "due_date") {
      const end = purchaseDetails.end_received;
      const due = value ? value.startOf("day") : null;
      nextErrors.due_date =
        !due || !end || !due.isAfter(end)
          ? t("harvest.validation.invalid_due_date")
          : "";
    }

    if (name === "quantity") {
      const v = value?.toString() ?? "";
      const n = Number(v);

      // validate như cũ
      if (!v.trim()) {
        nextErrors.quantity = t("harvest.validation.empty_quantity");
      } else if (isNaN(n) || !isFinite(n) || n <= 0) {
        nextErrors.quantity = t("harvest.validation.invalid_quantity");
      } else if (n > MAX_QTY) {
        nextErrors.quantity = t("harvest.validation.exceed_quantity", {
          max: formatNumber(MAX_QTY),
        });
      } else {
        nextErrors.quantity = "";
      }
      setFieldErrors(nextErrors);

      // chặn "0"
      if (value === "0") return;

      // ✅ set remain = quantity
      setPurchaseDetails((prev) => ({
        ...prev,
        quantity: n,
        quantity_remain: n,
      }));

      return; // tránh rơi xuống setPurchaseDetails chung
    }

    // validate giá
    if (name === "price") {
      const v = value?.toString() ?? "";
      const n = Number(v);
      if (!v.trim()) {
        nextErrors.price = t("harvest.validation.empty_price");
      } else if (isNaN(n) || !isFinite(n) || n <= 0) {
        nextErrors.price = t("harvest.validation.invalid_price");
      } else if (n > MAX_PRICE) {
        nextErrors.price = t("harvest.validation.exceed_price", {
          max: formatNumber(MAX_PRICE),
        });
      } else {
        nextErrors.price = "";
      }
    }
    setFieldErrors(nextErrors);

    // Không cho set “0” cứng
    if ((name === "quantity" || name === "price") && value === "0") return;
    setPurchaseDetails((prev) => ({ ...prev, [name]: value }));
  };

  const revalidateNumbers = (q, p) => {
    const MAX_QTY = 1_000_000,
      MAX_PRICE = 9_999_999;
    const errs = { quantity: "", price: "" };

    if (!q && q !== 0) errs.quantity = t("harvest.validation.empty_quantity");
    else if (isNaN(+q) || +q <= 0 || +q > MAX_QTY)
      errs.quantity = t("harvest.validation.invalid_quantity");

    if (!p && p !== 0) errs.price = t("harvest.validation.empty_price");
    else if (isNaN(+p) || +p <= 0 || +p > MAX_PRICE)
      errs.price = t("harvest.validation.invalid_price");

    setFieldErrors(errs);
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

  // Không cho chọn ngày trong quá khứ
  const disabledStartDate = (current) =>
    current && current < dayjs().startOf("day");

  // end_received phải > start_received
  const disabledEndDate = (current) => {
    if (!purchaseDetails.start_received)
      return current && current < dayjs().startOf("day");
    return current && current <= purchaseDetails.start_received.startOf("day");
  };

  // due_date phải > end_received
  const disabledDueDate = (current) => {
    if (!purchaseDetails.end_received)
      return current && current < dayjs().startOf("day");
    return current && current <= purchaseDetails.end_received.startOf("day");
  };

  const tableData = Array.isArray(data_purchase?.data)
    ? data_purchase.data
        .filter((item) => {
          if (!filterStatus) return true;
          return item.status === filterStatus;
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
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
    if (!isEditable) return;
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
    if (!isEditable) return;
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
      __excelTitle__: t("order.table.request_name"),
      dataIndex: "request_name",
      key: "request_name",
      ...(getColumnSearchProps("request_name") || {}),
      sorter: (a, b) => a?.request_name.length - b?.request_name.length,
      align: "right",
    },
    {
      title: (
        <div style={{ textAlign: "center" }}>{t("order.table.price")}</div>
      ),
      __excelTitle__: t("order.table.price"),
      dataIndex: "price",
      key: "price",
      className: "text-center",
      sorter: (a, b) => a.price - b.price,
      render: (price) => `${convertPrice(price)} VND/kg`,
    },

    {
      title: (
        <div style={{ textAlign: "center" }}>
          {t("order.table.total_quantity")}
        </div>
      ),
      dataIndex: "quantity",
      __excelTitle__: t("order.table.total_quantity"),
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
      __excelTitle__: t("order.table.start_date"),
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
      __excelTitle__: t("order.table.end_date"),
      className: "text-center",
      key: "end_received",
      sorter: (a, b) => new Date(a.end_received) - new Date(b.end_received),
      render: (date) => convertDateStringV1(date), // Hiển thị ngày đã format
    },

    {
      title: (
        <div style={{ textAlign: "center" }}>{t("order.table.status")}</div>
      ),
      __excelTitle__: t("order.table.status"),
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
            {t("order.title")}
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
          <div
            className="text-[14px] lg:text-lg font-semibold"
            style={{ textAlign: "center" }}
          >
            {t("order.detail_title")}
          </div>
        }
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setFieldErrors({ quantity: "", price: "" });
        }}
        placement="right"
        width={drawerWidth}
        forceRender
      >
        <Loading isPending={isLoadDetails}>
          {/* Form cập nhật đơn thu nguyên liệu */}
          <div className="w-full bg-gray-100 p-0 lg:p-6">
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
              <div className="space-y-4">
                {/* Tên đơn */}
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    {t("order.form.name")}
                  </label>
                  <input
                    type="text"
                    name="request_name"
                    maxLength="100"
                    placeholder={t("order.form.name_placeholder")}
                    value={purchaseDetails.request_name}
                    onChange={handleChange}
                    onBlur={(e) => {
                      const trimmed = e.target.value.trim();
                      setPurchaseDetails((prev) => ({
                        ...prev,
                        request_name: trimmed,
                      }));
                      setFieldErrors((errs) => ({
                        ...errs,
                        request_name: trimmed
                          ? ""
                          : t("harvest.validation.empty_name"),
                      }));
                    }}
                    className={`border p-2 rounded w-full focus:ring focus:ring-yellow-300
                      ${!isEditable ? "bg-gray-100 cursor-not-allowed" : ""}
                      ${
                        fieldErrors.request_name
                          ? "border-red-400 focus:border-red-500"
                          : "border-gray-300"
                      }`}
                  />
                  {fieldErrors.request_name && (
                    <p className="mt-1 text-red-500 text-sm">
                      {fieldErrors.request_name}
                    </p>
                  )}
                </div>

                {/* Loại Nguyên liệu */}
                <div>
                  <label className="block text-gray-800 font-semibold mb-2">
                    {t("order.form.fuel_type")}
                  </label>
                  {!isEditable ? (
                    // View-only
                    <div className="border p-2 rounded w-full bg-gray-100 text-gray-700">
                      {getFuelTypeName(purchaseDetails.fuel_type) ||
                        t("order.form.no_data")}
                    </div>
                  ) : (
                    // Editable
                    <select
                      name="fuel_type"
                      value={purchaseDetails.fuel_type || ""}
                      onChange={handleChange}
                      className="border p-2 rounded w-full focus:ring focus:ring-yellow-300"
                    >
                      <option value="" disabled>
                        {t("order.form.fuel_type_placeholder")}
                      </option>
                      {fuel_types.map((fuel) => (
                        <option key={fuel._id} value={fuel._id}>
                          {fuel.fuel_type_id?.type_name}
                        </option>
                      ))}
                    </select>
                  )}
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
                      disabled={!isEditable}
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
                      value={purchaseDetails.quantity}
                      onChange={handleChange}
                      disabled={!isEditable}
                      className={`border p-2 pr-20 rounded w-full focus:ring focus:ring-yellow-300
                        ${!isEditable ? "bg-gray-100 cursor-not-allowed" : ""}
                        ${
                          fieldErrors.quantity
                            ? "border-red-400 focus:border-red-500"
                            : "border-gray-300"
                        }`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                      Kg
                    </span>
                  </div>
                  {fieldErrors.quantity && (
                    <p className="mt-1 text-red-500 text-sm">
                      {fieldErrors.quantity}
                    </p>
                  )}
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
                      onKeyDown={(e) => {
                        if (
                          ["e", "E", "+", "-", ".", ","].includes(e.key) ||
                          (!/^\d$/.test(e.key) && e.key.length === 1)
                        ) {
                          e.preventDefault();
                        }
                      }}
                      className={`border p-2 pr-14 rounded w-full focus:ring focus:ring-yellow-300
                        ${
                          fieldErrors.price
                            ? "border-red-400 focus:border-red-500"
                            : "border-gray-300"
                        }`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                      VND
                    </span>
                  </div>
                  {fieldErrors.price && (
                    <p className="mt-1 text-red-500 text-sm">
                      {fieldErrors.price}
                    </p>
                  )}
                </div>

                {/* Ngày nhận đơn */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Start Date */}
                  <div>
                    <label className="block text-gray-800 font-semibold mb-2">
                      {t("order.form.start_date")}
                    </label>
                    <DatePicker
                      value={purchaseDetails.start_received}
                      onChange={(d) =>
                        handleChange({
                          target: {
                            name: "start_received",
                            value: d ? d.startOf("day") : null,
                          },
                        })
                      }
                      format="DD/MM/YYYY"
                      disabledDate={disabledStartDate}
                      disabled={!isEditable}
                      placeholder={t("harvest.form.start_date_placeholder")}
                      className="w-full h-10 !rounded-xl !border-2 !border-gray-200 focus:!border-blue-500"
                    />
                    {fieldErrors.start_received && (
                      <p className="mt-1 text-red-500 text-sm">
                        {fieldErrors.start_received}
                      </p>
                    )}
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-gray-800 font-semibold mb-2">
                      {t("order.form.end_date")}
                    </label>
                    <DatePicker
                      value={purchaseDetails.end_received}
                      onChange={(d) =>
                        handleChange({
                          target: {
                            name: "end_received",
                            value: d ? d.startOf("day") : null,
                          },
                        })
                      }
                      format="DD/MM/YYYY"
                      disabledDate={disabledEndDate}
                      disabled={!purchaseDetails.start_received || !isEditable}
                      placeholder={t("harvest.form.end_date_placeholder")}
                      className="w-full h-10 !rounded-xl !border-2 !border-gray-200 focus:!border-blue-500"
                    />
                    {fieldErrors.end_received && (
                      <p className="mt-1 text-red-500 text-sm">
                        {fieldErrors.end_received}
                      </p>
                    )}
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-gray-800 font-semibold mb-2">
                      {t("order.form.due_date")}
                    </label>
                    <DatePicker
                      value={purchaseDetails.due_date}
                      onChange={(d) =>
                        handleChange({
                          target: {
                            name: "due_date",
                            value: d ? d.startOf("day") : null,
                          },
                        })
                      }
                      format="DD/MM/YYYY"
                      disabledDate={disabledDueDate}
                      disabled={!purchaseDetails.end_received || !isEditable}
                      placeholder={t("harvest.form.due_date_placeholder")}
                      className="w-full h-10 !rounded-xl !border-2 !border-gray-200 focus:!border-blue-500"
                    />
                    {fieldErrors.due_date && (
                      <p className="mt-1 text-red-500 text-sm">
                        {fieldErrors.due_date}
                      </p>
                    )}
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
                    value={purchaseDetails.note}
                    maxLength="500"
                    onChange={handleChange}
                    onBlur={(e) => {
                      const trimmed = e.target.value.trim();
                      setPurchaseDetails((prev) => ({
                        ...prev,
                        note: trimmed,
                      }));
                    }}
                    readOnly={!isEditable}
                    className={`border p-2 rounded w-full focus:ring focus:ring-yellow-300
                      ${!isEditable ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  />
                </div>

                {/* Tổng giá */}
                <div className="font-semibold text-lg text-gray-800">
                  {t("order.form.total_price")}:{" "}
                  <span className="text-red-500 font-bold">
                    {safeTotalPrice().toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>

                {/* Nút bấm */}
                {purchaseDetails?.status === "Chờ duyệt" && (
                  <div className="flex flex-wrap md:flex-nowrap justify-end gap-3 mt-4">
                    {/* Nút cập nhật */}
                    <button
                      onClick={handleOpenConfirmUpdate}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md shadow-sm transition-all duration-200 w-full md:w-auto"
                    >
                      {t("order.actions.update")}
                    </button>

                    {/* Nút chấp nhận */}
                    <button
                      onClick={handleOpenConfirmAccept}
                      className="bg-[#134afe] hover:bg-[#0e3bd1] text-white font-semibold px-4 py-2 rounded-md shadow-sm transition-all duration-200 w-full md:w-auto"
                    >
                      {t("order.actions.accept")}
                    </button>

                    {/* Nút xóa */}
                    <button
                      type="button"
                      onClick={handleOpenConfirmCancel}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md shadow-sm transition-all duration-200 w-full md:w-auto"
                    >
                      {t("order.actions.delete")}
                    </button>

                    {/* Nút đóng */}
                    <button
                      onClick={() => setIsDrawerOpen(false)}
                      className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm transition-all duration-200 w-full md:w-auto"
                    >
                      {t("common.close")}
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
        okButtonProps={{
          style: { backgroundColor: "red", borderColor: "red" },
        }}
        confirmLoading={isPendingDelete}
        destroyOnClose
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
        okButtonProps={{
          style: { backgroundColor: "green", borderColor: "green" },
        }}
      >
        <p>{t("order.modal.update_confirm")}</p>
      </ModalComponent>

      {/* Modal Xác Nhận Cập Nhật */}
      <ModalComponent
        title={t("order.modal.accept_title")}
        open={isConfirmAccept}
        onCancel={() => setIsConfirmAccept(false)}
        onOk={handleConfirmAccept}
        okButtonProps={{
          style: { backgroundColor: "#134afe", borderColor: "#134afe" },
        }}
      >
        <p>{t("order.modal.accept_confirm")}</p>
      </ModalComponent>

      {/* Modal Xác Nhận Hủy */}
      <ModalComponent
        title={t("order.modal.delete_confirm_title")}
        open={isConfirmCancelOpen}
        onCancel={() => setIsConfirmCancelOpen(false)}
        onOk={handleCancelUpdate}
        okButtonProps={{
          style: { backgroundColor: "red", borderColor: "red" },
        }}
      >
        <p>{t("order.modal.delete_confirm_plan")}</p>
      </ModalComponent>
    </div>
  );
};

export default UserComponent;
