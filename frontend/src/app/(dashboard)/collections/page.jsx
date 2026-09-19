import { Suspense } from "react";
import CollectionsView from "@/components/collections/CollectionsView";

export default function CollectionsPage() {
  return (
    <Suspense>
      <CollectionsView />
    </Suspense>
  );
}
