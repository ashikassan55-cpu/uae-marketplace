import { ScreenPlaceholder } from "@/components/screen-placeholder";

export default async function StoryViewerPage({
  params,
}: {
  params: Promise<{ shopId: string; storyId: string }>;
}) {
  const { shopId } = await params;
  return (
    <ScreenPlaceholder
      title="Story"
      back={`/shop/${shopId}`}
      blurb="Full-screen story viewer with a segmented progress bar and a tied-listing card. Shows a sold-out state once that listing's status flips to 'sold'."
      notes={[
        "Reads shops/{shopId}/stories/{storyId}; expiresAt drives 24h auto-expiry",
        "soldOut flag flips a Cloud Function trigger when the tied listing sells",
      ]}
    />
  );
}
