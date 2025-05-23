import React, { useState,useRef} from "react";
import DrawerComponent from "../../../components/DrawerComponent/DrawerComponent";
import * as FuelSupplyRequestService from "../../../services/HistoryProvideOrderService";
import { SearchOutlined } from "@ant-design/icons";
import { IoDocumentText } from "react-icons/io5";
import { Button, Input, Table, Tag, Space } from "antd";
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import Highlighter from "react-highlight-words";

const HistoryProvideOrder = () => {

    const user = useSelector((state) => state.user);
    const [loading, setLoading] = useState(true);
    const searchInput = useRef(null);

    // State của view detail
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
    const [viewDetailRequest, setViewDetailRequest] = useState(null);

    // Các state cho chức năng Search
    const [search, setSearch] = useState("");
      // Các state cho chức năng Search
      const [searchText, setSearchText] = useState("");
      const [searchedColumn, setSearchedColumn] = useState("");

    const fetchGetAllRequests = async () => {
      const access_token = user?.access_token;
      const user_id = user?.id;

      return await FuelSupplyRequestService.getProvideOrderHistories(
        access_token,
        { user_id }
      );
    };
    
    const { data, isLoading } = useQuery({
      queryKey: ["fuelRequests", user?.id],
      queryFn: fetchGetAllRequests,
    });

    const handleViewDetail = (request) => {
        setViewDetailRequest(request);
        setIsViewDrawerOpen(true);
    };

    const getStatusClasses = (status) => {
        if (status === "Hoàn thành") return "bg-green-100 text-green-800";
        return "bg-gray-100 text-gray-800";
    };

      const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText("");
      };
    
      const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
      };
    
      const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({
          setSelectedKeys,
          selectedKeys,
          confirm,
          clearFilters,
          close,
        }) => (
          <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
            <Input
              ref={searchInput}
              placeholder={`Tìm kiếm ${dataIndex}`}
              value={selectedKeys[0]}
              onChange={(e) =>
                setSelectedKeys(e.target.value ? [e.target.value] : [])
              }
              onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
              style={{ marginBottom: 8, display: "block" }}
            />
            <Space>
              <Button
                type="primary"
                onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                icon={<SearchOutlined />}
                size="small"
                style={{ width: 90 }}
              >
                Tìm
              </Button>
              <Button
                onClick={() => clearFilters && handleReset(clearFilters)}
                size="small"
                style={{ width: 90 }}
              >
                Đặt lại
              </Button>
              <Button type="link" size="small" onClick={() => close()}>
                Đóng
              </Button>
            </Space>
          </div>
        ),
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
        ),
        onFilter: (value, record) =>
          record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        render: (text) =>
          searchedColumn === dataIndex ? (
            <Highlighter
              highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
              searchWords={[searchText]}
              autoEscape
              textToHighlight={text ? text.toString() : ""}
            />
          ) : (
            text
          ),
      });


      const columns = [
          {
            title: "Tên nguyên liệu",
            dataIndex: "fuel_name",
            key: "fuel_name",
            ...getColumnSearchProps("fuel_name"),
            sorter: (a, b) => a.fuel_name.localeCompare(b.fuel_name),
          },
          {
            title: <div style={{ textAlign: "center" }}>Số lượng (Kg)</div>,
            dataIndex: "quantity",
            key: "quantity",
            className: "text-center",
            sorter: (a, b) => a.quantity - b.quantity,
          },
          {
            title: <div style={{ textAlign: "center" }}>Giá mỗi đơn vị (VNĐ/Kg)</div>,
            dataIndex: "price",
            key: "price",
            className: "text-center",
            sorter: (a, b) => a.price - b.price,
            render: (price) => price || "Không có giá mỗi kg",
          },
          {
            title: <div style={{ textAlign: "center" }}>Tổng giá (VNĐ)</div>,
            dataIndex: "total_price",
            key: "total_price",
            className: "text-center",
            sorter: (a, b) => a.total_price - b.total_price, // Enable sorting
            render: (_, record) => record.total_price, // Calculate dynamically
          },
          {
            title: <div style={{ textAlign: "center" }}>Trạng thái</div>,
            dataIndex: "status",
            key: "status",
            className: "text-center",
            filters: [
              { text: "Đã duyệt", value: "Đã duyệt" },
              { text: "Chờ duyệt", value: "Chờ duyệt" },
              { text: "Đã hủy", value: "Đã hủy" },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status) => {
              let color = "orange"; // Default for "Chờ duyệt"
              if (status === "Đã duyệt") color = "green";
              if (status === "Đã hủy") color = "red";
              return <Tag color={color}>{status}</Tag>;
            },
          },
          // {
          //   title: "Ghi Chú",
          //   dataIndex: "note",
          //   key: "note",
          //   render: (note) => note || "Không có ghi chú",
          // },
          // {
          //   title: "Cập Nhật",
          //   dataIndex: "updatedAt",
          //   key: "updatedAt",
          //   sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt), // 🔽 Sorting by date
          //   render: (updatedAt) => converDateString(updatedAt),
          // },
          {
            title: <div style={{ textAlign: "center" }}>Hành động</div>,
            key: "actions",
            className: "text-center",
            render: (_, record) => {
              const isPending = record.status === "Chờ duyệt";
              return (
                <Space size={8}>
                  {/* Sửa */}
                  {/* <Button
                    icon={<AiFillEdit />}
                    onClick={() => handleEdit(record)}
                    disabled={!isPending}
                    size="middle"
                  /> */}
                  {/* Xóa */}
                  {/* <Button
                    icon={<MdDelete />}
                    onClick={() => {
                      setRowSelected(record._id);
                      setIsOpenDelete(true);
                    }}
                    disabled={!isPending}
                    size="middle"
                  /> */}
                  {/* Xem Chi Tiết */}
                  <Button
                    type="default"
                    icon={<IoDocumentText />}
                    onClick={() => handleViewDetail(record)}
                    size="middle"
                  />
                </Space>
              );
            },
          },
        ];
    return (
        <div className="px-2">
            <div className ="text-center font-bold text-2xl mb-5">
              Lịch Sử Đơn Cung Cấp Nguyên Liệu
            </div>

            <hr />
            {isLoading ? (
                <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
            ) : (
              <div className="Main-Content">
                <Table
                  columns={columns}
                  dataSource={data}
                  loading={isLoading}
                  rowKey={(record) => record._id}
                  pagination={{ pageSize: 6 }}
                />
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
