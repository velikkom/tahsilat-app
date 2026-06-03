import CustomersHeader from '@/components/customers/CustomersHeader';
import CustomersTable from '@/components/customers/CustomersTable';

export default function CustomersPage() {

    return (

        <div className="customers-page">

            <CustomersHeader />

            <CustomersTable />

        </div>
    );
}