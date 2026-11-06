import { describe, expect, it } from "vitest";
import {
  addMonths,
  computeDuration,
  computeLoan,
  computeMonthlyInterest,
  formatDdMmYyyy,
  getMonthlyRate,
  maskDateInput,
  parseDdMmYyyy,
  roundUpTo5,
  type Place,
} from "./interest";

const d = (dd: number, mm: number, yyyy: number) => new Date(yyyy, mm - 1, dd);

describe("rate selection (gold ₹40,000 threshold, silver flat)", () => {
  it("gold below ₹40,000 is 2.5%", () => {
    expect(getMonthlyRate("gold", 39999)).toBe(2.5);
    expect(getMonthlyRate("gold", 1000)).toBe(2.5);
  });

  it("gold at ₹40,000 inclusive and above is 2%", () => {
    expect(getMonthlyRate("gold", 40000)).toBe(2);
    expect(getMonthlyRate("gold", 40001)).toBe(2);
    expect(getMonthlyRate("gold", 100000)).toBe(2);
  });

  it("silver is always 4% at every amount", () => {
    expect(getMonthlyRate("silver", 500)).toBe(4);
    expect(getMonthlyRate("silver", 40000)).toBe(4);
    expect(getMonthlyRate("silver", 1000000)).toBe(4);
  });
});

describe("place-specific rates", () => {
  it("uses the threshold formula at Kollaikkadu", () => {
    expect(getMonthlyRate("gold", 39999, "kollaikkadu")).toBe(2.5);
    expect(getMonthlyRate("gold", 40000, "kollaikkadu")).toBe(2);
    expect(getMonthlyRate("silver", 100000, "kollaikkadu")).toBe(4);
  });

  it("uses 2% gold at every amount and 4% silver at Thiruchitrambalam", () => {
    const places: Place[] = ["thiruchitrambalam"];
    for (const place of places) {
      expect(getMonthlyRate("gold", 1, place)).toBe(2);
      expect(getMonthlyRate("gold", 40000, place)).toBe(2);
      expect(getMonthlyRate("silver", 100000, place)).toBe(4);
    }
  });

  it("applies the selected place rate in the loan total", () => {
    const result = computeLoan("gold", 10000, d(1, 1, 2026), d(1, 3, 2026), "thiruchitrambalam");
    expect(result.rate).toBe(2);
    expect(result.monthlyInterest).toBe(200);
    expect(result.totalAmount).toBe(10200);
  });
});

describe("₹5 round-up", () => {
  it("rounds up to the next multiple of ₹5", () => {
    expect(roundUpTo5(48)).toBe(50);
    expect(roundUpTo5(22)).toBe(25);
    expect(roundUpTo5(27.5)).toBe(30);
  });

  it("keeps exact multiples unchanged", () => {
    expect(roundUpTo5(25)).toBe(25);
    expect(roundUpTo5(750)).toBe(750);
    expect(roundUpTo5(0)).toBe(0);
  });

  it("applies after the percentage math", () => {
    // ₹1,300 gold × 2.5% = ₹32.50 → ₹35
    expect(computeMonthlyInterest("gold", 1300)).toBe(35);
  });
});

describe("extra-day rules", () => {
  it("1–3 extra days are ignored", () => {
    expect(computeDuration(d(1, 10, 2026), d(4, 10, 2026)).totalMonths).toBe(0);
    // 3 full months + 3 days
    expect(computeDuration(d(24, 10, 2026), d(27, 1, 2027)).totalMonths).toBe(3);
  });

  it("4–14 extra days add 0.5 month", () => {
    expect(computeDuration(d(1, 10, 2026), d(5, 10, 2026)).totalMonths).toBe(0.5);
    expect(computeDuration(d(1, 10, 2026), d(14, 10, 2026)).totalMonths).toBe(0.5);
    expect(computeDuration(d(1, 10, 2026), d(15, 10, 2026)).totalMonths).toBe(0.5);
    expect(computeDuration(d(24, 10, 2026), d(28, 1, 2027)).totalMonths).toBe(3.5);
  });

  it("15+ extra days add 1 full month", () => {
    expect(computeDuration(d(1, 10, 2026), d(16, 10, 2026)).totalMonths).toBe(1);
    expect(computeDuration(d(24, 10, 2026), d(8, 2, 2027)).totalMonths).toBe(4);
  });

  it("counts full calendar months, clamping short months", () => {
    expect(computeDuration(d(24, 10, 2026), d(24, 1, 2027))).toEqual({
      months: 3,
      extraDays: 0,
      totalMonths: 3,
    });
    expect(addMonths(d(31, 1, 2026), 1)).toEqual(d(28, 2, 2026));
  });

  it("a same-day return is 0 months", () => {
    expect(computeDuration(d(15, 10, 2026), d(15, 10, 2026)).totalMonths).toBe(0);
  });
});

