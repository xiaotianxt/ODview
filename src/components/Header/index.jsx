import React, { useState } from "react";
import { Menu, Dropdown, Button } from "antd";
import { PageHeader } from "@ant-design/pro-components";
import {
  DownOutlined,
  SettingOutlined,
  UpOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { publish } from "pubsub-js";
import "./index.css";
const { SubMenu } = Menu;

export default function Header(props) {
  //定义Hooks
  const [collapsed, setCollapsed] = useState(true);
  //缩小sidebar
  function toggleCollapsed() {
    setCollapsed(!collapsed);
    //导航至页面
    publish("showpanel", !collapsed);
  }
  const menu = (
    <Menu>
      <SubMenu key="Mapstyle" title="地图样式" icon={<GlobalOutlined />}>
        <Menu.Item
          key="dark"
          onClick={() => {
            publish("mapstyle", "clvlrr1re03yv01phbhwge3k3");
          }}
        >
          黑色底图（中文）
        </Menu.Item>
        <Menu.Item
          key="dark2"
          onClick={() => {
            publish("mapstyle", "cjetnd20i1vbi2qqxbh0by7p8");
          }}
        >
          黑色底图（英语）
        </Menu.Item>
        <Menu.Item
          key="light"
          onClick={() => {
            publish("mapstyle", "cl38pr5lx001f15nyyersk7in");
          }}
        >
          白色底图（中文）
        </Menu.Item>
        <Menu.Item
          key="light2"
          onClick={() => {
            publish("mapstyle", "ckwfx658z4dpb14ocnz6tky9d");
          }}
        >
          白色底图（英语）
        </Menu.Item>
        <Menu.Item
          key="satellite"
          onClick={() => {
            publish("mapstyle", "cjv36gyklf43q1fnuwibiuetl");
          }}
        >
          卫星地图
        </Menu.Item>
        <Menu.Item
          key="outdoors"
          onClick={() => {
            publish("mapstyle", "outdoors-v12");
          }}
        >
          街道
        </Menu.Item>
      </SubMenu>
    </Menu>
  );

  return (
    <>
      {collapsed ? (
        <PageHeader
          className="site-page-header"
          key="site-page-header"
          title="ODview交通出行可视化分析系统"
          subTitle=""
          avatar={{ src: "images/logodark_3durbanmob.png", shape: "square" }}
          {...props}
          extra={[
            <div key="settings1">
              <Dropdown key="settings" overlay={menu} trigger={["click"]}>
                <Button key="Settingbuttom" type="text">
                  <SettingOutlined />
                </Button>
              </Dropdown>
              <Button key="navicollapsed" type="text" onClick={toggleCollapsed}>
                {React.createElement(collapsed ? UpOutlined : DownOutlined)}
              </Button>
            </div>,
          ]}
        ></PageHeader>
      ) : (
        <Button key="navicollapsed" type="text" onClick={toggleCollapsed}>
          {React.createElement(collapsed ? UpOutlined : DownOutlined)}
        </Button>
      )}
    </>
  );
}
