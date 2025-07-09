import React from "react";
import { Button } from "antd";
import "./ButtonComponent.scss"; // dùng file SCSS
import { useTranslation } from "react-i18next";


const ButtonComponent = ({ type, onClick }) => {
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
  };

  const config = buttonConfig[type];
  if (!config) return null;

  return (
    <Button className={`custom-button ${config.className}`} onClick={onClick}>
      {config.label}
    </Button>
  );
};

export default ButtonComponent;
