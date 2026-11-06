import { useMemo, useState } from "react";
import {
  BadgeIndianRupee,
  CalendarDays,
  ChevronRight,
  Coins,
  ScrollText,
  Sparkles,
  X,
} from "lucide-react";
import showroomBanner from "@/assets/showroomBanner.png";
import ownerPhoto from "@/assets/ownerPhoto.png";
import {
  computeLoan,
  formatDdMmYyyy,
  formatDuration,
  formatInr,
  getMonthlyRate,
  maskDateInput,
  parseDdMmYyyy,
  type LoanBreakdown,
  type Metal,
  type Place,
} from "@/lib/interest";
import { Button } from "@/components/ui/button";

export default function IndexPage() {
  const [loanDate, setLoanDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [place, setPlace] = useState<Place>("kollaikkadu");
  const [metal, setMetal] = useState<Metal | null>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LoanBreakdown | null>(null);
  const [termsOpen, setTermsOpen] = useState(false);

  const amountValue = Number(amount) || 0;
  const effectiveRate = metal ? getMonthlyRate(metal, amountValue, place) : null;

  function handleLoanDate(raw: string) {
    const masked = maskDateInput(raw);
    setLoanDate(masked);
    setError(null);
    setResult(null);
    const parsed = parseDdMmYyyy(masked);
    if (parsed && !returnDate.trim()) {
      setReturnDate(formatDdMmYyyy(new Date()));
    }
  }

  function handleReturnDate(raw: string) {
    setReturnDate(maskDateInput(raw));
    setError(null);
    setResult(null);
  }

  function selectMetal(m: Metal) {
    setMetal(m);
    setError(null);
    setResult(null);
  }

  function handleAmount(raw: string) {
    const cleaned = raw.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");
    setAmount(cleaned);
    setError(null);
    setResult(null);
  }

  function calculate() {
    const loan = parseDdMmYyyy(loanDate);
    const ret = parseDdMmYyyy(returnDate);
    if (!loan) {
      setError("Enter a valid loan date as dd/mm/yyyy.");
      return;
    }
    if (!ret) {
      setError("Enter a valid return date as dd/mm/yyyy.");
      return;
    }
    if (ret.getTime() < loan.getTime()) {
      setError("Return date cannot be before the loan date.");
      return;
    }
    if (!metal) {
      setError("Choose Gold or Silver.");
      return;
    }
    if (!(amountValue > 0)) {
      setError("Enter a loan amount greater than ₹0.");
      return;
    }
    setResult(computeLoan(metal, amountValue, loan, ret, place));
    setError(null);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4 pb-28 pt-5 sm:pt-8">
      {/* ---------- Header ---------- */}
      <header>
        <div className="relative">
          <img
            src={showroomBanner}
            alt="Saravanabanks showroom"
            className="h-44 w-full rounded-2xl object-cover shadow-card ring-1 ring-gold/30"
          />
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-espresso/70 via-transparent to-transparent" />
          <img
            src={ownerPhoto}
            alt="Proprietor of Saravanabanks"
            className="absolute bottom-0 left-4 size-20 translate-y-1/2 rounded-full object-cover ring-gold"
          />
        </div>
        <div className="pt-14 text-center">
          <h1 className="font-display text-4xl font-semibold tracking-wide text-gold-gradient sm:text-5xl">
            Saravanabanks
          </h1>
          <p className="mt-1 text-sm tracking-wide text-muted-foreground">
            Gold &amp; Silver Loan Interest Calculator
          </p>
        </div>
      </header>

      {/* ---------- Form card ---------- */}
      <section className="mt-8 rounded-2xl border border-border bg-card/90 p-5 shadow-card backdrop-blur">
        <div className="flex items-center gap-2 text-gold">
          <Coins className="size-4" />
          <h2 className="font-display text-xl font-semibold tracking-wide">
            Loan Details
          </h2>
        </div>
        <div className="gold-hairline mt-3" />

        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            calculate();
          }}
        >
          {/* Loan Date */}
          <Field label="Loan Date" htmlFor="loan-date" icon={<CalendarDays className="size-4" />}>
            <input
              id="loan-date"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="dd/mm/yyyy"
              value={loanDate}
              onChange={(e) => handleLoanDate(e.target.value)}
              className="w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-base tracking-widest text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-ring focus:ring-2 focus:ring-ring/40"
            />
          </Field>

          {/* Return Date */}
          <Field
            label="Return Date"
            htmlFor="return-date"
            icon={<CalendarDays className="size-4" />}
            hint={
              returnDate
                ? "Filled with today's date automatically — change it if needed."
                : undefined
            }
          >
            <input
              id="return-date"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="dd/mm/yyyy"
              value={returnDate}
              onChange={(e) => handleReturnDate(e.target.value)}
              className="w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-base tracking-widest text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-ring focus:ring-2 focus:ring-ring/40"
            />
          </Field>

          {/* Lending place */}
          <div>
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Lending Place
            </span>
            <div className="grid grid-cols-2 gap-3">
              {([
                ["kollaikkadu", "Kollaikkadu"],
                ["thiruchitrambalam", "Thiruchitrambalam"],
              ] as const).map(([value, label]) => (
                <Button
                  key={value}
                  type="button"
                  variant="outline"
                  aria-pressed={place === value}
                  onClick={() => {
                    setPlace(value);
                    setError(null);
                    setResult(null);
                  }}
                  className={`h-auto min-h-12 w-full whitespace-normal rounded-xl border px-3 py-3 font-display text-base leading-tight transition-colors ${
                    place === value
                      ? "border-gold bg-gold-gradient font-bold text-primary-foreground shadow-gold hover:text-primary-foreground"
                      : "border-border bg-background/60 font-semibold text-foreground hover:border-gold/50 hover:text-gold"
                  }`}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Metal */}
          <div>
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Sparkles className="size-4" /> Metal
            </span>
            <div className="grid grid-cols-2 gap-3">
              <MetalButton
                metal="gold"
                selected={metal === "gold"}
                onClick={() => selectMetal("gold")}
              />
              <MetalButton
                metal="silver"
                selected={metal === "silver"}
                onClick={() => selectMetal("silver")}
              />
            </div>
          </div>

          {/* Interest % */}
          <Field label="Interest % (auto)" htmlFor="interest" icon={<BadgeIndianRupee className="size-4" />}>
            <input
              id="interest"
              type="text"
              readOnly
              value={effectiveRate === null ? "" : `${effectiveRate}% per month`}
              placeholder="Pick a metal"
              className="w-full cursor-default rounded-xl border border-input bg-background/60 px-4 py-3 text-base tracking-wide text-gold outline-none placeholder:text-muted-foreground/50"
            />
          </Field>

          {/* Loan Amount */}
          <Field label="Loan Amount (₹)" htmlFor="amount" icon={<BadgeIndianRupee className="size-4" />}>
            <input
              id="amount"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="e.g. 30000"
              value={amount}
              onChange={(e) => handleAmount(e.target.value)}
              className="w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-base tracking-wide text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-ring focus:ring-2 focus:ring-ring/40"
            />
          </Field>

          {error && (
            <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-gold-gradient py-4 font-display text-lg font-bold tracking-[0.2em] text-primary-foreground shadow-gold transition-transform active:scale-[0.98]"
          >
            CALCULATE
          </button>
        </form>
      </section>

      {/* ---------- Result card ---------- */}
      {result && <ResultCard result={result} />}

      {/* ---------- Fixed Terms pill ---------- */}
      <button
        type="button"
        onClick={() => setTermsOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-gold/40 bg-card/95 py-3 pl-4 pr-5 text-sm font-semibold text-gold shadow-card backdrop-blur transition-transform active:scale-95"
      >
        <ScrollText className="size-4" />
        Terms &amp; Conditions
      </button>

      {/* ---------- Terms popup ---------- */}
      {termsOpen && <TermsDialog place={place} onClose={() => setTermsOpen(false)} />}
    </main>
  );
}

/* ---------- Pieces ---------- */

function Field({
  label,
  htmlFor,
  icon,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  icon?: React.ReactNode;
  hint?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
      >
        {icon}
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs italic text-muted-foreground/80">{hint}</p>}
    </div>
  );
}

function MetalButton({
  metal,
  selected,
  onClick,
}: {
  metal: Metal;
  selected: boolean;
  onClick: () => void;
}) {
  const label = metal === "gold" ? "Gold" : "Silver";
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={
        selected
          ? metal === "gold"
            ? "rounded-xl bg-gold-gradient py-3 font-display text-base font-bold text-primary-foreground shadow-gold transition-transform active:scale-95"
            : "rounded-xl bg-silver-gradient py-3 font-display text-base font-bold text-espresso shadow-card transition-transform active:scale-95"
          : "rounded-xl border border-border bg-background/60 py-3 font-display text-base font-semibold text-foreground transition-colors hover:border-gold/50 hover:text-gold"
      }
    >
      {label}
    </button>
  );
}

function ResultRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={
          accent
            ? "font-display text-lg font-bold text-gold"
            : "font-display text-lg font-semibold text-foreground"
        }
      >
        {value}
      </span>
    </div>
  );
}

function ResultCard({ result }: { result: LoanBreakdown }) {
  const rows: { label: string; value: string }[] = [
    { label: "Loan Amount", value: `₹ ${formatInr(result.amount)}` },
    { label: "Duration", value: formatDuration(result) },
    { label: "Interest Amount", value: `₹ ${formatInr(result.totalInterest)}` },
    { label: "Less Interest (one month)", value: `− ₹ ${formatInr(result.lessInterest)}` },
    { label: "Net Interest", value: `₹ ${formatInr(result.netInterest)}` },
  ];
  return (
    <section className="mt-6 rounded-2xl border border-gold/30 bg-card/90 p-5 shadow-card backdrop-blur">
      <div className="flex items-center gap-2 text-gold">
        <ChevronRight className="size-4" />
        <h2 className="font-display text-xl font-semibold tracking-wide">Calculation</h2>
      </div>
      <div className="gold-hairline mt-3" />
      <div className="divide-y divide-border/60">
        {rows.map((row) => (
          <ResultRow key={row.label} label={row.label} value={row.value} />
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between gap-4 rounded-xl bg-gold-gradient px-4 py-3.5 shadow-gold">
        <span className="text-sm font-bold uppercase tracking-widest text-primary-foreground/90">
          Total Amount
        </span>
        <span className="font-display text-2xl font-bold text-primary-foreground">
          ₹ {formatInr(result.totalAmount)}
        </span>
      </div>
      <p className="mt-3 text-xs italic text-muted-foreground/80">
        At {result.rate}% per month · {formatInr(result.monthlyInterest)} rounded monthly interest
        {result.extraDays > 0 ? ` · ${result.extraDays} extra day${result.extraDays === 1 ? "" : "s"}` : ""}
      </p>
    </section>
  );
}

function getTermsRules(place: Place): { title: string; body: string }[] {
  const rates = place === "kollaikkadu"
    ? "Kollaikkadu: Gold 2.5% per month below ₹40,000; gold at ₹40,000 or more: 2% per month. Silver: 4% per month."
    : "Thiruchitrambalam: Gold 2% per month at every amount. Silver: 4% per month.";
  return [
  {
    title: "Interest rates",
    body: rates,
  },
  {
    title: "Monthly interest rounding",
    body: "Monthly interest = loan amount × (rate ÷ 100), rounded UP to the next multiple of ₹5 (e.g. ₹48 → ₹50, ₹22 → ₹25, ₹27.50 → ₹30).",
  },
  {
    title: "Duration",
    body: "Duration is the full calendar months between the loan date and the return date. Remaining extra days: 1–3 days are ignored; 4–14 days add 0.5 month; 15 or more days add 1 full month.",
  },
  {
    title: "Interest amount",
    body: "Interest = rounded monthly interest × total months (0.5-month fractions included).",
  },
  {
    title: "Less Interest (one month)",
    body: "The first month's interest is treated as already paid at loan time. It is deducted from the total interest — never from the loan amount.",
  },
  {
    title: "Net Interest",
    body: "Net Interest = total interest − one month's interest, but never below zero. If total interest is less than one month's interest (e.g. a 0.5-month duration), net interest is 0 and the loan amount is not reduced. Example: loan 01/10/2026 → return 15/10/2026, ₹1,000 gold → duration 0.5 month, interest ₹12.50, less interest ₹25, net interest ₹0, total ₹1,000.",
  },
  {
    title: "Total Amount",
    body: "Total Amount = loan amount + net interest. A same-day return charges nothing.",
  },
  ];
}

function TermsDialog({ place, onClose }: { place: Place; onClose: () => void }) {
  const termsRules = getTermsRules(place);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Terms & Conditions"
      className="fixed inset-0 z-50 flex items-end justify-center bg-espresso/80 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl border border-gold/30 bg-popover p-5 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold tracking-wide text-gold-gradient">
            Terms &amp; Conditions
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:text-gold"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="gold-hairline mt-3" />
        <div className="mt-4 space-y-3">
          {termsRules.map((rule, i) => (
            <article key={rule.title} className="rounded-xl border border-border bg-card/70 p-4">
              <h3 className="font-display text-base font-bold text-gold">
                {i + 1}. {rule.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{rule.body}</p>
            </article>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-gold-gradient py-3 font-display text-base font-bold tracking-widest text-primary-foreground shadow-gold transition-transform active:scale-[0.98]"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}
