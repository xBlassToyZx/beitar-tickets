const formatter = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  maximumFractionDigits: 0,
});

/** Formats an amount in agorot as shekels, e.g. 13000 → "‏130 ₪". */
export function formatILS(agorot: number): string {
  return formatter.format(agorot / 100);
}

export function formatCount(n: number): string {
  return n.toLocaleString("he-IL");
}
