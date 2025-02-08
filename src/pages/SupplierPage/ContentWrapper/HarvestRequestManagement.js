import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { AiFillEdit } from "react-icons/ai";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import { MdOutlineCancelScheduleSend } from "react-icons/md";
import DrawerComponent from "../../../components/DrawerComponent/DrawerComponent";
import Shop from "../../../assets/NewProject/Icon-GreenSupply/shop-illustration.webp";

import {
  getAllHarvestRequests,
  updateHarvestRequest,
  cancelHarvestRequest,
} from "../../../services/HarvestRequestService";

const HarvestRequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [errors, setErrors] = useState({});

  const [editForm, setEditForm] = useState({
    fuel_name: "",
    quantity: "",
    price: "",
    address: "",
    note: "",
  });

  // 🟢 Gọi API lấy danh sách yêu cầu thu hoạch khi component được mount
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
    setIsDrawerOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    let newErrors = { ...errors };

    if (value.trim() === "") {
      newErrors[name] = "Trường này không được để trống!";
      toast.error(newErrors[name]);
      setErrors(newErrors);
      return;
    } else {
      delete newErrors[name];
    }

    // Kiểm tra nếu nhập số 0 ở đầu
    if ((name === "quantity" || name === "price") && value.startsWith("0")) {
      const errorMessage =
        name === "quantity"
          ? "Số lượng phải từ 1 trở lên."
          : "Giá phải từ 1 trở lên.";
      toast.error(errorMessage);
      return;
    }

    if (name === "fuel_name") {
      if (!/^[a-zA-Z0-9\s\u00C0-\u1EF9]+$/.test(value)) {
        newErrors.fuel_name = "Không được nhập ký tự đặc biệt!";
        toast.error(newErrors.fuel_name);
        return;
      } else {
        delete newErrors.fuel_name;
      }
      setErrors(newErrors);
    }

    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    if (!selectedRequest) return;

    const updatedData = {
      fuel_name: editForm.fuel_name,
      quantity: Number(editForm.quantity),
      price: Number(editForm.price),
      total_price: Number(editForm.quantity) * Number(editForm.price),
      address: editForm.address,
      note: editForm.note,
    };

    if (
      !editForm.fuel_name ||
      !editForm.quantity ||
      !editForm.price ||
      !editForm.address
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin trước khi cập nhật!");
      return;
    }

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

  const handleCancelRequest = async (requestId, status) => {
    if (!requestId) return;

    if (status !== "Chờ duyệt") {
      toast.warning("Chỉ có thể hủy yêu cầu ở trạng thái 'Chờ duyệt'.");
      return;
    }

    if (!window.confirm("Bạn có chắc chắn muốn hủy yêu cầu này?")) {
      return;
    }

    try {
      const response = await cancelHarvestRequest(requestId); // Gọi API chỉ với requestId

      if (!response.success) {
        throw new Error(response.message);
      }

      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req._id === requestId ? { ...req, status: "Đã hủy" } : req
        )
      );

      toast.success("Yêu cầu đã được hủy thành công!");
    } catch (error) {
      toast.error(`Hủy thất bại: ${error.message || "Lỗi không xác định"}`);
    }
  };

  return (
    <div className="px-2">
      <div className="w-full border border-gray-200 flex items-center gap-20 mb-5 justify-between rounded-md p-6 bg-white shadow">
        <div className="info">
          <h1 className="text-3xl font-bold mb-3 text-black">Good Morning</h1>
          <p>
            Here's what's happening in your store today. See the statistics.
          </p>
        </div>
        <img src={Shop} className="w-[250px]" alt="Shop Illustration" />
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="relative overflow-x-auto max-w-full shadow-md sm:rounded-lg bg-white">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-800 uppercase bg-gray-100 whitespace-nowrap">
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
              {requests.length > 0 ? (
                requests.map((req) => (
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
                        <button
                          className=" hover:underline mr-4"
                          onClick={() => handleEditClick(req)}
                        >
                          <AiFillEdit />
                        </button>
                        <button
                          className={`text-red-600 hover:underline mr-4 ${
                            req.status !== "Chờ duyệt"
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          onClick={() =>
                            handleCancelRequest(req._id, req.status)
                          }
                          disabled={req.status !== "Chờ duyệt"}
                        >
                          <MdOutlineCancelScheduleSend />
                        </button>

                        <button
                          className="text-blue-600 hover:underline"
                          onClick={() => handleEditClick(req)}
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
      {/* Drawer để chỉnh sửa đơn hàng */}
      <DrawerComponent
        title="Chỉnh sửa yêu cầu thu hàng"
        isOpen={isDrawerOpen}
        placement="right"
        onClose={() => setIsDrawerOpen(false)}
      >
        {selectedRequest ? (
          <div className="w-full p-6 bg-white rounded-md shadow">
            {/* Tiêu đề */}
            {/* <h2 className="text-xl font-[800] mb-4 text-black flex items-center gap-3">
              <AiFillEdit />
              Chỉnh Sửa Yêu Cầu Thu Hàng
            </h2> */}

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
                  onChange={handleEditChange}
                  className="border p-2 rounded w-full mb-2"
                />
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
                    if (!/^[a-zA-Z0-9\s\u00C0-\u1EF9]*$/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  className="border p-2 rounded w-full mb-2"
                />
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
                    if (!/^[a-zA-Z0-9\s\u00C0-\u1EF9]*$/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  className="border p-2 rounded w-full mb-2"
                />
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
                  className="border p-2 rounded w-full mb-2"
                />
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

            {/* note */}
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
    </div>
  );
};

export default HarvestRequestManagement;
