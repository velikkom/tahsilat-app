"use client";

export default function CollectionHeader() {
  return (
    <div className="collection-header d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mb-3 mb-md-4">
      <div>
        <h2 className="collection-header__title fw-bold page-header__title mb-1">
          Collections
        </h2>
        <p className="text-muted mb-0">Financial collection management</p>
      </div>
    </div>
  );
}
