import React, { useMemo } from "react";
import { Button, Table } from "antd";
import { Excel } from "antd-table-saveas-excel";
import Loading from "../../../LoadingComponent/Loading";
import { DownloadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const TableUser = (props) => {
  const { t } = useTranslation();

  // get Props List
  const {
    isLoading = false,
    columns = [],
    columnsExport = [],
    data: dataSource,
    ...rest
  } = props;

  // useMemo thực thi ghi nhớ và trả về 1 giá trị .
  const dataColumnsExport = useMemo(() => {
    const arr = columns?.filter((col) => col.dataIndex !== "action");
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
    const excel = new Excel();
    excel
      .addSheet("Mangovate")
      .addColumns(columnsExport)
      .addDataSource(dataSource)
      .saveAs("Excel.xlsx");
  };

  return (
    <Loading isPending={isLoading}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          icon={<DownloadOutlined />}
          style={{
            backgroundColor: "#1E90FF",
            color: "#fff",
            border: "none",
          }}
          className="button-exportFile"
          onClick={handleExportFileExcels}
        >
          {t("export_excel")}
        </Button>
      </div>

      <Table
        rowSelection={{
          ...rowSelection,
        }}
        columns={columns}
        dataSource={dataSource}
        pagination={{ pageSize: 6 }}
        {...rest}
      />
    </Loading>
  );
};

export default TableUser;
