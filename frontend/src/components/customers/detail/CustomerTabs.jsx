"use client";

import { TabView, TabPanel } from "primereact/tabview";
import CustomerOverview from "./CustomerOverview";
import CustomerCollectionsTab from "./collections/CustomerCollectionsTab";

export default function CustomerTabs({ customer }) {
  return (
    <TabView className="customer-tabs">
      <TabPanel header="Özet">
        <CustomerOverview customer={customer} />
      </TabPanel>

      <TabPanel header="Tahsilatlar">
        <CustomerCollectionsTab customer={customer} />
      </TabPanel>
    </TabView>
  );
}
