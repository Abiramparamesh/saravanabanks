import { createFileRoute } from "@tanstack/react-router";
import Index from "./-index-page";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Saravanabanks — Gold & Silver Loan Interest Calculator" },
      {
        name: "description",
        content:
          "Calculate gold and silver loan interest in seconds. Gold from 2.5% a month (2% on ₹40,000+), silver at 4% — rounded, deducted and totalled the Saravanabanks way.",
      },
      { property: "og:title", content: "Saravanabanks — Gold & Silver Loan Interest Calculator" },
      {
        property: "og:description",
        content:
          "Gold & silver loan interest calculator: month-wise duration, ₹5-rounded monthly interest, one-month deduction and exact totals.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});
