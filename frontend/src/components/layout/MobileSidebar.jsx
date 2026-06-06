"use client";

import Offcanvas from "react-bootstrap/Offcanvas";
import SidebarNav from "./SidebarNav";

export default function MobileSidebar({ show, onHide }) {
  return (
    <Offcanvas
      show={show}
      onHide={onHide}
      placement="start"
      backdrop
      scroll={false}
      className="mobile-sidebar text-white d-flex flex-column"
      backdropClassName="mobile-sidebar-backdrop"
    >
      <Offcanvas.Header closeButton closeVariant="white" className="border-0 pb-0">
        <Offcanvas.Title className="visually-hidden">Navigation</Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body className="d-flex flex-column pt-2 flex-grow-1">
        <SidebarNav onNavigate={onHide} />
      </Offcanvas.Body>
    </Offcanvas>
  );
}
