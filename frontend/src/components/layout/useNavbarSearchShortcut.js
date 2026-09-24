import { useEffect } from "react";

export default function useNavbarSearchShortcut(inputRef, setExpanded, setOpen) {
  useEffect(() => {
    function handleShortcut(event) {
      const isK = event.key === "k" || event.key === "K";
      const modifier = event.metaKey || event.ctrlKey;

      if (!modifier || !isK) {
        return;
      }

      const tag = event.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || event.target?.isContentEditable) {
        return;
      }

      event.preventDefault();
      setExpanded(true);
      setOpen(true);
      inputRef.current?.focus();
    }

    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, [inputRef, setExpanded, setOpen]);
}
