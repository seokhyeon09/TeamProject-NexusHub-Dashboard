import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/admin.scss";

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />
      <div className="admin-body">
        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
