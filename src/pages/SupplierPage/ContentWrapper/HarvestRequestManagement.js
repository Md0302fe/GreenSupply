import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { AiFillEdit } from "react-icons/ai";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import { MdOutlineCancelScheduleSend } from "react-icons/md";
import DrawerComponent from "../../../components/DrawerComponent/DrawerComponent";
import Shop from "../../../assets/NewProject/Icon-GreenSupply/shop-illustration.webp";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import {
  getAllHarvestRequests,
  updateHarvestRequest,
  cancelHarvestRequest,
} from "../../../services/HarvestRequestService";

const HarvestRequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  // State đóng mở DrawerComponent
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // State của view detail
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [viewDetailRequest, setViewDetailRequest] = useState(null);

  // State của  popup xác nhận hủy yêu cầu
  const [isCancelPopupOpen, setIsCancelPopupOpen] = useState(false);
  const [cancelRequestId, setCancelRequestId] = useState(null);

  const [editForm, setEditForm] = useState({
    fuel_name: "",
    quantity: "",
    price: "",
    address: "",
    note: "",
  });

  // Các state cho chức năng Search và Filter
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [statusFilterVal, setStatusFilterVal] = useState("");

  const statusMapping = {
    10: "Chờ duyệt",
    20: "Đã duyệt",
    30: "Từ chối",
    40: "Đã huỷ",
  };

  // Debounce cho ô tìm kiếm (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const handleChangeStatus = (event) => {
    setStatusFilterVal(event.target.value);
  };

  function removeDiacritics(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  const filteredRequests = useMemo(() => {
    const normalizedSearch = removeDiacritics(debouncedSearch.toLowerCase());

    return requests.filter((req) => {
      // Chuẩn hóa các trường trước khi so sánh
      const fuelName = removeDiacritics(req.fuel_name.toLowerCase());
      const quantity = removeDiacritics(req.quantity.toString().toLowerCase());
      const price = removeDiacritics(req.price.toString().toLowerCase());
      const totalPrice = removeDiacritics(
        req.total_price.toString().toLowerCase()
      );
      const status = removeDiacritics(req.status.toLowerCase());
      const address = removeDiacritics(req.address.toLowerCase());
      const note = removeDiacritics(req.note.toLowerCase());

      const matchesSearch =
        fuelName.includes(normalizedSearch) ||
        quantity.includes(normalizedSearch) ||
        price.includes(normalizedSearch) ||
        totalPrice.includes(normalizedSearch) ||
        status.includes(normalizedSearch) ||
        address.includes(normalizedSearch) ||
        note.includes(normalizedSearch);

      // Kiểm tra filter trạng thái nếu có
      const matchesFilter = statusFilterVal
        ? req.status === statusMapping[statusFilterVal]
        : true;

      return matchesSearch && matchesFilter;
    });
  }, [requests, debouncedSearch, statusFilterVal, statusMapping]);

  // 🟢 Gọi API lấy danh sách yêu cầu thu hoạch
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getAllHarvestRequests();
        setRequests(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleEditClick = (request) => {
    if (request.status !== "Chờ duyệt") {
      toast.warning("Chỉ có thể chỉnh sửa đơn hàng ở trạng thái Chờ duyệt.");
      return;
    }

    setSelectedRequest(request);
    setEditForm({
      fuel_name: request.fuel_name,
      quantity: request.quantity,
      price: request.price,
      address: request.address,
      note: request.note,
    });
    // Xóa các lỗi cũ khi mở lại form
    setErrors({});
    setIsDrawerOpen(true);
  };

  const handleFuelNameChange = (e) => {
    const { value } = e.target;
    const regex = /^[a-zA-Z0-9\s\u00C0-\u1EF9]*$/;
    if (regex.test(value)) {
      setEditForm((prev) => ({ ...prev, fuel_name: value }));
      if (errors.fuel_name) {
        setErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors.fuel_name;
          return newErrors;
        });
      }
    } else {
      // Nếu giá trị không hợp lệ, cập nhật lỗi mà không thay đổi state
      setErrors((prevErrors) => ({
        ...prevErrors,
        fuel_name: "Không được nhập ký tự đặc biệt!",
      }));
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedRequest) return;

    const requiredFields = ["fuel_name", "quantity", "price", "address"];
    let newErrors = {};

    requiredFields.forEach((field) => {
      if (!editForm[field] || editForm[field].toString().trim() === "") {
        newErrors[field] = "Yêu cầu người dùng nhập thông tin";
      }
    });

    // Kiểm tra xem giá trị nhập vào có bắt đầu bằng "0" không
    if (
      editForm.quantity.toString().startsWith("0") &&
      editForm.quantity !== ""
    ) {
      newErrors.quantity = "Số lượng phải từ 1 trở lên.";
    }

    if (editForm.price.toString().startsWith("0") && editForm.price !== "") {
      newErrors.price = "Giá phải từ 1 trở lên.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updatedData = {
      fuel_name: editForm.fuel_name,
      quantity: Number(editForm.quantity),
      price: Number(editForm.price),
      total_price: Number(editForm.quantity) * Number(editForm.price),
      address: editForm.address,
      note: editForm.note,
    };

    try {
      await updateHarvestRequest(selectedRequest._id, updatedData);
      toast.success("Cập nhật đơn hàng thành công!");

      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req._id === selectedRequest._id ? { ...req, ...updatedData } : req
        )
      );

      setIsDrawerOpen(false);
    } catch (error) {
      toast.error(`Cập nhật thất bại: ${error.message}`);
    }
  };

  const handleCancelClick = (requestId, status) => {
    if (status !== "Chờ duyệt") {
      toast.warning("Chỉ có thể hủy yêu cầu ở trạng thái 'Chờ duyệt'.");
      return;
    }
    // Lưu lại requestId và mở popup
    setCancelRequestId(requestId);
    setIsCancelPopupOpen(true);
  };

  const confirmCancelRequest = async () => {
    if (!cancelRequestId) return;

    try {
      const response = await cancelHarvestRequest(cancelRequestId);

      if (!response.success) {
        throw new Error(response.message);
      }

      // Cập nhật lại danh sách yêu cầu: chuyển trạng thái của yêu cầu vừa hủy thành "Đã huỷ"
      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req._id === cancelRequestId ? { ...req, status: "Đã huỷ" } : req
        )
      );

      toast.success("Yêu cầu đã được hủy thành công!");
    } catch (error) {
      toast.error(`Hủy thất bại: ${error.message || "Lỗi không xác định"}`);
    } finally {
      // Đóng popup và reset requestId
      setIsCancelPopupOpen(false);
      setCancelRequestId(null);
    }
  };

  const cancelPopup = () => {
    setIsCancelPopupOpen(false);
    setCancelRequestId(null);
  };

  const handleViewDetail = (request) => {
    setViewDetailRequest(request);
    setIsViewDrawerOpen(true);
  };

  const getStatusClasses = (status) => {
    if (status === "Chờ duyệt") return "bg-yellow-100 text-yellow-800";
    if (status === "Đã duyệt") return "bg-green-100 text-green-800";
    if (status === "Từ chối") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="px-2">
      <div className="w-full border border-gray-200 flex items-center gap-20 mb-4 justify-between rounded-md p-6 bg-white shadow">
        <div className="info">
          <h1 className="text-3xl font-bold mb-3 text-black">Good Morning</h1>
          <p>
            Here's what's happening in your store today. See the statistics.
          </p>
        </div>
        <img src={Shop} className="w-[250px]" alt="Shop Illustration" />
      </div>

      <div className="flex justify-between items-center pl-5 mb-4">
        {/* Filter */}
        <div className="col w-[20%]">
          <h4 className="font-[600] text-[13px] mb-2">Filter by</h4>
          <Select
            className="w-[20%]"
            size="small"
            labelId="demo-simple-select-standard-label"
            id="demo-simple-select-standard"
            value={statusFilterVal}
            onChange={handleChangeStatus}
            label="Status"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value={10}>Chờ duyệt</MenuItem>
            <MenuItem value={20}>Đã duyệt</MenuItem>
            <MenuItem value={30}>Từ chối</MenuItem>
            <MenuItem value={40}>Đã huỷ</MenuItem>
          </Select>
        </div>

        {/* Search */}
        <div className="flex items-center border-[1px] border-gray-600 rounded-md overflow-hidden max-w-lg px-3 py-2 mt-4">
          <i className="fa fa-search text-gray-500"></i>
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full px-2 outline-none text-gray-600 placeholder-gray-500 bg-transparent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="relative overflow-x-auto max-w-full shadow-md sm:rounded-lg bg-white">
          <table className="w-full table-fixed text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-9z00 uppercase bg-gray-100 whitespace-nowrap">
              <tr>
                <th className="px-8 py-3 text-center">Tên Mặt Hàng</th>
                <th className="px-8 py-3 text-center">Số lượng (Kg)</th>
                <th className="px-8 py-3 text-center">Giá mỗi đơn vị</th>
                <th className="px-8 py-3 text-center">Tổng giá</th>
                <th className="px-8 py-3 text-center">Trạng thái</th>
                <th className="px-8 py-3 text-center">Địa chỉ lấy hàng</th>
                <th className="px-8 py-3 text-center">Ghi chú</th>
                <th className="px-8 py-3 text-center">Action</th>
              </tr>
            </thead>
            {/* Nội dung */}
            <tbody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <tr key={req._id} className="border-b whitespace-nowrap">
                    <td className="px-6 py-4 text-center font-bold">
                      {req.fuel_name}
                    </td>
                    <td className="px-6 py-4 text-center">{req.quantity}</td>
                    <td className="px-6 py-4 text-center">
                      {req.price.toLocaleString("vi-VN")} đ
                    </td>
                    <td className="px-6 py-4 text-center">
                      {req.total_price.toLocaleString("vi-VN")} đ
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium inline-block w-24 text-center
                          ${
                            req.status === "Chờ duyệt"
                              ? "bg-yellow-100 text-yellow-800"
                              : req.status === "Đã duyệt"
                              ? "bg-green-100 text-green-800"
                              : req.status === "Từ chối"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center max-w-[180px] whitespace-nowrap overflow-hidden text-ellipsis">
                      {req.address}
                    </td>
                    <td
                      className="px-6 py-4 max-w-[180px] whitespace-nowrap overflow-hidden text-ellipsis"
                      title={req.note}
                    >
                      {req.note}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2 text-xl">
                        {/* Nút Edit */}
                        <button
                          className={`hover:underline mr-4 ${
                            req.status !== "Chờ duyệt"
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          onClick={() => handleEditClick(req)}
                          disabled={req.status !== "Chờ duyệt"}
                        >
                          <AiFillEdit />
                        </button>

                        {/* Nút Cancel */}
                        <button
                          className={`text-red-600 hover:underline mr-4 ${
                            req.status !== "Chờ duyệt"
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          onClick={() => handleCancelClick(req._id, req.status)}
                          disabled={req.status !== "Chờ duyệt"}
                        >
                          <MdOutlineCancelScheduleSend />
                        </button>

                        {/* Nút View Detail */}
                        <button
                          className="text-blue-600 hover:underline"
                          onClick={() => handleViewDetail(req)}
                        >
                          <HiOutlineDocumentSearch />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Không có yêu cầu thu hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Drawer Update Request */}
      <DrawerComponent
        title="Chỉnh sửa yêu cầu thu nguyên liệu"
        isOpen={isDrawerOpen}
        placement="right"
        onClose={() => setIsDrawerOpen(false)}
      >
        {selectedRequest ? (
          <div className="w-full p-6 bg-white rounded-md shadow">
            {/* Form chỉnh sửa */}
            <div className="grid grid-cols-1 gap-4 mb-4">
              {/* fuel_name */}
              <div>
                <label className="block mb-1 font-semibold">Tên mặt hàng</label>
                <input
                  type="text"
                  name="fuel_name"
                  maxLength="50"
                  placeholder="Tên mặt hàng..."
                  value={editForm.fuel_name}
                  onChange={handleFuelNameChange}
                  className="border p-2 rounded w-full mb-1"
                />
                {errors.fuel_name && (
                  <p className="text-red-500 text-xs">{errors.fuel_name}</p>
                )}
              </div>

              {/* quantity */}
              <div>
                <label className="block mb-1 font-semibold">
                  Số lượng (kg)
                </label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  placeholder="Số lượng..."
                  value={editForm.quantity}
                  onChange={handleEditChange}
                  onKeyDown={(e) => {
                    if (["e", "E", "-", "+", "."].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  className="border p-2 rounded w-full mb-1"
                />
                {errors.quantity && (
                  <p className="text-red-500 text-xs">{errors.quantity}</p>
                )}
              </div>

              {/* price */}
              <div>
                <label className="block mb-1 font-semibold">
                  Giá mỗi đơn vị (VNĐ)
                </label>
                <input
                  type="number"
                  name="price"
                  min="1"
                  placeholder="Giá bán..."
                  value={editForm.price}
                  onChange={handleEditChange}
                  onKeyDown={(e) => {
                    if (["e", "E", "-", "+", "."].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  className="border p-2 rounded w-full mb-1"
                />
                {errors.price && (
                  <p className="text-red-500 text-xs">{errors.price}</p>
                )}
              </div>

              {/* address */}
              <div>
                <label className="block mb-1 font-semibold">
                  Địa chỉ lấy hàng
                </label>
                <input
                  type="text"
                  name="address"
                  maxLength="120"
                  placeholder="Nhập địa chỉ..."
                  value={editForm.address}
                  onChange={handleEditChange}
                  className="border p-2 rounded w-full mb-1"
                />
                {errors.address && (
                  <p className="text-red-500 text-xs">{errors.address}</p>
                )}
              </div>
            </div>

            {/* Hiển thị tổng giá */}
            <div className="mt-4 mb-4">
              <p>
                <span className="font-semibold mr-2">Tổng giá:</span>
                {(editForm.quantity * editForm.price).toLocaleString(
                  "vi-VN"
                )}{" "}
                VNĐ
              </p>
            </div>

            {/* Ghi chú */}
            <div className="mb-4">
              <label className="block mb-1 font-semibold">Ghi chú</label>
              <textarea
                name="note"
                maxLength="200"
                placeholder="Ghi chú (tối đa 200 ký tự)"
                value={editForm.note}
                onChange={handleEditChange}
                className="w-full border p-2 rounded"
              />
            </div>

            {/* Nút bấm */}
            <div className="flex flex-col md:flex-row md:justify-between gap-4 mt-4">
              <button
                onClick={handleEditSubmit}
                className="bg-[#006838] text-white font-bold px-4 py-2 rounded hover:bg-[#028A48] w-full md:w-auto"
              >
                Cập nhật yêu cầu
              </button>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="bg-gray-500 text-white font-bold px-4 py-2 rounded hover:bg-gray-600 w-full md:w-auto"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          <p>Không có dữ liệu.</p>
        )}
      </DrawerComponent>

      {/* Drawer View Detail */}
      <DrawerComponent
        title="Xem chi tiết yêu cầu thu nguyên liệu"
        isOpen={isViewDrawerOpen}
        placement="right"
        onClose={() => setIsViewDrawerOpen(false)}
      >
        {viewDetailRequest ? (
          <div className="w-full p-6 bg-white rounded-md shadow">
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="block mb-1 font-semibold">Tên mặt hàng</label>
                <input
                  type="text"
                  value={viewDetailRequest.fuel_name}
                  readOnly
                  className="border p-2 rounded w-full mb-1"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">
                  Số lượng (kg)
                </label>
                <input
                  type="number"
                  value={viewDetailRequest.quantity}
                  readOnly
                  className="border p-2 rounded w-full mb-1"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">
                  Giá mỗi đơn vị (VNĐ)
                </label>
                <input
                  type="number"
                  value={viewDetailRequest.price}
                  readOnly
                  className="border p-2 rounded w-full mb-1"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Tổng giá</label>
                <input
                  type="text"
                  value={
                    viewDetailRequest.total_price.toLocaleString("vi-VN") +
                    " VNĐ"
                  }
                  readOnly
                  className="border p-2 rounded w-full mb-1"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">
                  Địa chỉ lấy hàng
                </label>
                <input
                  type="text"
                  value={viewDetailRequest.address}
                  readOnly
                  className="border p-2 rounded w-full h-auto mb-1"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Ghi chú</label>
                <textarea
                  value={viewDetailRequest.note}
                  readOnly
                  className="w-full h-full border p-2 rounded"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="font-semibold">Trạng thái:</label>
                <span
                  className={`px-4 py-2 rounded text-sm font-medium inline-block w-30 text-center whitespace-nowrap ${getStatusClasses(
                    viewDetailRequest.status
                  )}`}
                >
                  {viewDetailRequest.status}
                </span>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsViewDrawerOpen(false)}
                className="bg-gray-500 text-white font-bold px-4 py-2 rounded hover:bg-gray-600"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          <p>Không có dữ liệu.</p>
        )}
      </DrawerComponent>

      {/* Modal Popup cho hủy yêu cầu */}
      {isCancelPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow p-6 w-80">
            <p className="mb-4">Bạn có chắc chắn muốn hủy yêu cầu này?</p>
            <div className="flex justify-between gap-4">
              <button
                onClick={cancelPopup}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-300"
              >
                Đóng
              </button>
              <button
                onClick={confirmCancelRequest}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HarvestRequestManagement;
