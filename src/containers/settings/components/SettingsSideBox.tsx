import React from "react";
import {
  SideBox,
  SideBoxItem,
  SideBoxItemText,
  SideBoxTitle,
} from "../../../shared/components/SideBox";

const settingsMenus = [
  { label: "Profile", path: "/settings/update-profile" },
  // { label: "Notifications", path: "/settings/notifications" },
  { label: "User activity log", path: "/settings/history" },
  { label: "User manual", path: "/settings/user-manual" },
];

const SettingsSideBox = () => {
  return (
    <SideBox responsive>
      <SideBoxTitle>Menu</SideBoxTitle>
      {settingsMenus.map((menu) => (
        <SideBoxItem key={menu.path} to={menu.path}>
          <SideBoxItemText>{menu.label}</SideBoxItemText>
        </SideBoxItem>
      ))}
    </SideBox>
  );
};

export default SettingsSideBox;
