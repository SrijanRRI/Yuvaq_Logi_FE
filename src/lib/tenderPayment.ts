// src/lib/tenderPayment.ts
export function toNumber(v: any): number {
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function calcAdvancePayment(params: {
  pricePerMt: number;      // ₹ per MT
  totalWeightMt: number;   // MT
  percent?: number;        // default 5%
}) {
  const percent = params.percent ?? 5;

  // Work in paise to avoid float issues
  const totalPaise = Math.round(params.pricePerMt * params.totalWeightMt * 100);
  const advancePaise = Math.round(totalPaise * (percent / 100));

  return {
    percent,
    totalWeightMt: params.totalWeightMt,
    pricePerMt: params.pricePerMt,

    totalPaise,
    advancePaise,

    totalRupees: totalPaise / 100,
    advanceRupees: advancePaise / 100,
  };
}
