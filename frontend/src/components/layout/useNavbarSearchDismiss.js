import { useEffect } from "react";

export default function useNavbarSearchDismiss(rootRef, setOpen, setExpanded) {
  useEffect(() => {
    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
        setExpanded(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [rootRef, setOpen, setExpanded]);
}
