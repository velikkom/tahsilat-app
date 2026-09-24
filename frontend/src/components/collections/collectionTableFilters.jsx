import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { PAYMENT_TYPE_FILTER_OPTIONS } from "@/utils/collectionUtils";

const paymentTypes = PAYMENT_TYPE_FILTER_OPTIONS
  .filter((option) => option.value !== "ALL")
  .map((option) => option.value);
const statuses = ["PENDING", "PAID"];

export function paymentTypeFilterTemplate(options) {
  return (
    <Dropdown
      value={options.value}
      options={paymentTypes}
      onChange={(e) => options.filterCallback(e.value)}
      placeholder="Select"
      className="p-column-filter"
      showClear
    />
  );
}

export function statusFilterTemplate(options) {
  return (
    <Dropdown
      value={options.value}
      options={statuses}
      onChange={(e) => options.filterCallback(e.value)}
      placeholder="Select"
      className="p-column-filter"
      showClear
    />
  );
}

export function amountFilterTemplate(options) {
  return (
    <InputNumber
      value={options.value}
      onChange={(e) => options.filterCallback(e.value)}
      mode="currency"
      currency="TRY"
      locale="tr-TR"
    />
  );
}

export function dateFilterTemplate(options) {
  return (
    <Calendar
      value={options.value}
      onChange={(e) => options.filterCallback(e.value)}
      dateFormat="dd/mm/yy"
    />
  );
}
