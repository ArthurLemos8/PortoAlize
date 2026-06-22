import {
  createRootRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import { Layout, Menu } from "antd";
import type { MenuProps } from "antd";
const { Sider, Content } = Layout;

export const RootComponent = () => {
  const location = useLocation();
  const currentKey = location.pathname;

  const items: MenuProps["items"] = [
    {
      key: "/",
      label: <Link to="/">Home</Link>,
    },
    {
      key: "/content",
      label: <Link to="/content">Sobre</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider theme="light" width={200}>
        <Menu
          selectedKeys={[currentKey]}
          mode="inline"
          items={items}
          style={{ height: "100%", borderRight: 0 }}
        />
      </Sider>

      <Layout style={{ padding: "24px" }}>
        <Content
          style={{
            padding: 24,
            margin: 0,
            minHeight: 280,
            background: "#fff",
            borderRadius: 8,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
});
