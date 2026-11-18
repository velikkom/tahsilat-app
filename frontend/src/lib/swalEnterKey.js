function isSwalTextEntry(target, popup) {
  if (!(target instanceof HTMLElement) || !popup.contains(target)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  const tag = target.tagName;

  if (tag === "TEXTAREA" || tag === "SELECT") {
    return true;
  }

  if (tag === "INPUT") {
    const type = (target.getAttribute("type") || "text").toLowerCase();
    return !["button", "submit", "checkbox", "radio", "file", "hidden"].includes(type);
  }

  return false;
}

function isActionButton(button, popup) {
  return (
    button instanceof HTMLButtonElement &&
    popup.contains(button) &&
    button.matches(".swal2-confirm, .swal2-cancel, .swal2-deny") &&
    !button.disabled &&
    window.getComputedStyle(button).display !== "none"
  );
}

export function resolveSwalEnterButton(popup, options, activeElement) {
  if (isActionButton(activeElement, popup)) {
    return activeElement;
  }

  const confirmButton = popup.querySelector(".swal2-confirm");
  const cancelButton = popup.querySelector(".swal2-cancel");
  const denyButton = popup.querySelector(".swal2-deny");

  if (options.focusDeny && isActionButton(denyButton, popup)) {
    return denyButton;
  }

  if (options.focusCancel && isActionButton(cancelButton, popup)) {
    return cancelButton;
  }

  if (isActionButton(confirmButton, popup)) {
    return confirmButton;
  }

  if (isActionButton(cancelButton, popup)) {
    return cancelButton;
  }

  return null;
}

export function createSwalEnterKeyListener(popup, options) {
  return (event) => {
    if (event.key !== "Enter" || event.repeat || event.isComposing || event.keyCode === 229) {
      return;
    }

    if (
      !popup.isConnected ||
      popup.classList.contains("swal2-hide") ||
      popup.classList.contains("swal2-loading")
    ) {
      return;
    }

    if (isSwalTextEntry(event.target, popup)) {
      return;
    }

    const button = resolveSwalEnterButton(popup, options, document.activeElement);

    if (!button) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    button.click();
  };
}
