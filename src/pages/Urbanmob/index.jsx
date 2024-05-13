import "./index.css";
import React from "react";
import { Layout } from "antd";

import Deckmap from "@@/Deckmap";
import MyHeader from "@@/Header";
import Panelpage from "./Panelpage";

const { Sider } = Layout;

export default function Urbanmob() {
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
