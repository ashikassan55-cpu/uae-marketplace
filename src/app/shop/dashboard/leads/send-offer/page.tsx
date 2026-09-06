import { ScreenPlaceholder } from "@/components/screen-placeholder";

export default function SendOfferPage() {
  return (
    <ScreenPlaceholder
      title="Send offer"
      back="/shop/dashboard/leads"
      blurb="Compose a message to one interested buyer, optionally attaching a small catalogue of the shop's other listings."
      notes={[
        "Backend callable function: check-then-create offers/{shopId}_{buyerUid}_{listingId} in a transaction",
        "Creates (or reuses) the chats/{chatId} thread with shopOutreach set",
      ]}
    />
  );
}
