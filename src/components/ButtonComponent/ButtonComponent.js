import React from "react";
import { Button } from "antd";
import "./ButtonComponent.scss";
import { useTranslation } from "react-i18next";

const ButtonComponent = ({ type, onClick, htmlType }) => {
  const { t } = useTranslation();

  const buttonConfig = {
    cancel: {
      label: t("button.cancel"),
      className: "btn-cancel",
    },
    reject: {
      label: t("button.reject"),
      className: "btn-reject",
    },
    update: {
      label: t("button.update"),
      className: "btn-update",
    },
    approve: {
      label: t("button.approve"),
      className: "btn-approve",
    },
    close: {
      label: t("button.close"),
      className: "btn-cancel",
    },
    "approve-order": {
      label: t("button.approve_order"),
      className: "btn-approve-order",
    },
    "cancel-order": {
      label: t("button.cancel_order"),
      className: "btn-cancel-order",
    },
     "create-process": {
      label: t("button.create_process"),
      className: "btn-create-process",
    },
  };

  const config = buttonConfig[type];
  if (!config) return null;

  const resolvedHtmlType = htmlType || (type === "update" ? "submit" : "button");

  return (
    <Button
      className={`custom-button ${config.className}`}
      onClick={onClick}
      htmlType={resolvedHtmlType}
    >
      {config.label}
    </Button>
  );
};

export default ButtonComponent;
