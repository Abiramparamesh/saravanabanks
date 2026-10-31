import { r as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { a as ChevronRight, i as Coins, n as Sparkles, o as CalendarDays, r as ScrollText, s as BadgeIndianRupee, t as X } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-3yHIzvFs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var showroom_banner_jpg_asset_default = {
	version: 1,
	asset_id: "3d863ab2-44e4-4831-b5f1-1175961e8970",
	project_id: "4ff43326-6df4-4fd4-9a5c-7158e529c788",
	url: "/__l5e/assets-v1/3d863ab2-44e4-4831-b5f1-1175961e8970/showroom-banner.jpg",
	r2_key: "a/v1/4ff43326-6df4-4fd4-9a5c-7158e529c788/3d863ab2-44e4-4831-b5f1-1175961e8970/showroom-banner.jpg",
	original_filename: "showroom-banner.jpg",
	size: 2460877,
	content_type: "image/png",
	created_at: "2026-10-31T01:52:21Z"
};
var owner_jpg_asset_default = {
	version: 1,
	asset_id: "7771c4a4-6f27-4866-90d0-c9c700c8e74e",
	project_id: "4ff43326-6df4-4fd4-9a5c-7158e529c788",
	url: "/__l5e/assets-v1/7771c4a4-6f27-4866-90d0-c9c700c8e74e/owner.jpg",
	r2_key: "a/v1/4ff43326-6df4-4fd4-9a5c-7158e529c788/7771c4a4-6f27-4866-90d0-c9c700c8e74e/owner.jpg",
	original_filename: "owner.jpg",
	size: 2005773,
	content_type: "image/png",
	created_at: "2026-10-31T01:52:24Z"
};
/** Base monthly rates (%). */
var BASE_RATES = {
	gold: 2.5,
	silver: 4
};
/** Effective monthly rate (%) for a metal at a given loan amount. */
function getMonthlyRate(metal, amount) {
	if (metal === "silver") return BASE_RATES.silver;
	return amount >= 4e4 ? 2 : BASE_RATES.gold;
}
/** Round UP to the next multiple of ₹5 (₹48 → ₹50, ₹27.5 → ₹30, ₹25 → ₹25). */
function roundUpTo5(value) {
	const rounded = Math.ceil((value - 1e-9) / 5) * 5;
	return rounded === 0 ? 0 : rounded;
}
var MS_PER_DAY = 864e5;
/** Add n calendar months, clamping the day to the target month's length. */
function addMonths(date, n) {
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
function computeDuration(loan, ret) {
	if (ret.getTime() <= loan.getTime()) return {
		months: 0,
		extraDays: 0,
		totalMonths: 0
	};
	let months = 0;
	while (addMonths(loan, months + 1).getTime() <= ret.getTime()) months++;
	const anchor = addMonths(loan, months);
	const extraDays = Math.round((ret.getTime() - anchor.getTime()) / MS_PER_DAY);
	return {
		months,
		extraDays,
		totalMonths: months + (extraDays >= 15 ? 1 : extraDays >= 4 ? .5 : 0)
	};
}
function computeLoan(metal, amount, loanDate, returnDate) {
	const rate = getMonthlyRate(metal, amount);
	const monthlyInterest = roundUpTo5(amount * rate / 100);
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
		totalAmount: amount + netInterest
	};
}
/** Strict dd/mm/yyyy parser; rejects impossible calendar dates (31/02). */
function parseDdMmYyyy(input) {
	if (!/^\d{2}\/\d{2}\/\d{4}$/.test(input)) return null;
	const parts = input.split("/");
	const day = Number(parts[0]);
	const month = Number(parts[1]);
	const year = Number(parts[2]);
	if (month < 1 || month > 12 || day < 1 || year < 1) return null;
	const date = new Date(year, month - 1, day);
	if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
	return date;
}
function formatDdMmYyyy(date) {
	return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}
/** Auto-insert slashes while typing digits: "24102026" → "24/10/2026". */
function maskDateInput(raw) {
	const digits = raw.replace(/\D/g, "").slice(0, 8);
	let out = digits.slice(0, 2);
	if (digits.length > 2) out += "/" + digits.slice(2, 4);
	if (digits.length > 4) out += "/" + digits.slice(4, 8);
	return out;
}
/** Money label in Indian grouping: 31500 → "31,500"; 12.5 → "12.50". */
function formatInr(value) {
	const hasFraction = Math.abs(value % 1) > 1e-9;
	return value.toLocaleString("en-IN", {
		minimumFractionDigits: hasFraction ? 2 : 0,
		maximumFractionDigits: 2
	});
}
/** "3 months" / "1.5 months" / "Same day". */
function formatDuration(d) {
	if (d.totalMonths === 0) return "Same day";
	return `${d.totalMonths} ${d.totalMonths === 1 ? "month" : "months"}`;
}
function IndexPage() {
	const [loanDate, setLoanDate] = (0, import_react.useState)("");
	const [returnDate, setReturnDate] = (0, import_react.useState)("");
	const [metal, setMetal] = (0, import_react.useState)(null);
	const [amount, setAmount] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [result, setResult] = (0, import_react.useState)(null);
	const [termsOpen, setTermsOpen] = (0, import_react.useState)(false);
	const amountValue = Number(amount) || 0;
	const effectiveRate = metal ? getMonthlyRate(metal, amountValue) : null;
	function handleLoanDate(raw) {
		const masked = maskDateInput(raw);
		setLoanDate(masked);
		setError(null);
		setResult(null);
		if (parseDdMmYyyy(masked) && !returnDate.trim()) setReturnDate(formatDdMmYyyy(/* @__PURE__ */ new Date()));
	}
	function handleReturnDate(raw) {
		setReturnDate(maskDateInput(raw));
		setError(null);
		setResult(null);
	}
	function selectMetal(m) {
		setMetal(m);
		setError(null);
		setResult(null);
	}
	function handleAmount(raw) {
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
		setResult(computeLoan(metal, amountValue, loan, ret));
		setError(null);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto min-h-screen w-full max-w-md px-4 pb-28 pt-5 sm:pt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: showroom_banner_jpg_asset_default.url,
						alt: "Saravanabanks showroom",
						className: "h-44 w-full rounded-2xl object-cover shadow-card ring-1 ring-gold/30"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-espresso/70 via-transparent to-transparent" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: owner_jpg_asset_default.url,
						alt: "Proprietor of Saravanabanks",
						className: "absolute bottom-0 left-4 size-20 translate-y-1/2 rounded-full object-cover ring-gold"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pt-14 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl font-semibold tracking-wide text-gold-gradient sm:text-5xl",
					children: "Saravanabanks"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm tracking-wide text-muted-foreground",
					children: "Gold & Silver Loan Interest Calculator"
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8 rounded-2xl border border-border bg-card/90 p-5 shadow-card backdrop-blur",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-gold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl font-semibold tracking-wide",
							children: "Loan Details"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gold-hairline mt-3" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-4 space-y-4",
						onSubmit: (e) => {
							e.preventDefault();
							calculate();
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Loan Date",
								htmlFor: "loan-date",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "size-4" }),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "loan-date",
									type: "text",
									inputMode: "numeric",
									autoComplete: "off",
									placeholder: "dd/mm/yyyy",
									value: loanDate,
									onChange: (e) => handleLoanDate(e.target.value),
									className: "w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-base tracking-widest text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-ring focus:ring-2 focus:ring-ring/40"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Return Date",
								htmlFor: "return-date",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "size-4" }),
								hint: returnDate ? "Filled with today's date automatically — change it if needed." : void 0,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "return-date",
									type: "text",
									inputMode: "numeric",
									autoComplete: "off",
									placeholder: "dd/mm/yyyy",
									value: returnDate,
									onChange: (e) => handleReturnDate(e.target.value),
									className: "w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-base tracking-widest text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-ring focus:ring-2 focus:ring-ring/40"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }), " Metal"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetalButton, {
									metal: "gold",
									selected: metal === "gold",
									onClick: () => selectMetal("gold")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetalButton, {
									metal: "silver",
									selected: metal === "silver",
									onClick: () => selectMetal("silver")
								})]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Interest % (auto)",
								htmlFor: "interest",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeIndianRupee, { className: "size-4" }),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "interest",
									type: "text",
									readOnly: true,
									value: effectiveRate === null ? "" : `${effectiveRate}% per month`,
									placeholder: "Pick a metal",
									className: "w-full cursor-default rounded-xl border border-input bg-background/60 px-4 py-3 text-base tracking-wide text-gold outline-none placeholder:text-muted-foreground/50"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Loan Amount (₹)",
								htmlFor: "amount",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeIndianRupee, { className: "size-4" }),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "amount",
									type: "text",
									inputMode: "decimal",
									autoComplete: "off",
									placeholder: "e.g. 30000",
									value: amount,
									onChange: (e) => handleAmount(e.target.value),
									className: "w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-base tracking-wide text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-ring focus:ring-2 focus:ring-ring/40"
								})
							}),
							error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								role: "alert",
								className: "rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive",
								children: error
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								className: "w-full rounded-xl bg-gold-gradient py-4 font-display text-lg font-bold tracking-[0.2em] text-primary-foreground shadow-gold transition-transform active:scale-[0.98]",
								children: "CALCULATE"
							})
						]
					})
				]
			}),
			result && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultCard, { result }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => setTermsOpen(true),
				className: "fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-gold/40 bg-card/95 py-3 pl-4 pr-5 text-sm font-semibold text-gold shadow-card backdrop-blur transition-transform active:scale-95",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollText, { className: "size-4" }), "Terms & Conditions"]
			}),
			termsOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TermsDialog, { onClose: () => setTermsOpen(false) })
		]
	});
}
function Field({ label, htmlFor, icon, hint, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			htmlFor,
			className: "mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground",
			children: [icon, label]
		}),
		children,
		hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1.5 text-xs italic text-muted-foreground/80",
			children: hint
		})
	] });
}
function MetalButton({ metal, selected, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-pressed": selected,
		onClick,
		className: selected ? metal === "gold" ? "rounded-xl bg-gold-gradient py-3 font-display text-base font-bold text-primary-foreground shadow-gold transition-transform active:scale-95" : "rounded-xl bg-silver-gradient py-3 font-display text-base font-bold text-espresso shadow-card transition-transform active:scale-95" : "rounded-xl border border-border bg-background/60 py-3 font-display text-base font-semibold text-foreground transition-colors hover:border-gold/50 hover:text-gold",
		children: metal === "gold" ? "Gold · 2.5%" : "Silver · 4%"
	});
}
function ResultRow({ label, value, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-4 py-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-sm text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: accent ? "font-display text-lg font-bold text-gold" : "font-display text-lg font-semibold text-foreground",
			children: value
		})]
	});
}
function ResultCard({ result }) {
	const rows = [
		{
			label: "Loan Amount",
			value: `₹ ${formatInr(result.amount)}`
		},
		{
			label: "Duration",
			value: formatDuration(result)
		},
		{
			label: "Interest Amount",
			value: `₹ ${formatInr(result.totalInterest)}`
		},
		{
			label: "Less Interest (one month)",
			value: `− ₹ ${formatInr(result.lessInterest)}`
		},
		{
			label: "Net Interest",
			value: `₹ ${formatInr(result.netInterest)}`
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6 rounded-2xl border border-gold/30 bg-card/90 p-5 shadow-card backdrop-blur",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-gold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-semibold tracking-wide",
					children: "Calculation"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gold-hairline mt-3" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "divide-y divide-border/60",
				children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultRow, {
					label: row.label,
					value: row.value
				}, row.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-center justify-between gap-4 rounded-xl bg-gold-gradient px-4 py-3.5 shadow-gold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm font-bold uppercase tracking-widest text-primary-foreground/90",
					children: "Total Amount"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-display text-2xl font-bold text-primary-foreground",
					children: ["₹ ", formatInr(result.totalAmount)]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs italic text-muted-foreground/80",
				children: [
					"At ",
					result.rate,
					"% per month · ",
					formatInr(result.monthlyInterest),
					" rounded monthly interest",
					result.extraDays > 0 ? ` · ${result.extraDays} extra day${result.extraDays === 1 ? "" : "s"}` : ""
				]
			})
		]
	});
}
var TERMS_RULES = [
	{
		title: "Interest rates",
		body: "Gold: 2.5% per month. Gold loans of ₹40,000 or more (inclusive): 2% per month. Silver: 4% per month at every amount."
	},
	{
		title: "Monthly interest rounding",
		body: "Monthly interest = loan amount × (rate ÷ 100), rounded UP to the next multiple of ₹5 (e.g. ₹48 → ₹50, ₹22 → ₹25, ₹27.50 → ₹30)."
	},
	{
		title: "Duration",
		body: "Duration is the full calendar months between the loan date and the return date. Remaining extra days: 1–3 days are ignored; 4–14 days add 0.5 month; 15 or more days add 1 full month."
	},
	{
		title: "Interest amount",
		body: "Interest = rounded monthly interest × total months (0.5-month fractions included)."
	},
	{
		title: "Less Interest (one month)",
		body: "The first month's interest is treated as already paid at loan time. It is deducted from the total interest — never from the loan amount."
	},
	{
		title: "Net Interest",
		body: "Net Interest = total interest − one month's interest, but never below zero. If total interest is less than one month's interest (e.g. a 0.5-month duration), net interest is 0 and the loan amount is not reduced. Example: loan 01/10/2026 → return 15/10/2026, ₹1,000 gold → duration 0.5 month, interest ₹12.50, less interest ₹25, net interest ₹0, total ₹1,000."
	},
	{
		title: "Total Amount",
		body: "Total Amount = loan amount + net interest. A same-day return charges nothing."
	}
];
function TermsDialog({ onClose }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "dialog",
		"aria-modal": "true",
		"aria-label": "Terms & Conditions",
		className: "fixed inset-0 z-50 flex items-end justify-center bg-espresso/80 p-4 backdrop-blur-sm sm:items-center",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl border border-gold/30 bg-popover p-5 shadow-card",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-semibold tracking-wide text-gold-gradient",
						children: "Terms & Conditions"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Close",
						onClick: onClose,
						className: "rounded-full border border-border p-2 text-muted-foreground transition-colors hover:text-gold",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gold-hairline mt-3" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 space-y-3",
					children: TERMS_RULES.map((rule, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-xl border border-border bg-card/70 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "font-display text-base font-bold text-gold",
							children: [
								i + 1,
								". ",
								rule.title
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm leading-relaxed text-muted-foreground",
							children: rule.body
						})]
					}, rule.title))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					className: "mt-5 w-full rounded-xl bg-gold-gradient py-3 font-display text-base font-bold tracking-widest text-primary-foreground shadow-gold transition-transform active:scale-[0.98]",
					children: "CLOSE"
				})
			]
		})
	});
}
var SplitComponent = IndexPage;
//#endregion
export { SplitComponent as component };
