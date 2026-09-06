import { ScreenPlaceholder } from "@/components/screen-placeholder";

export default function ShopApplyPage() {
  return (
    <ScreenPlaceholder
      title="Become a Verified Shop"
      back="/profile"
      blurb="Trade license + Emirates ID (front/back) upload, then a two-stage AI + human check (see claude/shop-verification-flow.md) before this account unlocks the shop dashboard."
      notes={[
        "File upload to Storage under shops/{shopId}/verification/",
        "shops/{shopId} doc created with verification.status = 'submitted'",
        "Cloud Function: Claude Haiku vision check → 'ai_review' pass/fail, then human review queue",
        "On approval: proTrialEndsAt = approvedAt + 60 days, role flips to 'shop'",
      ]}
    />
  );
}
