export const DASHBOARD_SUMMARY_CARDS = [
  {
    key: "paid",
    label: "Ödendi",
    tone: "success",
    hint: "Kasaya giren tahsilat",
  },
  {
    key: "unpaid",
    label: "Ödenmedi",
    tone: "warning",
    hint: "Bekleyen çek / senet",
  },
  {
    key: "total",
    label: "Toplam",
    tone: "primary",
    hint: "Ödendi + ödenmedi",
  },
  {
    key: "due",
    label: "Vadesi gelen",
    tone: "danger",
    hint: "Bugün ve gecikmiş",
    href: "/collections?due=1",
  },
];

export function buildDashboardSummaryValues(data) {
  const paid = Number(data?.paidAmount ?? 0);
  const unpaid = Number(data?.unpaidAmount ?? 0);
  const dueCount = Number(data?.dueMaturityCount ?? 0);

  return {
    paid,
    unpaid,
    dueCount,
    values: {
      paid,
      unpaid,
      total: paid + unpaid,
      due: data?.dueMaturityAmount,
    },
    subtitles: {
      paid: null,
      unpaid: null,
      total: null,
      due: dueCount > 0 ? `${dueCount} kayıt` : "Kayıt yok",
    },
  };
}
