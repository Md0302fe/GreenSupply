import React, { useMemo } from "react";
import { Button, Table } from "antd";
import { Excel } from "antd-table-saveas-excel";
import Loading from "../../../LoadingComponent/Loading";

import {
  DownloadOutlined,
} from "@ant-design/icons";

const TableUser = (props) => {
  const { selectionType = "checkbox" } = props;
  // get Props List
  const { isLoading = false, columns = [], data: dataSource, ...rest } = props;

  // useMemo thực thi ghi nhớ và trả về 1 giá trị .
  const dataColumnsExport = useMemo(() => {
    const arr = columns?.filter(
      (col) => col.dataIndex !== "action" && col.dataIndex !== "fuel_image"
    );
    return arr;
  }, [columns]);

  // rowSelection object indicates the need for row selection
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        "selectedRows: ",
        selectedRows
      );
    },
    getCheckboxProps: (record) => ({
      disabled: record.name === "Disabled User",
      // Column configuration not to be checked
      name: record.name,
    }),
  };

  const handleExportFileExcels = () => {
    const date = new Date();
    const formattedDate = date.toLocaleDateString("vi-VN"); // Output: "27-02-2025"
    console.log(formattedDate);

    const excel = new Excel();
    excel
      .addSheet("test")
      .addColumns(dataColumnsExport)
      .addDataSource(dataSource, {
        str2Percent: true,
      })
      .saveAs(`DanhSáchThuNhiênLiệu${formattedDate}.xlsx`);
  };
  console.log("datasource => ", dataSource);
  return (
    <Loading isPending={isLoading}>
      <div className="flex justify-end mb-1">
        <Button
          icon={<DownloadOutlined />}
          type="primary"
          className="bg-blue-600 text-white"
          onClick={handleExportFileExcels}
        >
          Xuất Excel
        </Button>
      </div>

      <Table
        rowSelection={{
          type: selectionType,
          ...rowSelection,
        }}
        columns={columns}
        dataSource={dataSource || []} // Đảm bảo không truyền undefined
        pagination={{ pageSize: 6 }}
        {...rest}
      />
    </Loading>
  );
};

export default TableUser;
