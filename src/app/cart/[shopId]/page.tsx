import { ScreenPlaceholder } from "@/components/screen-placeholder";

export default async function CartPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  const { shopId } = await params;
  return (
    <ScreenPlaceholder
      title="Cart"
      back={`/shop/${shopId}`}
      blurb="Bundles multiple items from ONE shop into a single chat request — no mixed-shop carts (mirrors food-delivery apps), and no real payment/checkout yet. Sending the cart opens (or reuses) a chat thread with the shop, attaching the item list."
      notes={["Reads/writes carts/{uid}_" + shopId]}
    />
  );
}
