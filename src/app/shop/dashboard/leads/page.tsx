import { ScreenPlaceholder } from "@/components/screen-placeholder";

export default function ShopLeadsPage() {
  return (
    <ScreenPlaceholder
      title="Interested buyers"
      back="/shop/dashboard"
      blurb="Locked/teaser view before the shop's 60-day Pro trial starts, then a real list of buyers who saved this shop's listings — never their email or phone, per pro-tier-plan.md. Rate-limited to one outreach per buyer per item."
      notes={[
        "Query: saves where shopId == this shop, order by savedAt desc",
        "'Send offer' creates offers/{shopId}_{buyerUid}_{listingId} — its existence IS the rate limit",
        "Buyer sees the outreach in chat with a transparency banner (see chats/[id])",
      ]}
    />
  );
}
