"use client";

export default function CustomerCollectionDrawerField({ label, children }) {
  return (
    <div className="customer-collection-drawer__field">
      <span className="customer-collection-drawer__label text-muted">
        {label}
      </span>
      <div className="customer-collection-drawer__value">{children}</div>
    </div>
  );
}
