"use client";

import useSidebar from "@/hooks/useSidebar";
import Sidebar from "./SideBar";
import MobileSidebar from "./MobileSidebar";
import Navbar from "./NavBar";

export default function DashboardShell({ children }) {
  const { isOpen, toggle, close } = useSidebar();

  return (
    <div className="dashboard-shell d-flex min-vh-100">
      {/* Fixed sidebar: CSS-hidden below 1024px (see .app-sidebar) */}
      <Sidebar />

      {/* Drawer: only visible when hamburger toggles isOpen */}
      <MobileSidebar show={isOpen} onHide={close} />

      <div className="dashboard-shell__content d-flex flex-column min-v-0">
        <Navbar onMenuToggle={toggle} />

        <main className="dashboard-shell__main flex-grow-1 p-3 p-md-4">
          {children}
        </main>
      </div>
    </div>
  );
}
