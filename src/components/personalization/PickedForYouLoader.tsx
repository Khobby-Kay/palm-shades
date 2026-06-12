import { getCatalogProducts } from "@/lib/catalog";
import { PickedForYouSection } from "@/components/personalization/PickedForYouSection";

export async function PickedForYouLoader() {
  const products = await getCatalogProducts();
  return <PickedForYouSection products={products} />;
}
