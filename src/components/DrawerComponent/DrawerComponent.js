import { Drawer } from "antd";
import React from "react";

const DrawerComponent = ({
  title = "Drawer",
  placement = "right",
  isOpen = false,
  children,
  ...rest
}) => {
  return (
    <>
      <Drawer title={title} placement={placement} open={isOpen} {...rest} width={470}>
        {children}
      </Drawer>
    </>
  );
};

export default DrawerComponent;
