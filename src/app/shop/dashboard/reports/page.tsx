import { ScreenPlaceholder } from "@/components/screen-placeholder";

export default function ShopReportsPage() {
  return (
    <ScreenPlaceholder
      title="Reports"
      back="/shop/dashboard"
      blurb="Visitor chart (week/month/year), completed-sales summary, and a stock breakdown by category with an aging-inventory nudge. Visitor counts are real, never inflated — see pro-tier-plan.md."
      notes={[
        "Reads analytics/shopVisits/{shopId}/days/* — one aggregated counter per day, no per-view writes",
        "Sales + stock are plain queries over listings (status == 'sold' / 'active') — zero AI cost",
        "Lead with relative stats (percentile, % change) before raw visitor counts for small shops",
      ]}
    />
  );
}
