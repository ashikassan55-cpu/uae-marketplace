import { ScreenPlaceholder } from "@/components/screen-placeholder";

export default async function ShopPublicPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  return (
    <ScreenPlaceholder
      title={subdomain}
      back="/search"
      blurb="Public shop page: cover photo, category chips, item grid, and a sticky cart bar. Phase 1 serves this at /shop/[subdomain]; a real subdomain (shopname.yoursite.ae) needs Next.js middleware rewriting the host header to this route — see README.md."
      notes={[
        "Query: shops where subdomain == this value, then listings where shopId == that shop",
        "Sticky bottom cart bar reads carts/{uid}_{shopId}",
      ]}
    />
  );
}
