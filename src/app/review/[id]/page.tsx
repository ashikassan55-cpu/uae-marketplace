import { ScreenPlaceholder } from "@/components/screen-placeholder";

export default async function LeaveReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <ScreenPlaceholder
      title="Leave a review"
      back={`/listing/${id}`}
      blurb="1-5 stars with a written comment — only shown once the buyer confirms a transaction the seller marked sold, so reviews can't be fake or retaliatory."
      notes={[
        "Requires transactions/{id}.status == 'confirmed' before this form is reachable",
        "Writes reviews/{id}; a Cloud Function recomputes shops/{shopId}.rating",
      ]}
    />
  );
}
