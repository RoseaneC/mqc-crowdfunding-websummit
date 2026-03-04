import { Button, Icon, Layout } from "@stellar/design-system";
import "./App.module.css";
import ConnectAccount from "./components/ConnectAccount.tsx";
import { Routes, Route, Outlet, NavLink } from "react-router-dom";
import Debugger from "./pages/Debugger.tsx";

// Crowdfunding imports
import CrowdfundingLayout from "./components/crowdfunding/CrowdfundingLayout";
import Home from "./pages/crowdfunding/Home";
import Projects from "./pages/crowdfunding/Projects";
import Contribute from "./pages/crowdfunding/Contribute";
import Success from "./pages/crowdfunding/Success";
import Dashboard from "./pages/crowdfunding/Dashboard";
import Transparency from "./pages/crowdfunding/Transparency";
import Login from "./pages/crowdfunding/Login";
import Doar from "./pages/crowdfunding/Doar";
import Apoiar from "./pages/crowdfunding/Apoiar";
import Contact from "./pages/crowdfunding/Contact";
import NotFound from "./pages/crowdfunding/NotFound";

// Admin imports
import AdminLayout from "./components/admin/AdminLayout";
import RequireAdminAuth from "./components/admin/RequireAdminAuth";
import RequireRole from "./components/admin/RequireRole";
import AdminAuth from "./pages/admin/Auth";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProjects from "./pages/admin/Projects";
import AdminReports from "./pages/admin/Reports";
import AdminMROSC from "./pages/admin/MROSC";

const AppLayout: React.FC = () => (
  <main>
    <Layout.Header
      projectId="My App"
      projectTitle="My App"
      contentRight={
        <>
          <nav>
            <NavLink
              to="/debug"
              style={{
                textDecoration: "none",
              }}
            >
              {({ isActive }) => (
                <Button
                  variant="tertiary"
                  size="md"
                  onClick={() => (window.location.href = "/debug")}
                  disabled={isActive}
                >
                  <Icon.Code02 size="md" />
                  Debugger
                </Button>
              )}
            </NavLink>
          </nav>
          <ConnectAccount />
        </>
      }
    />
    <Outlet />
    <Layout.Footer>
      <span>
        © {new Date().getFullYear()} My App. Licensed under the{" "}
        <a
          href="http://www.apache.org/licenses/LICENSE-2.0"
          target="_blank"
          rel="noopener noreferrer"
        >
          Apache License, Version 2.0
        </a>
        .
      </span>
    </Layout.Footer>
  </main>
);

function App() {
  return (
    <Routes>
      {/* Crowdfunding Routes with custom Tailwind layout */}
      <Route element={<CrowdfundingLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/projetos" element={<Projects />} />
        <Route path="/contribuir" element={<Contribute />} />
        <Route path="/sucesso" element={<Success />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transparencia" element={<Transparency />} />
        <Route path="/contato" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/doar" element={<Doar />} />
        <Route path="/apoiar" element={<Apoiar />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin Routes with admin layout */}
      <Route path="/admin/auth" element={<AdminAuth />} />
      <Route
        path="/admin"
        element={
          <RequireAdminAuth>
            <AdminLayout />
          </RequireAdminAuth>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="projetos" element={<AdminProjects />} />
        <Route
          path="relatorios"
          element={
            <RequireRole role="SUPERADMIN">
              <AdminReports />
            </RequireRole>
          }
        />
        <Route
          path="mrosc"
          element={
            <RequireRole role="SUPERADMIN">
              <AdminMROSC />
            </RequireRole>
          }
        />
      </Route>

      {/* Debugger Routes with Stellar Design layout */}
      <Route element={<AppLayout />}>
        <Route path="/debug" element={<Debugger />} />
        <Route path="/debug/:contractName" element={<Debugger />} />
      </Route>
    </Routes>
  );
}

export default App;
