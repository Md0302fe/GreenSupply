import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  message,
  Descriptions,
  Tag,
  Input,
  Select,
  Popover,
  Space,
} from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import axios from "axios";  
import { useSelector } from "react-redux";
import _ from "lodash";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import { useMutationHooks } from "../../../../hooks/useMutationHook";
import Loading from "../../../LoadingComponent/Loading";
import DrawerComponent from "../../../DrawerComponent/DrawerComponent";
import * as MaterialServices from "../../../../services/MaterialStorageExportService";
import * as RawMaterialBatches from "../../../../services/RawMaterialBatch";
import { useLocation } from "react-router-dom";
import { convertDateStringV1 } from "../../../../ultils";

const { Option } = Select;

const statusColors = {
  "Chờ duyệt": "gold",
  "Đã duyệt": "green",
  "Từ chối": "red",
};

const MaterialStorageExportList = () => {
  const location = useLocation();
  const [exports, setExports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedExport, setSelectedExport] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showSearchInput, setShowSearchInput] = useState(false); // Quản lý việc hiển thị thanh tìm kiếm nhỏ
  const [showStatusFilter, setShowStatusFilter] = useState(false); // Quản lý việc hiển thị lọc trạng thái

  const userRedux = useSelector((state) => state.user);
  const token = userRedux?.access_token || localStorage.getItem("access_token");

  const fetchExports = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/material-storage-export/getAllRawMaterialBatch`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            search: debouncedSearch,
            status: statusFilter,
            sortOrder: sortOrder,
          },
        }
      );

      if (response.data.success) {
        setExports(response.data.exports);
      } else {
        message.error("Lỗi khi lấy danh sách đơn xuất kho!");
      }
    } catch (error) {
      message.error("Không thể kết nối đến server!");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (location.state?.createdSuccess) {
      toast.success("Tạo đơn xuất kho thành công!");

      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const debounceFn = _.debounce(() => {
      setDebouncedSearch(searchText);
    }, 500);

    debounceFn();
    return () => debounceFn.cancel();
  }, [searchText]);

  useEffect(() => {
    fetchExports();
  }, [debouncedSearch, statusFilter, sortOrder]);

  const columns = [
    // {
    //   title: (
    //     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    //       <span>Người Tạo đơn</span>
    //       <Popover
    //         content={
    //           <div style={{ padding: 10 }}>
    //             <Input
    //               placeholder="Tìm kiếm theo tên người tạo..."
    //               value={searchText}
    //               onChange={(e) => setSearchText(e.target.value)}
    //               style={{ width: 250 }}
    //             />
    //             <div style={{ marginTop: 10 }}>
    //               <Button type="primary" onClick={() => fetchExports()}>
    //                 Tìm
    //               </Button>
    //               <Button onClick={() => setSearchText("")} style={{ marginLeft: 8 }}>
    //                 Đặt lại
    //               </Button>
    //               <Button
    //                 type="link"
    //                 onClick={() => setShowSearchInput(false)}
    //                 style={{ marginLeft: 8 }}
    //               >
    //                 Đóng
    //               </Button>
    //             </div>
    //           </div>
    //         }
    //         title="Tìm kiếm"
    //         trigger="click"
    //         visible={showSearchInput}
    //         onVisibleChange={() => setShowSearchInput(!showSearchInput)}
    //       >
    //         <Button type="link" icon={<SearchOutlined />} />
    //       </Popover>
    //     </div>
    //   ),
    //   key: "created_by",
    //   render: (_, record) => record?.user_id?.full_name || "Không rõ",
    // },
    {
      title: (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Tên Xuất Kho</span>
          <Popover
            content={
              <div style={{ padding: 10 }}>
                <Input
                  placeholder="Tìm kiếm theo tên xuất kho..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 250 }}
                />
                <div style={{ marginTop: 10 }}>
                  <Button type="primary" onClick={() => fetchExports()}>
                    Tìm
                  </Button>
                  <Button
                    onClick={() => setSearchText("")}
                    style={{ marginLeft: 8 }}
                  >
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
      dataIndex: "export_name",
      key: "export_name",
    },
    {
      title: "Loại Xuất Kho",
      dataIndex: "type_export",
      key: "type_export",
    },
    {
      title: "Đơn sản xuất",
      key: "created_by",
      render: (_, record) =>
        record?.production_request_id?.request_name || "Không rõ",
    },
    {
      title: "Lô nguyên liệu",
      key: "created_by",
      render: (_, record) => record?.batch_id?.batch_id || "Không rõ",
    },

    {
      title: (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Trạng Thái</span>
          <Popover
            content={
              <div style={{ padding: 10 }}>
                <Select
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                  style={{ width: 200 }}
                >
                  <Option value="">Tất cả</Option>
                  <Option value="Chờ duyệt">Chờ duyệt</Option>
                  <Option value="Hoàn thành">Hoàn thành</Option>
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
      render: (status) => (
        <Tag color={status === "Chờ duyệt" ? "gold" : "green"}>
          {status || "Không rõ"}
        </Tag>
      ),
    },
    {
      title: "Ngày Tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "Hành động",
      dataIndex: "action",
      key: "action",
      render: (_, record) => (
        <Button type="link" onClick={() => showExportDetails(record._id)}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

  // Accept Request
  const mutationAccept = useMutationHooks(async (data) => {
    const response = await MaterialServices.handleAcceptMaterialExport(data);
    return response;
  });
  const { isPending, isSuccess, data } = mutationAccept;

  const handleAccept = async () => {
    try {
      await mutationAccept.mutateAsync({
        access_token: userRedux?.access_token,
        storage_export_id: selectedExport._id,
      });

      const batchId = selectedExport?.batch_id?._id;

      if (batchId) {
        await RawMaterialBatches.updateRawMaterialBatchStatus(
          batchId,
          "Đã xuất kho",
          userRedux?.access_token
        );
      }

      toast.success("Duyệt đơn thành công");
      setIsDrawerOpen(false);
      fetchExports();
    } catch (error) {
      console.error("Lỗi khi duyệt đơn:", error);
      toast.error("Lỗi khi duyệt đơn hoặc cập nhật trạng thái!");
    }
  };

  // useEffect(() => {
  //   if (isSuccess) {
  //     if (data?.success) {
  //       toast.success("Xác nhận đơn thành công");
  //       setIsDrawerOpen(false);
  //     } else {
  //       toast.error("Xác nhận đơn thất bại");
  //       setIsDrawerOpen(false);
  //     }
  //     fetchExports();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isSuccess, data]);

  // useEffect(() => {
  //   if (isSuccess) {
  //     if (data?.success) {
  //       toast.success("Xác nhận đơn thành công");
  //       setIsDrawerOpen(false);
  //     } else {
  //       toast.error("Xác nhận đơn thất bại");
  //       setIsDrawerOpen(false);
  //     }
  //     fetchExports();
  //   }
  // }, [isSuccess, data]);

  const handleSortChange = (value) => {
    setSortOrder(value);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
  };

  const showExportDetails = (id) => {
    setLoading(true);
    axios
      .get(
        `${process.env.REACT_APP_API_URL}/material-storage-export/getRawMaterialBatchById/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        if (response.data.success) {
          setSelectedExport(response.data.export);
          setIsDrawerOpen(true); // ✅ mở drawer
        } else {
          message.error("Không tìm thấy đơn xuất kho!");
        }
      })
      .catch(() => message.error("Lỗi khi lấy chi tiết đơn xuất kho!"))
      .finally(() => setLoading(false));
  };

  // Reject Request
  const mutationReject = useMutationHooks(async (data) => {
    const response = await MaterialServices.handleRejectMaterialExport(data);
    return response;
  });

  const {
    isPending: isPendingDelete,
    isSuccess: isSuccessDelete,
    data: dataDelete,
  } = mutationReject;

  const handleReject = () => {
    mutationReject.mutate({
      access_token: userRedux?.access_token,
      storage_export_id: selectedExport._id,
    });
  };

  useEffect(() => {
    if (isSuccessDelete) {
      if (dataDelete?.success) {
        toast.success("Xóa đơn thành công");
        setIsDrawerOpen(false);
      } else {
        toast.error("Xóa đơn thất bại");
        setIsDrawerOpen(false);
      }
      fetchExports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccessDelete, dataDelete]);

  return (
    <div className="material-storage-export-list">
      <div className="flex justify-between items-center mb-4">
        <h5 className="text-2xl font-bold text-gray-800">
          Quản lý Đơn Xuất Kho
        </h5>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        {/* <Select
          onChange={handleStatusChange}
          value={statusFilter}
          placeholder="Lọc theo trạng thái"
          style={{ width: 200 }}
        >
          <Option value="">Tất cả</Option>
          <Option value="Chờ duyệt">Chờ duyệt</Option>
          <Option value="Hoàn thành">Hoàn thành</Option>
        </Select> */}

        {/* <Select
          onChange={handleSortChange}
          value={sortOrder}
          style={{ width: 200 }}
        >
          <Option value="desc">Mới nhất</Option>
          <Option value="asc">Cũ nhất</Option>
        </Select> */}
      </div>

      <Loading isPending={loading}>
        <Table
          columns={columns}
          dataSource={exports}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </Loading>

      {/* ✅ Drawer hiển thị chi tiết */}
      <DrawerComponent
        title="Chi tiết Đơn Xuất Kho"
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedExport(null);
        }}
        placement="right"
        width="40%"
      >
        {selectedExport ? (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Người tạo đơn">
              {selectedExport?.user_id?.full_name || "Không rõ"}
            </Descriptions.Item>
            <Descriptions.Item label="Yêu cầu sản xuất">
              {selectedExport?.production_request_id?.request_name ||
                "Không có"}
            </Descriptions.Item>
            <Descriptions.Item label="Tên lô">
              {selectedExport?.batch_id?.batch_name || "Không có"}
            </Descriptions.Item>
            <Descriptions.Item label="Mã lô ">
              {selectedExport?.batch_id?.batch_id || "Không có"}
            </Descriptions.Item>
            <Descriptions.Item label="Tên Xuất Kho">
              {selectedExport?.export_name}
            </Descriptions.Item>
            <Descriptions.Item label="Loại Xuất Kho">
              {selectedExport?.type_export}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng Thái">
              <Tag color={statusColors[selectedExport.status]}>
                {selectedExport.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo đơn">
              <Tag>{convertDateStringV1(selectedExport.createdAt)}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú">
              {selectedExport?.note || "Không có ghi chú"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {selectedExport?.createdAt}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <p className="text-center">Đang tải dữ liệu...</p>
        )}
        {selectedExport?.status === "Chờ duyệt" && (
          <div className="flex flex-col md:flex-row md:justify-between gap-4 mt-3">
            <button
              type="button"
              onClick={handleReject}
              className="bg-red-600 text-white font-bold px-4 py-2 rounded hover:bg-gray-700 w-full md:w-auto"
            >
              Hủy yêu cầu
            </button>

            <button
              onClick={handleAccept}
              className="bg-green-600 text-white font-bold px-4 py-2 rounded hover:bg-yellow-500 w-full md:w-auto"
            >
              Duyệt đơn
            </button>
          </div>
        )}
      </DrawerComponent>
      
      {/* ToastContainer */}
      <ToastContainer
        hideProgressBar={false}
        position="top-right"
        newestOnTop={false}
        pauseOnFocusLoss
        autoClose={3000}
        closeOnClick
        pauseOnHover
        theme="light"
        rtl={false}
        draggable
      />
    </div>
  );
};

export default MaterialStorageExportList;
