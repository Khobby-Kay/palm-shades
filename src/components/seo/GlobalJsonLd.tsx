import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema } from "@/lib/seo";

/** Site-wide structured data on every public page. */
export function GlobalJsonLd() {
  return <JsonLd data={[organizationSchema(), websiteSchema()]} />;
}
