export function formatConflictDetails(issue) {
  if (!issue.conflictCustomerId && !issue.conflictAmount) {
    return "-";
  }

  const parts = [];

  if (issue.conflictSource) {
    parts.push(`Kaynak: ${issue.conflictSource}`);
  }

  if (issue.conflictRowNumber) {
    parts.push(`Satır: ${issue.conflictRowNumber}`);
  }

  if (issue.conflictCustomerId) {
    parts.push(`customerId=${issue.conflictCustomerId}`);
  }

  if (issue.conflictAmount != null) {
    parts.push(`amount=${issue.conflictAmount}`);
  }

  if (issue.conflictCollectionDate) {
    parts.push(`collectionDate=${issue.conflictCollectionDate}`);
  }

  if (issue.conflictPaymentType) {
    parts.push(`paymentType=${issue.conflictPaymentType}`);
  }

  if (issue.conflictMaturityDate) {
    parts.push(`maturityDate=${issue.conflictMaturityDate}`);
  }

  return parts.join(" | ");
}