describe("dd/mm/yyyy typed input", () => {
  it("auto-inserts slashes while typing", () => {
    expect(maskDateInput("24102026")).toBe("24/10/2026");
    expect(maskDateInput("241")).toBe("24/1");
    expect(maskDateInput("24/10/2")).toBe("24/10/2");
    expect(maskDateInput("")).toBe("");
  });

  it("caps the input at 8 digits", () => {
    expect(maskDateInput("241020269999")).toBe("24/10/2026");
  });

  it("accepts real calendar dates", () => {
    expect(parseDdMmYyyy("24/10/2026")).toEqual(d(24, 10, 2026));
    expect(formatDdMmYyyy(d(1, 3, 2027))).toBe("01/03/2027");
  });

  it("rejects impossible dates and wrong formats", () => {
    expect(parseDdMmYyyy("31/02/2026")).toBeNull();
    expect(parseDdMmYyyy("00/10/2026")).toBeNull();
    expect(parseDdMmYyyy("10/13/2026")).toBeNull();
    expect(parseDdMmYyyy("1/1/2026")).toBeNull();
    expect(parseDdMmYyyy("24-10-2026")).toBeNull();
    expect(parseDdMmYyyy("24/10/26")).toBeNull();
  });
});

describe("spec example: ₹1,000 gold, 01/10/2026 → 15/10/2026", () => {
  it("0.5-month duration nets to ₹0 and never reduces the loan amount", () => {
    const r = computeLoan("gold", 1000, d(1, 10, 2026), d(15, 10, 2026));
    expect(r.totalMonths).toBe(0.5);
    expect(r.monthlyInterest).toBe(25);
    expect(r.totalInterest).toBe(12.5);
    expect(r.lessInterest).toBe(25);
    expect(r.netInterest).toBe(0);
    expect(r.totalAmount).toBe(1000);
  });
});

describe("zero-floor deduction and totals", () => {
  it("deducts one month from interest, never from the loan amount", () => {
    // ₹30,000 gold × 2.5% = ₹750/month, 3 months
    const r = computeLoan("gold", 30000, d(24, 10, 2026), d(24, 1, 2027));
    expect(r.rate).toBe(2.5);
    expect(r.monthlyInterest).toBe(750);
    expect(r.totalInterest).toBe(2250);
    expect(r.lessInterest).toBe(750);
    expect(r.netInterest).toBe(1500);
    expect(r.totalAmount).toBe(31500);
  });

  it("applies the 2% gold rate at ₹40,000+", () => {
    const r = computeLoan("gold", 40000, d(1, 1, 2026), d(1, 4, 2026));
    expect(r.monthlyInterest).toBe(800);
    expect(r.netInterest).toBe(1600);
    expect(r.totalAmount).toBe(41600);
  });

  it("silver is 4% at every amount", () => {
    const r = computeLoan("silver", 30000, d(1, 1, 2026), d(1, 4, 2026));
    expect(r.monthlyInterest).toBe(1200);
    expect(r.netInterest).toBe(2400);
    expect(r.totalAmount).toBe(32400);
  });

  it("1.5-month duration deducts exactly one month", () => {
    // 01/10 → 10/11: 1 full month + 9 extra days → +0.5
    const r = computeLoan("gold", 10000, d(1, 10, 2026), d(10, 11, 2026));
    expect(r.totalMonths).toBe(1.5);
    expect(r.monthlyInterest).toBe(250);
    expect(r.totalInterest).toBe(375);
    expect(r.lessInterest).toBe(250);
    expect(r.netInterest).toBe(125);
    expect(r.totalAmount).toBe(10125);
  });

  it("a same-day return charges nothing", () => {
    const r = computeLoan("gold", 30000, d(15, 10, 2026), d(15, 10, 2026));
    expect(r.totalInterest).toBe(0);
    expect(r.lessInterest).toBe(0);
    expect(r.netInterest).toBe(0);
    expect(r.totalAmount).toBe(30000);
  });

  it("net interest never goes below zero", () => {
    const r = computeLoan("silver", 100, d(1, 10, 2026), d(5, 10, 2026));
    expect(r.monthlyInterest).toBe(5);
    expect(r.totalInterest).toBe(2.5);
    expect(r.netInterest).toBe(0);
    expect(r.totalAmount).toBe(100);
  });
});