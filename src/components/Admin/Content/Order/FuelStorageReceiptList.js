// import React, { useEffect, useState } from "react";
// import { Table, Button, message, Space, Tag, Select, Input, Modal } from "antd";
// import {
//   EyeOutlined,
//   SearchOutlined,
//   DownloadOutlined,
// } from "@ant-design/icons";
// import axios from "axios";
// import { useSelector } from "react-redux";
// import { converDateString } from "../../../../ultils";
// import { Excel } from "antd-table-saveas-excel";
// import _ from "lodash";
// import DrawerComponent from "../../../DrawerComponent/DrawerComponent";

// const { Option } = Select;

// const FuelStorageReceiptList = () => {
//   const [receipts, setReceipts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedReceipt, setSelectedReceipt] = useState(null);
//   const [isDrawerOpen, setIsDrawerOpen] = useState(false);
//   const [searchText, setSearchText] = useState("");
//   const [debouncedSearch, setDebouncedSearch] = useState("");
//   const [statusFilterVal, setStatusFilterVal] = useState("");
//   const [sortOrder, setSortOrder] = useState("desc");

//   const userRedux = useSelector((state) => state.user);
//   const token = userRedux?.access_token || localStorage.getItem("access_token");

//   const fetchReceipts = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(
//         `${process.env.REACT_APP_API_URL}/fuel-storage/getAll`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//           params: {
//             search: debouncedSearch,
//             status: statusFilterVal,
//             sortOrder,
//           },
//         }
//       );
//       if (response.data.success) {
//         setReceipts(response.data.data);
//       } else {
//         message.error("Lỗi khi lấy danh sách đơn nhập kho!");
//       }
//     } catch (error) {
//       message.error("Không thể kết nối đến server!");
//     }
//     setLoading(false);
//   };

//   // ✅ Hàm cập nhật trạng thái có xác nhận
//   const confirmUpdateStatus = (id, newStatus) => {
//     Modal.confirm({
//       title: `Xác nhận ${newStatus === "Đã duyệt" ? "Duyệt Đơn" : "Hủy Đơn"}`,
//       content: `Bạn có chắc chắn muốn ${
//         newStatus === "Đã duyệt" ? "duyệt" : "hủy"
//       } đơn này không?`,
//       okText: "Xác nhận",
//       cancelText: "Hủy",
//       onOk: () => updateReceiptStatus(id, newStatus),
//     });
//   };

//   const updateReceiptStatus = async (id, newStatus) => {
//     try {
//       setLoading(true);
//       const response = await axios.put(
//         `${process.env.REACT_APP_API_URL}/fuel-storage/update/${id}`,
//         { status: newStatus },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (response.data.success) {
//         message.success(`Đã cập nhật trạng thái thành: ${newStatus}`);

//         // ✅ Cập nhật trong Drawer
//         setSelectedReceipt((prev) => ({ ...prev, status: newStatus }));

