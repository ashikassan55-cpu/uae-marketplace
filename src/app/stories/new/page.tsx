import { ScreenPlaceholder } from "@/components/screen-placeholder";

export default function PostStoryPage() {
  return (
    <ScreenPlaceholder
      title="Post a story"
      back="/shop/dashboard"
      blurb="Single photo + a required tied listing. Free-tier shops posting a new story while one is already live see a 'this replaces your current story' warning — base feature, not Pro-gated; only the concurrent-story count differs by tier."
      notes={[
        "Writes shops/{shopId}/stories/{storyId} with expiresAt = now + 24h",
        "Enforce storiesConfig.maxConcurrent server-side, not just in the UI",
      ]}
    />
  );
}
