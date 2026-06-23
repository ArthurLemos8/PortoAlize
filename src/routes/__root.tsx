import { Home, TableOfContents, Building2, Store } from "lucide-react";
import {
  createRootRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import { Layout, Menu } from "antd";
import type { MenuProps } from "antd";
import { colors } from "../utils/colors";
const { Sider, Content } = Layout;

export const RootComponent = () => {
  const location = useLocation();
  const items: MenuProps["items"] = [
    {
      key: "/",
      label: <Link to="/">Home</Link>,
      icon: <Home />,
    },
    {
      key: "/content",
      label: <Link to="/content">Conteúdo</Link>,
      icon: <TableOfContents />,
    },
    {
      key: "/city",
      label: <Link to="/city">Cidades</Link>,
      icon: <Building2/>,
    },
    {
      key: "/establishmen",
      label: <Link to="/establishmen">Estabelecimentos</Link>,
      icon: <Store/>,
    }
    
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Sider
        width={300}
        theme="light"
        style={{
          background: "#fff",
          borderRight: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            padding: "24px 20px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: colors.primary,
              letterSpacing: -0.5,
            }}
          >
            PortoAlize
          </div>
        </div>

        <Menu
          selectedKeys={[location.pathname]}
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