//         // ✅ Cập nhật trong danh sách bảng
//         setReceipts((prev) =>
//           prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r))
//         );
//       } else {
//         message.error("Cập nhật trạng thái thất bại!");
//       }
//     } catch (error) {
//       message.error("Không thể kết nối đến server!");
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     const debounceFn = _.debounce(() => {
//       setDebouncedSearch(searchText);
//     }, 500);
//     debounceFn();
//     return () => debounceFn.cancel();
//   }, [searchText]);

//   useEffect(() => {
//     fetchReceipts();
//   }, [debouncedSearch, statusFilterVal, sortOrder]);

//   const handleExportFileExcel = () => {
//     if (!receipts.length) {
//       message.warning("Không có dữ liệu để xuất!");
//       return;
//     }

//     const excel = new Excel();
//     excel
//       .addSheet("Danh sách Đơn Nhập Kho")
//       .addColumns(columns.filter((col) => col.dataIndex !== "action"))
//       .addDataSource(
//         receipts.map((receipt) => ({
//           manager: receipt.manager_id?.full_name || "Không có dữ liệu",
//           storage: receipt.storage_id?.name_storage || "Không có dữ liệu",
//           receiptType: receipt.receipt_supply_id ? "Cung cấp" : "Thu hàng",
//           quantity:
//             receipt.receipt_request_id?.quantity ||
//             receipt.receipt_supply_id?.quantity ||
//             "Không có dữ liệu",
//           status: receipt.status,
//           createdAt: converDateString(receipt.createdAt),
//           updatedAt: converDateString(receipt.updatedAt),
//           note:
//             receipt.receipt_request_id?.note ||
//             receipt.receipt_supply_id?.note ||
//             "Không có ghi chú",
//         })),
//         { str2Percent: true }
//       )
//       .saveAs("DanhSachDonNhapKho.xlsx");
//   };

//   const columns = [
//     {
//       title: "Người Quản Lý",
//       dataIndex: ["manager_id", "full_name"],
//       key: "manager_id",
//     },

//     {
//       title: "Loại Đơn Hàng",
//       key: "receipt_type",
//       render: (_, record) =>
//         record.receipt_supply_id ? (
//           <Tag color="blue">Cung cấp</Tag>
//         ) : (
//           <Tag color="green">Thu hàng</Tag>
//         ),
//     },
//     {
//       title: "Kho",
//       dataIndex: ["storage_id", "name_storage"],
//       key: "storage_id",
//     },
//     {
//       title: "Trạng Thái",
//       dataIndex: "status",
//       key: "status",
//       render: (status) => {
//         let color =
//           status === "Chờ duyệt"
//             ? "gold"
//             : status === "Đã duyệt"
//             ? "green"
//             : "red";
//         return <Tag color={color}>{status}</Tag>;
//       },
//     },
//     {
//       title: "Ngày Nhập Kho",
//       dataIndex: "createdAt",
//       key: "createdAt",
//       render: (date) => (date ? converDateString(date) : "Không có dữ liệu"),
//     },
//     {
//       title: "Ngày Cập Nhật",
//       dataIndex: "updatedAt",
//       key: "updatedAt",
//       render: (date) => (date ? converDateString(date) : "Không có dữ liệu"),
//     },
//     {
//       title: "Hành động",
//       key: "action",
//       render: (_, record) => (
//         <Button
//           type="link"
//           onClick={() => {
//             setSelectedReceipt(record);
//             setIsDrawerOpen(true);
//           }}
//         >
//           Xem chi tiết
//         </Button>
//       ),
//     },
//   ];

//   return (
//     <div className="fuel-storage-receipt-list">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-4">
//         <h5 className="text-2xl font-bold text-gray-800">
//           Quản lý Đơn Nhập Kho
//         </h5>
//         {/* <Button
//           icon={<DownloadOutlined />}
//           type="primary"
//           className="bg-blue-600 text-white"
//           onClick={handleExportFileExcel}
//         >
//           Xuất Excel
//         </Button> */}
//       </div>

//       {/* Filters */}
//       <div className="flex flex-wrap gap-4 mb-6">
//         <Input
//           placeholder="Tìm kiếm nâng cao..."
//           prefix={<SearchOutlined />}
//           value={searchText}
//           onChange={(e) => setSearchText(e.target.value)}
//           style={{ width: 280 }}
//         />
//         <Select
//           value={statusFilterVal}
//           onChange={(val) => setStatusFilterVal(val)}
//           placeholder="Lọc theo trạng thái"
//           style={{ width: 180 }}
//         >
//           <Option value="">Tất cả trạng thái</Option>
//           <Option value="Chờ duyệt">Chờ duyệt</Option>
//           <Option value="Đã duyệt">Đã duyệt</Option>
//           <Option value="Đã huỷ">Đã huỷ</Option>
//         </Select>
//         <Select
//           value={sortOrder}
//           onChange={(val) => setSortOrder(val)}
//           style={{ width: 180 }}
//         >
//           <Option value="desc">Mới nhất</Option>
//           <Option value="asc">Cũ nhất</Option>
//         </Select>
//         <Button
//           icon={<DownloadOutlined />}
//           type="primary"
//           className="bg-blue-600 text-white"
//           onClick={handleExportFileExcel}
//         >
//           Xuất Excel
//         </Button>
//       </div>

//       {/* Table */}
//       <Table
//         columns={columns}
//         dataSource={receipts}
//         loading={loading}
//         rowKey="_id"
//         pagination={{ pageSize: 10 }}
//       />

//       {/* Drawer Chi tiết */}
//       <DrawerComponent
//         title="Chi tiết Đơn Nhập Kho"
//         isOpen={isDrawerOpen}
//         onClose={() => {
//           setIsDrawerOpen(false);
//           setSelectedReceipt(null);
//         }}
//         placement="right"
//         width="30%"
//       >
//         {selectedReceipt ? (
//           <div className="">
//             {/* Tiêu đề */}
//             {/* <h2 className="text-xl font-bold uppercase text-gray-800 text-center mb-4">
//               Thông tin chi tiết
//             </h2> */}

//             {/* Bảng hiển thị dữ liệu */}
//             <div className="border border-gray-300 rounded-lg p-4">
//               <div className="grid grid-cols-10 gap-0">
//                 {/* Người Quản Lý */}
//                 <div className="col-span-4 font-semibold p-3 bg-gray-100 border border-gray-300">
//                   Người Quản Lý
//                 </div>
//                 <div className="col-span-6 p-3 border border-gray-300">
//                   {selectedReceipt.manager_id?.full_name || "Không có"}
//                 </div>

//                 {/* Kho */}
//                 <div className="col-span-4 font-semibold p-3 bg-gray-100 border border-gray-300">
//                   Kho
//                 </div>
//                 <div className="col-span-6 p-3 border border-gray-300">
//                   {selectedReceipt.storage_id?.name_storage || "Không có"}
//                 </div>

//                 {/* Loại Đơn Hàng */}
//                 <div className="col-span-4 font-semibold p-3 bg-gray-100 border border-gray-300">
//                   Loại Đơn Hàng
//                 </div>
//                 <div className="col-span-6 p-3 border border-gray-300">
//                   {selectedReceipt.receipt_supply_id ? "Cung cấp" : "Thu hàng"}
//                 </div>

//                 {/* Số Lượng */}
//                 <div className="col-span-4 font-semibold p-3 bg-gray-100 border border-gray-300">
//                   Số Lượng
//                 </div>
//                 <div className="col-span-6 p-3 border border-gray-300">
//                   {selectedReceipt.receipt_request_id?.quantity ||
//                     selectedReceipt.receipt_supply_id?.quantity ||
//                     "Không có"}
//                 </div>

//                 {/* Trạng Thái */}
//                 <div className="col-span-4 font-semibold p-3 bg-gray-100 border border-gray-300">
//                   Trạng Thái
//                 </div>
//                 <div className="col-span-6 p-3 border border-gray-300">
//                   <Tag
//                     color={
//                       selectedReceipt.status === "Chờ duyệt"
//                         ? "gold"
//                         : selectedReceipt.status === "Đã duyệt"
//                         ? "green"
//                         : "red"
//                     }
//                   >
//                     {selectedReceipt.status}
//                   </Tag>
//                 </div>

//                 {/* Ngày Nhập Kho */}
//                 <div className="col-span-4 font-semibold p-3 bg-gray-100 border border-gray-300">
//                   Ngày Nhập Kho
//                 </div>
//                 <div className="col-span-6 p-3 border border-gray-300">
//                   {converDateString(selectedReceipt.createdAt) || "Không có"}
//                 </div>

//                 {/* Ngày Cập Nhật */}
//                 <div className="col-span-4 font-semibold p-3 bg-gray-100 border border-gray-300">
//                   Ngày Cập Nhật
//                 </div>
//                 <div className="col-span-6 p-3 border border-gray-300">
//                   {converDateString(selectedReceipt.updatedAt) || "Không có"}
//                 </div>

//                 {/* Ghi chú (Nếu có) */}
//                 {selectedReceipt.receipt_request_id?.note ||
//                 selectedReceipt.receipt_supply_id?.note ? (
//                   <>
//                     <div className="col-span-4 font-semibold p-3 bg-gray-100 border border-gray-300">
//                       Ghi chú
//                     </div>
//                     <div className="col-span-6 p-3 border border-gray-300 whitespace-pre-wrap">
//                       {selectedReceipt.receipt_request_id?.note ||
//                         selectedReceipt.receipt_supply_id?.note}
//                     </div>
//                   </>
//                 ) : null}
//               </div>
//             </div>

//             {/* Nút Duyệt / Hủy */}
//             <div className="flex justify-center gap-4 mt-6">
//               <Button
//                 type="primary"
//                 className="px-6 py-2 text-lg"
//                 onClick={() =>
//                   confirmUpdateStatus(selectedReceipt._id, "Đã duyệt")
//                 }
//                 disabled={
//                   loading ||
//                   selectedReceipt.status === "Đã duyệt" ||
//                   selectedReceipt.status === "Đã huỷ"
//                 }
//               >
//                 Duyệt
//               </Button>
//               <Button
//                 danger
//                 className="px-6 py-2 text-lg"
//                 onClick={() =>
//                   confirmUpdateStatus(selectedReceipt._id, "Đã huỷ")
//                 }
//                 disabled={
//                   loading ||
//                   selectedReceipt.status === "Đã huỷ" ||
//                   selectedReceipt.status === "Đã duyệt"
//                 }
//               >
//                 Hủy
//               </Button>
//             </div>
//           </div>
//         ) : (
//           <p className="text-center text-gray-500">Đang tải chi tiết...</p>
//         )}
//       </DrawerComponent>
//     </div>
//   );
// };

// export default FuelStorageReceiptList;
import React, { useEffect, useState } from "react";
import { Table, Button, message, Space, Tag, Select, Input, Modal, Popover } from "antd";
import { EyeOutlined, SearchOutlined, DownloadOutlined, FilterOutlined } from "@ant-design/icons";
import axios from "axios";
import { useSelector } from "react-redux";
import { converDateString } from "../../../../ultils";
import { Excel } from "antd-table-saveas-excel";
import _ from "lodash";
import DrawerComponent from "../../../DrawerComponent/DrawerComponent";

const { Option } = Select;

const FuelStorageReceiptList = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilterVal, setStatusFilterVal] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);

  const userRedux = useSelector((state) => state.user);
  const token = userRedux?.access_token || localStorage.getItem("access_token");

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/fuel-storage/getAll`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            search: debouncedSearch,
            status: statusFilterVal,
            sortOrder,
          },
        }
      );
      if (response.data.success) {
        setReceipts(response.data.data);
      } else {
        message.error("Lỗi khi lấy danh sách đơn nhập kho!");
      }
    } catch (error) {
      message.error("Không thể kết nối đến server!");
    }
    setLoading(false);
  };

  const confirmUpdateStatus = (id, newStatus) => {
    Modal.confirm({
      title: `Xác nhận ${newStatus === "Đã duyệt" ? "Duyệt Đơn" : "Hủy Đơn"}`,
      content: `Bạn có chắc chắn muốn ${
        newStatus === "Đã duyệt" ? "duyệt" : "hủy"
      } đơn này không?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: () => updateReceiptStatus(id, newStatus),
    });
  };

  const updateReceiptStatus = async (id, newStatus) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/fuel-storage/update/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        message.success(`Đã cập nhật trạng thái thành: ${newStatus}`);

        setSelectedReceipt((prev) => ({ ...prev, status: newStatus }));
        setReceipts((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r))
        );
      } else {
        message.error("Cập nhật trạng thái thất bại!");
      }
    } catch (error) {
      message.error("Không thể kết nối đến server!");
    }
    setLoading(false);
  };

  useEffect(() => {
    const debounceFn = _.debounce(() => {
      setDebouncedSearch(searchText);
    }, 500);
    debounceFn();
    return () => debounceFn.cancel();
  }, [searchText]);

  useEffect(() => {
    fetchReceipts();
  }, [debouncedSearch, statusFilterVal, sortOrder]);

  const excelColumns = [
    { title: "Người Quản Lý", dataIndex: "manager" },
    { title: "Loại Đơn Hàng", dataIndex: "receiptType" },
    { title: "Kho", dataIndex: "storage" },
    { title: "Trạng Thái", dataIndex: "status" },
    { title: "Ngày Nhập Kho", dataIndex: "createdAt" },
    { title: "Ngày Cập Nhật", dataIndex: "updatedAt" },
    { title: "Số lượng", dataIndex: "quantity" },
    { title: "Ghi chú", dataIndex: "note" },
  ];

  const handleExportFileExcel = () => {
    if (!receipts.length) {
      message.warning("Không có dữ liệu để xuất!");
      return;
    }

    const excel = new Excel();
    excel
  .addSheet("Danh sách Đơn Nhập Kho")
  .addColumns(excelColumns)
  .addDataSource(
    receipts.map((receipt) => ({
      manager: receipt.manager_id?.full_name || "Không có dữ liệu",
      storage: receipt.storage_id?.name_storage || "Không có dữ liệu",
      receiptType: receipt.receipt_supply_id ? "Cung cấp" : "Thu hàng",
      quantity:
        receipt.receipt_request_id?.quantity ||
        receipt.receipt_supply_id?.quantity ||
        "Không có dữ liệu",
      status: receipt.status,
      createdAt: converDateString(receipt.createdAt),
      updatedAt: converDateString(receipt.updatedAt),
      note:
        receipt.receipt_request_id?.note ||
        receipt.receipt_supply_id?.note ||
        "Không có ghi chú",
    })),
    { str2Percent: true }
  )
  .saveAs("DanhSachDonNhapKho.xlsx");
  };

  const columns = [
    {
      title: (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Người Quản Lý</span>
          <Popover
            content={
              <div style={{ padding: 10 }}>
                <Input
                  placeholder="Tìm kiếm theo tên người quản lý..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 250 }}
                />
                <div style={{ marginTop: 10 }}>
                  <Button type="primary" onClick={() => fetchReceipts()}>
                    Tìm
                  </Button>
                  <Button onClick={() => setSearchText("")} style={{ marginLeft: 8 }}>
                    Đặt lại
                  </Button>
                  <Button
                    type="link"
                    onClick={() => setShowSearchInput(false)}
                    style={{ marginLeft: 8 }}
                  >
                    Đóng
                  </Button>
                </div>
              </div>
            }
            title="Tìm kiếm"
            trigger="click"
            visible={showSearchInput}
            onVisibleChange={() => setShowSearchInput(!showSearchInput)}
          >
            <Button type="link" icon={<SearchOutlined />} />
          </Popover>
        </div>
      ),
      key: "manager_id",
      render: (_, record) => record?.manager_id?.full_name || "Không rõ",
    },
    {
      title: "Loại Đơn Hàng",
      key: "receipt_type",
      render: (_, record) =>
        record.receipt_supply_id ? (
          <Tag color="blue">Cung cấp</Tag>
        ) : (
          <Tag color="green">Thu hàng</Tag>
        ),
    },
    {
      title: "Kho",
      dataIndex: ["storage_id", "name_storage"],
      key: "storage_id",
    },
    {
      title: (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Trạng Thái</span>
          <Popover
            content={
              <div style={{ padding: 10 }}>
                <Select
                  value={statusFilterVal}
                  onChange={(val) => setStatusFilterVal(val)}
                  style={{ width: 200 }}
                >
                  <Option value="">Tất cả trạng thái</Option>
                  <Option value="Chờ duyệt">Chờ duyệt</Option>
                  <Option value="Đã duyệt">Đã duyệt</Option>
                  <Option value="Đã huỷ">Đã huỷ</Option>
                </Select>
              </div>
            }
            title="Lọc theo trạng thái"
            trigger="click"
            visible={showStatusFilter}
            onVisibleChange={() => setShowStatusFilter(!showStatusFilter)}
          >
            <Button type="link" icon={<FilterOutlined />} />
          </Popover>
        </div>
      ),
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color =
          status === "Chờ duyệt"
            ? "gold"
            : status === "Đã duyệt"
            ? "green"
            : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Ngày Nhập Kho",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (date) => (date ? converDateString(date) : "Không có dữ liệu"),
    },
    {
      title: "Ngày Cập Nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date) => (date ? converDateString(date) : "Không có dữ liệu"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedReceipt(record);
            setIsDrawerOpen(true);
          }}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="fuel-storage-receipt-list">
      <div className="flex justify-between items-center mb-4">
        <h5 className="text-2xl font-bold text-gray-800">
          Quản lý Đơn Nhập Kho
        </h5>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        {/* <Input
          placeholder="Tìm kiếm nâng cao..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 280 }}
        />
        <Select
          value={statusFilterVal}
          onChange={(val) => setStatusFilterVal(val)}
          placeholder="Lọc theo trạng thái"
          style={{ width: 180 }}
        >
          <Option value="">Tất cả trạng thái</Option>
          <Option value="Chờ duyệt">Chờ duyệt</Option>
          <Option value="Đã duyệt">Đã duyệt</Option>
          <Option value="Đã huỷ">Đã huỷ</Option>
        </Select>
        <Select
          value={sortOrder}
          onChange={(val) => setSortOrder(val)}
          style={{ width: 180 }}
        >
          <Option value="desc">Mới nhất</Option>
          <Option value="asc">Cũ nhất</Option>
        </Select> */}
        <Button
          icon={<DownloadOutlined />}
          type="primary"
          className="bg-blue-600 text-white"
          onClick={handleExportFileExcel}
        >
          Xuất Excel
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={receipts}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 6 }}
      />

           {/* Drawer Chi tiết */}
           <DrawerComponent
        title="Chi tiết Đơn Nhập Kho"
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedReceipt(null);
        }}
        placement="right"
        width="30%"
      >
        {selectedReceipt ? (
          <div className="">
            {/* Tiêu đề */}
            {/* <h2 className="text-xl font-bold uppercase text-gray-800 text-center mb-4">
              Thông tin chi tiết
            </h2> */}

            {/* Bảng hiển thị dữ liệu */}
            <div className="border border-gray-300 rounded-lg p-4">
              <div className="grid grid-cols-10 gap-0">
                {/* Người Quản Lý */}
                <div className="col-span-4 font-semibold p-3 bg-gray-100 border border-gray-300">
                  Người Quản Lý
                </div>
                <div className="col-span-6 p-3 border border-gray-300">
                  {selectedReceipt.manager_id?.full_name || "Không có"}
                </div>

                {/* Kho */}
                <div className="col-span-4 font-semibold p-3 bg-gray-100 border border-gray-300">
                  Kho
                </div>
                <div className="col-span-6 p-3 border border-gray-300">
                  {selectedReceipt.storage_id?.name_storage || "Không có"}
                </div>

                {/* Loại Đơn Hàng */}
                <div className="col-span-4 font-semibold p-3 bg-gray-100 border border-gray-300">
                  Loại Đơn Hàng
                </div>
                <div className="col-span-6 p-3 border border-gray-300">
                  {selectedReceipt.receipt_supply_id ? "Cung cấp" : "Thu hàng"}
                </div>

                {/* Số Lượng */}
                <div className="col-span-4 font-semibold p-3 bg-gray-100 border border-gray-300">
                  Số Lượng
                </div>
                <div className="col-span-6 p-3 border border-gray-300">
                  {selectedReceipt.receipt_request_id?.quantity ||
                    selectedReceipt.receipt_supply_id?.quantity ||
                    "Không có"}
                </div>

                {/* Trạng Thái */}
                <div className="col-span-4 font-semibold p-3 bg-gray-100 border border-gray-300">
                  Trạng Thái
                </div>
                <div className="col-span-6 p-3 border border-gray-300">
                  <Tag
                    color={
                      selectedReceipt.status === "Chờ duyệt"
                        ? "gold"
                        : selectedReceipt.status === "Đã duyệt"
                        ? "green"
                        : "red"
                    }
                  >
                    {selectedReceipt.status}
                  </Tag>
                </div>

                {/* Ngày Nhập Kho */}
                <div className="col-span-4 font-semibold p-3 bg-gray-100 border border-gray-300">
                  Ngày Nhập Kho
                </div>
                <div className="col-span-6 p-3 border border-gray-300">
                  {converDateString(selectedReceipt.createdAt) || "Không có"}
                </div>

                {/* Ngày Cập Nhật */}
                <div className="col-span-4 font-semibold p-3 bg-gray-100 border border-gray-300">
                  Ngày Cập Nhật
                </div>
                <div className="col-span-6 p-3 border border-gray-300">
                  {converDateString(selectedReceipt.updatedAt) || "Không có"}
                </div>

                {/* Ghi chú (Nếu có) */}
                {selectedReceipt.receipt_request_id?.note ||
                selectedReceipt.receipt_supply_id?.note ? (
                  <>
                    <div className="col-span-4 font-semibold p-3 bg-gray-100 border border-gray-300">
                      Ghi chú
                    </div>
                    <div className="col-span-6 p-3 border border-gray-300 whitespace-pre-wrap">
                      {selectedReceipt.receipt_request_id?.note ||
                        selectedReceipt.receipt_supply_id?.note}
                    </div>
                  </>
                ) : null}
              </div>
            </div>

            {/* Nút Duyệt / Hủy */}
            <div className="flex justify-center gap-4 mt-6">
              <Button
                type="primary"
                className="px-6 py-2 text-lg"
                onClick={() =>
                  confirmUpdateStatus(selectedReceipt._id, "Đã duyệt")
                }
                disabled={
                  loading ||
                  selectedReceipt.status === "Đã duyệt" ||
                  selectedReceipt.status === "Đã huỷ"
                }
              >
                Duyệt
              </Button>
              <Button
                danger
                className="px-6 py-2 text-lg"
                onClick={() =>
                  confirmUpdateStatus(selectedReceipt._id, "Đã huỷ")
                }
                disabled={
                  loading ||
                  selectedReceipt.status === "Đã huỷ" ||
                  selectedReceipt.status === "Đã duyệt"
                }
              >
                Hủy
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">Đang tải chi tiết...</p>
        )}
      </DrawerComponent>
    </div>
  );
};

export default FuelStorageReceiptList;