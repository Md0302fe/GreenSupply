import React, { useState, useEffect, useMemo } from "react";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import DrawerComponent from "../../../components/DrawerComponent/DrawerComponent";
import { getAllProvideOrders } from "../../../services/HistoryProvideOrderService";

const HistoryProvideOrder = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State của view detail
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
    const [viewDetailRequest, setViewDetailRequest] = useState(null);

    // Các state cho chức năng Search
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    // Debounce tìm kiếm (300ms)
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [search]);

    function removeDiacritics(str) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    // Lọc chỉ lấy các yêu cầu có trạng thái "Hoàn Thành"
    const completedRequests = useMemo(() => {
        return requests.filter((req) => req.status === "Nhập kho thành công");
    }, [requests]);

    const filteredRequests = useMemo(() => {
        const normalizedSearch = removeDiacritics(debouncedSearch.toLowerCase());

        return completedRequests.filter((req) => {
            const fuelName = removeDiacritics(req.fuel_name.toLowerCase());
            const quantity = removeDiacritics(req.quantity.toString().toLowerCase());
            const price = removeDiacritics(req.price.toString().toLowerCase());
            const totalPrice = removeDiacritics(req.total_price.toString().toLowerCase());
            const note = removeDiacritics(req.note.toLowerCase());

            return (
                fuelName.includes(normalizedSearch) ||
                quantity.includes(normalizedSearch) ||
                price.includes(normalizedSearch) ||
                totalPrice.includes(normalizedSearch) ||
                note.includes(normalizedSearch)
            );
        });
    }, [completedRequests, debouncedSearch]);

    // Gọi API lấy danh sách
    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const data = await getAllProvideOrders();
                console.log("Dữ liệu từ API:", data);
                setRequests(data);
            } catch (error) {
                console.error("Lỗi khi gọi API:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, []);

    const handleViewDetail = (request) => {
        setViewDetailRequest(request);
        setIsViewDrawerOpen(true);
    };

    const getStatusClasses = (status) => {
        if (status === "Hoàn thành") return "bg-green-100 text-green-800";
        return "bg-gray-100 text-gray-800";
      };

    return (
        <div className="px-2">
            <div className="flex justify-between items-center pl-5 mb-4">
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
                        <thead className="text-xs text-gray-900 uppercase bg-gray-100 whitespace-nowrap">
                            <tr>
                                <th className="px-8 py-3 text-center">Tên Mặt Hàng</th>
                                <th className="px-8 py-3 text-center">Số lượng (Kg)</th>
                                <th className="px-8 py-3 text-center">Giá mỗi đơn vị</th>
                                <th className="px-8 py-3 text-center">Tổng giá</th>
                                <th className="px-8 py-3 text-center">Trạng thái</th>
                                <th className="px-8 py-3 text-center">Ghi chú</th>
                                <th className="px-8 py-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.length > 0 ? (
                                filteredRequests.map((req) => (
                                    <tr key={req._id} className="border-b whitespace-nowrap">
                                        <td className="px-6 py-4 text-center font-bold">{req.fuel_name}</td>
                                        <td className="px-6 py-4 text-center">{req.quantity}</td>
                                        <td className="px-6 py-4 text-center">
                                            {req.price.toLocaleString("vi-VN")} đ
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {req.total_price.toLocaleString("vi-VN")} đ
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <span className="px-2 py-1 rounded text-xs font-medium inline-block w-24 text-center bg-green-100 text-green-800">
                                                {/* {req.status} */}
                                                Hoàn thành
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 max-w-[180px] whitespace-nowrap overflow-hidden text-ellipsis" title={req.note}>
                                            {req.note}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                className="flex items-center text-blue-600 hover:underline p-1 rounded border border-blue-600 transition duration-200"
                                                onClick={() => handleViewDetail(req)}
                                            >
                                                <HiOutlineDocumentSearch className="mr-1" />
                                                <span className="text-sm">Chi tiết</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                                        Không có yêu cầu thu hàng nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

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
                                <label className="block mb-1 font-semibold">Số lượng (kg)</label>
                                <input
                                    type="number"
                                    value={viewDetailRequest.quantity}
                                    readOnly
                                    className="border p-2 rounded w-full mb-1"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 font-semibold">Giá mỗi đơn vị (VNĐ)</label>
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
                                    value={`${viewDetailRequest.total_price.toLocaleString("vi-VN")} VNĐ`}
                                    readOnly
                                    className="border p-2 rounded w-full mb-1"
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
                                    className={`px-4 py-2 rounded text-sm font-medium inline-block w-30 text-center whitespace-nowrap 
              ${getStatusClasses(viewDetailRequest.status)}`}
                                >
                                    {/* {viewDetailRequest.status} */}
                                    Hoàn thành
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

        </div>
    );
};

export default HistoryProvideOrder;
