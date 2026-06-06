import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";

export default function CustomersSearch({ value, onChange }) {
  return (
    <div className="mb-4">
      <IconField iconPosition="right" className="w-100">
        <InputIcon className="pi pi-search customers-search-icon" />
        <InputText
          value={value}
          onChange={onChange}
          placeholder="Search customer..."
          className="w-100 customers-search-input"
        />
      </IconField>
    </div>
  );
}
