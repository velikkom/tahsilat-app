export function formatPhoneNumber(phone) {
  if (!phone) {
    return "-";
  }

  const digits = phone.replace(/\D/g, "");

  if (digits.length === 11) {
    return digits.replace(/(\d{4})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4");
  }

  if (digits.length === 10) {
    return digits.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4");
  }

  return phone;
}

export function getPhoneDigits(phone) {
  if (!phone) {
    return "";
  }

  return phone.replace(/\D/g, "");
}

export function getWhatsAppNumber(phone) {
  const digits = getPhoneDigits(phone);

  if (!digits) {
    return "";
  }

  if (digits.startsWith("0")) {
    return `90${digits.slice(1)}`;
  }

  if (digits.startsWith("90")) {
    return digits;
  }

  return digits;
}

export function getTelHref(phone) {
  const digits = getPhoneDigits(phone);
  return digits ? `tel:${digits}` : "";
}

export function getWhatsAppHref(phone) {
  const whatsappNumber = getWhatsAppNumber(phone);
  return whatsappNumber ? `https://wa.me/${whatsappNumber}` : "";
}
