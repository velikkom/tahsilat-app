import CustomersHeader from "@/components/customers/CustomersHeader";
import CustomersTable from "@/components/customers/CustomersTable";

export default function CustomersPage() {
  return (
    <div className="customers-page d-flex flex-column gap-3 gap-md-4">
      <CustomersHeader />
      <CustomersTable />
    </div>
  );
}
