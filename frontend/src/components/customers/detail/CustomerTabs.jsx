import { TabView, TabPanel } from "primereact/tabview";
import CustomerOverview from "./CustomerOverview";
import CustomerCollectionsTab from "./collections/CustomerCollectionsTab";

export default function CustomerTabs({ customer }) {
  return (
    <TabView className="customer-tabs">
      <TabPanel header="Overview">
        <CustomerOverview customer={customer} />
      </TabPanel>

      <TabPanel header="Collections">
        <CustomerCollectionsTab customer={customer} />
      </TabPanel>

      <TabPanel header="Notes">
        <div className="card p-4">Customer notes section</div>
      </TabPanel>
    </TabView>
  );
}
