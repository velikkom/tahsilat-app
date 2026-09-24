export function canShareData(data) {
  try {
    return typeof navigator.canShare === "function" && navigator.canShare(data);
  } catch {
    return false;
  }
}

export function isShareCanceled(error) {
  return error?.name === "AbortError";
}

export async function shareFiles(file, title, text) {
  if (!file || typeof navigator.share !== "function") {
    return false;
  }

  const payload = { title, text, files: [file] };

  if (typeof navigator.canShare === "function" && !canShareData(payload)) {
    return false;
  }

  try {
    await navigator.share(payload);
    return true;
  } catch (error) {
    if (isShareCanceled(error)) {
      return true;
    }

    return false;
  }
}
