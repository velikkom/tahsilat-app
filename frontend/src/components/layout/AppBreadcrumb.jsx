"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Breadcrumb } from "react-bootstrap";

import { breadcrumbsFor } from "@/utils/breadcrumbs";
import { useBreadcrumbLabels } from "@/context/BreadcrumbLabelsContext";

export default function AppBreadcrumb() {
  const pathname = usePathname();
  const { labels } = useBreadcrumbLabels();
  const crumbs = breadcrumbsFor(pathname, labels);

  return (
    <nav className="app-breadcrumb-bar px-3 px-md-4" aria-label="Sayfa yolu">
      <Breadcrumb className="app-breadcrumb mb-0">
        {crumbs.map((crumb) =>
          crumb.current ? (
            <Breadcrumb.Item key={crumb.href} active>
              {crumb.label}
            </Breadcrumb.Item>
          ) : (
            <Breadcrumb.Item
              key={crumb.href}
              linkAs={Link}
              href={crumb.href}
            >
              {crumb.label}
            </Breadcrumb.Item>
          )
        )}
      </Breadcrumb>
    </nav>
  );
}
