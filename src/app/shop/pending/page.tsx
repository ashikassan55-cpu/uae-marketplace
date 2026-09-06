import { ScreenPlaceholder } from "@/components/screen-placeholder";

export default function ShopPendingPage() {
  return (
    <ScreenPlaceholder
      title="Verification in progress"
      back="/profile"
      blurb="Shows the two-stage timeline: automated document check (instant), then human approval (targeting 5-10 minutes). A 'needs attention' state tells the seller exactly which document to reupload, without restarting the whole application."
      notes={[
        "Live-updates from shops/{shopId}.verification.status via onSnapshot",
        "'Contact support' escape hatch on the needs-attention state",
      ]}
    />
  );
}
