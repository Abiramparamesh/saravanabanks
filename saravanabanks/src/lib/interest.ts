// Pure interest math for Saravanabanks — no React, no DOM, fully testable.
// All rules come from the shop's terms; do not change them here without
// changing the Terms & Conditions list on the page.

export type Metal = "gold" | "silver";

/** Base monthly rates (%). */
export const BASE_RATES: Record<Metal, number> = { gold: 2.5, silver: 4 };
/** Gold loans of ₹40,000 or more (inclusive) drop to this monthly rate (%). */
export const GOLD_HIGH_AMOUNT = 40000;
export const GOLD_HIGH_RATE = 2;

/** Effective monthly rate (%) for a metal at a given loan amount. */
export function getMonthlyRate(metal: Metal, amount: number): number {
  if (metal === "silver") return BASE_RATES.silver;
  return amount >= GOLD_HIGH_AMOUNT ? GOLD_HIGH_RATE : BASE_RATES.gold;
}

/** Round UP to the next multiple of ₹5 (₹48 → ₹50, ₹27.5 → ₹30, ₹25 → ₹25). */
export function roundUpTo5(value: number): number {
  const rounded = Math.ceil((value - 1e-9) / 5) * 5;
  return rounded === 0 ? 0 : rounded; // avoid -0
}

/** Rounded monthly interest for a loan: amount × (rate ÷ 100), ceil to ₹5. */
export function computeMonthlyInterest(metal: Metal, amount: number): number {
  return roundUpTo5((amount * getMonthlyRate(metal, amount)) / 100);
}

export interface Duration {
  /** Full calendar months between loan date and return date. */
  months: number;
  /** Days left over after the full months. */
  extraDays: number;
  /** months + extra-day adjustment (0, 0.5 or +1). */
  totalMonths: number;
}

const MS_PER_DAY = 86400000;

/** Add n calendar months, clamping the day to the target month's length. */
export function addMonths(date: Date, n: number): Date {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  const target = new Date(y, m + n, 1);
  const daysInTarget = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(d, daysInTarget));
  return target;
}

/**
 * Duration between two dates.
 * Extra days: 1–3 ignored, 4–14 → +0.5 month, 15+ → +1 full month.
 * A same-day return is 0 months.
 */
export function computeDuration(loan: Date, ret: Date): Duration {
  if (ret.getTime() <= loan.getTime()) {
    return { months: 0, extraDays: 0, totalMonths: 0 };
  }
  let months = 0;
  while (addMonths(loan, months + 1).getTime() <= ret.getTime()) {
    months++;
  }
  const anchor = addMonths(loan, months);
  const extraDays = Math.round((ret.getTime() - anchor.getTime()) / MS_PER_DAY);
  const extraMonths = extraDays >= 15 ? 1 : extraDays >= 4 ? 0.5 : 0;
  return { months, extraDays, totalMonths: months + extraMonths };
}

export interface LoanBreakdown {
  metal: Metal;
  amount: number;
  rate: number;
  /** Rounded monthly interest (multiple of ₹5). */
  monthlyInterest: number;
  months: number;
  extraDays: number;
  totalMonths: number;
  /** monthlyInterest × totalMonths. */
  totalInterest: number;
  /** One month's interest, treated as already paid at loan time. */
  lessInterest: number;
  /** totalInterest − lessInterest, floored at 0. */
  netInterest: number;
  /** loan amount + netInterest (loan amount is never reduced). */
  totalAmount: number;
}

export function computeLoan(
  metal: Metal,
  amount: number,
  loanDate: Date,
  returnDate: Date,
): LoanBreakdown {
  const rate = getMonthlyRate(metal, amount);
  const monthlyInterest = roundUpTo5((amount * rate) / 100);
  const { months, extraDays, totalMonths } = computeDuration(loanDate, returnDate);
  const totalInterest = monthlyInterest * totalMonths;
  const lessInterest = totalMonths > 0 ? monthlyInterest : 0;
  const netInterest = Math.max(0, totalInterest - lessInterest);
  return {
    metal,
    amount,
    rate,
    monthlyInterest,
    months,
    extraDays,
    totalMonths,
    totalInterest,
    lessInterest,
    netInterest,
    totalAmount: amount + netInterest,
  };
}

/* ---------- dd/mm/yyyy typed input helpers ---------- */

/** Strict dd/mm/yyyy parser; rejects impossible calendar dates (31/02). */
export function parseDdMmYyyy(input: string): Date | null {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(input)) return null;
  const parts = input.split("/");
  const day = Number(parts[0]);
  const month = Number(parts[1]);
  const year = Number(parts[2]);
  if (month < 1 || month > 12 || day < 1 || year < 1) return null;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

export function formatDdMmYyyy(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${date.getFullYear()}`;
}

/** Auto-insert slashes while typing digits: "24102026" → "24/10/2026". */
export function maskDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  let out = digits.slice(0, 2);
  if (digits.length > 2) out += "/" + digits.slice(2, 4);
  if (digits.length > 4) out += "/" + digits.slice(4, 8);
  return out;
}

/** Money label in Indian grouping: 31500 → "31,500"; 12.5 → "12.50". */
export function formatInr(value: number): string {
  const hasFraction = Math.abs(value % 1) > 1e-9;
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

/** "3 months" / "1.5 months" / "Same day". */
export function formatDuration(d: Duration): string {
  if (d.totalMonths === 0) return "Same day";
  return `${d.totalMonths} ${d.totalMonths === 1 ? "month" : "months"}`;
}
