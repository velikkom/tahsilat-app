export function getCustomerMapQuery(customer) {
  const address = String(customer?.address || "").trim();

  if (!address) {
    return "";
  }

  return address;
}

export function googleMapsEmbedUrl(query) {
  const params = new URLSearchParams({
    q: query,
    z: "16",
    hl: "tr",
    output: "embed",
  });

  return `https://maps.google.com/maps?${params.toString()}`;
}

export function googleMapsSearchUrl(query) {
  const params = new URLSearchParams({
    api: "1",
    query,
  });

  return `https://www.google.com/maps/search/?${params.toString()}`;
}
