import { ARKA_ROW_CAPACITY, toNumber } from "@/utils/tripDokumuFormat";

export default function buildTripDokumuArkaModel(preview, pageIndex = 0) {
  const allRows = preview.collectionRows || [];
  const from = pageIndex * ARKA_ROW_CAPACITY;
  const pageRows = allRows.slice(from, from + ARKA_ROW_CAPACITY);
  const lines = Array.from({ length: ARKA_ROW_CAPACITY }, (_, index) => {
    return pageRows[index] || { siraNo: from + index + 1 };
  });

  return {
    lines,
    cash: pageRows.reduce((sum, row) => sum + toNumber(row.nakitTutari), 0),
    senet: pageRows.reduce((sum, row) => sum + toNumber(row.senetTutar), 0),
    cek: pageRows.reduce((sum, row) => sum + toNumber(row.cekTutar), 0),
    mailOrder: pageRows.reduce((sum, row) => sum + toNumber(row.mailorder), 0),
    havale: pageRows.reduce((sum, row) => sum + toNumber(row.havaleTutar), 0),
    posYkb: pageRows.reduce((sum, row) => sum + toNumber(row.posYkb), 0),
    posTeb: pageRows.reduce((sum, row) => sum + toNumber(row.posTeb), 0),
  };
}
