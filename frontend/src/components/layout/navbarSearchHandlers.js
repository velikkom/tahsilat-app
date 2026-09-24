export function createNavbarSearchHandlers({
  router,
  results,
  activeIndex,
  showPanel,
  inputRef,
  setOpen,
  setExpanded,
  setActiveIndex,
  resetSearch,
}) {
  function goToCustomer(customer) {
    if (!customer?.id) {
      return;
    }

    router.push(`/customers/${customer.id}`);
    resetSearch();
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (results[activeIndex]) {
      goToCustomer(results[activeIndex]);
      return;
    }

    router.push("/customers");
    resetSearch();
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      setOpen(false);
      setExpanded(false);
      inputRef.current?.blur();
      return;
    }

    if (!showPanel) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) =>
        Math.min(index + 1, Math.max(results.length - 1, 0))
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    }
  }

  return { goToCustomer, handleSubmit, handleKeyDown };
}
