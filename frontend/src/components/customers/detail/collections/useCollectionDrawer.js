import { useCallback, useState } from "react";

export default function useCollectionDrawer() {
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);

  const handleSelectCollection = useCallback((collection) => {
    setSelectedCollection(collection);
    setShowDrawer(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setShowDrawer(false);
  }, []);

  return {
    selectedCollection,
    showDrawer,
    handleSelectCollection,
    closeDrawer,
  };
}
