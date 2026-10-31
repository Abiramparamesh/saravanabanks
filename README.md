# Gold & Silver Loan Calculator

Build a web app called "Saravanabanks"— Interest Calculator", a single-page gold & silver loan interest calculator.

PAGE LAYOUT (single page, mobile-first, dark luxury design with deep espresso/maroon background, champagne-gold accents, Cormorant Garamond serif headings + Mulish sans body, everything in INR):

1. Header at the top: a wide showroom banner image (full-width, rounded, ~176px tall) with a small circular owner photo (80px, gold ring) overlapping its bottom-left, and below it the shop name "Saravanabanks" in a gold gradient serif, with the subtitle "Gold & Silver Loan Interest Calculator".

2. A form card below with these fields, in this exact order:
   - "Loan Date": typed text input, NOT a calendar picker, format dd/mm/yyyy, placeholder "dd/mm/yyyy". As the user types digits, auto-insert slashes (typing 24102026 becomes 24/10/2026). Validate real calendar dates.
   - "Return Date": same typed dd/mm/yyyy input. It is auto-filled with today's date immediately after a valid loan date is entered (only if it's still empty), with the hint "Filled with today's date automatically — change it if needed."
   - "Metal": two side-by-side buttons "Gold · 2.5%" and "Silver · 4%". Tapping one selects it (gold = gold gradient, silver = silver gradient) and immediately fills the interest field.
   - "Interest % (auto)": read-only field filled by the metal selection.
   - "Loan Amount (₹)": number input, placeholder "e.g. 30000".
   - A full-width gold "CALCULATE" button. Show a red error message if fields are invalid or the return date is before the loan date.

3. Calculation result card (shown only after Calculate), rows:
   Loan Amount · Duration (e.g. "3 months" / "1.5 months") · Interest Amount · Less Interest (one month) · Net Interest · Total Amount (emphasised, gold badge).

4. A fixed "Terms & Conditions" pill button in the bottom-right corner. Tapping it opens a popup titled "Terms & Conditions" listing ALL formulas and rules used, with a Close button.

INTEREST RULES (exact, no deviations):
1. Rates: Gold 2.5% per month; if a gold loan is ₹40,000 or more (inclusive), 2% per month. Silver is always 4% per month at every amount.
2. Monthly interest = loan amount × (rate ÷ 100), rounded UP to the next multiple of ₹5 (e.g. ₹48 → ₹50, ₹22 → ₹25, ₹27.50 → ₹30).
3. Duration = full calendar months between loan date and return date. Remaining extra days: 1–3 days → ignored; 4–14 days → +0.5 month; 15+ days → +1 full month.
4. Interest = rounded monthly interest × total months.
5. "Less Interest (one month)": the first month's interest is treated as already paid at loan time. It is deducted from total interest, NEVER from the loan amount.
6. Net Interest = total interest − one month's interest, but never below zero. If total interest is less than one month's interest (e.g. a 0.5-month duration), net interest is 0 and the loan amount is not reduced. Example that must match exactly: loan 01/10/2026 → return 15/10/2026, ₹1,000 gold: duration 0.5 month, interest ₹12.5, less interest ₹25, net interest ₹0, total ₹1,000.
7. Total Amount = loan amount + net interest. A same-day return charges nothing.

All money math must live as pure functions in one file (src/lib/interest.ts), covered by automated tests for: rate selection at/below ₹40,000, the ₹5 round-up, the extra-day rules, the dd/mm/yyyy typing/parsing, the zero-floor deduction, and the totals.

Put the Terms & Conditions rule list on a card layout, keep all colors as design tokens in a global stylesheet, and add proper page title and meta description.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4ff43326-6df4-4fd4-9a5c-7158e529c788).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
