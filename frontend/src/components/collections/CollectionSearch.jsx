"use client";

import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";

export default function CollectionSearch({
  globalFilterValue,
  onGlobalFilterChange,
  clearFilter,
}) {
  return (
    <div className="collection-search-bar d-flex justify-content-between align-items-center gap-3">
      <Button
        type="button"
        icon="pi pi-filter-slash"
        label="Clear"
        outlined
        onClick={clearFilter}
        className="touch-target flex-shrink-0"
      />

      <IconField iconPosition="right" className="w-100">
        <InputIcon className="pi pi-search collections-search-icon" />
        <InputText
          value={globalFilterValue}
          onChange={onGlobalFilterChange}
          placeholder="Search collections..."
          className="w-100 collections-search-input"
        />
      </IconField>
    </div>
  );
}
