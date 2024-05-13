import "./index.css";
import React, { useState } from "react";
import { Layout } from "antd";

import Deckmap from "@@/Deckmap";
import MyHeader from "@@/Header";
import Panelpage from "./Panelpage";
import { useUnsubscribe } from "@/utils/usePubSub";

const { Sider } = Layout;

export default function Urbanmob() {
  const unsubscribe = useUnsubscribe(); //清除更新组件重复订阅的副作用
  //订阅panel展开收起
  unsubscribe("showpanel");

  return (
    <div>
      <Layout>
        <Sider width={"45%"} className="panel">
          <Layout>
            <MyHeader />
            <div>
              <Panelpage />
            </div>
          </Layout>
        </Sider>
        <Deckmap></Deckmap>
      </Layout>
    </div>
  );
}
