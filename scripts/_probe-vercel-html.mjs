const base = "https://motchis-house-of-beauty.vercel.app";
const res = await fetch(base + "/");
const html = await res.text();
console.log(JSON.stringify({
  status: res.status,
  len: html.length,
  hasGlobalError: html.includes("Something went wrong"),
  hasWeHitASnag: html.includes("We hit a snag"),
  hasNextFlight: html.includes("self.__next_f"),
  hasHero: html.includes("Salon services"),
  title: html.match(/<title[^>]*>([^<]*)</)?.[1] ?? null,
}, null, 2));

const scripts = [...html.matchAll(/src="(\/_next\/static\/[^"]+)"/g)].map((m) => m[1]);
console.log("script_count", scripts.length);
for (const s of scripts.slice(0, 5)) {
  const r = await fetch(base + s);
  console.log(s.slice(-50), r.status);
}
