import type { Metadata } from "next";
import { requireUser } from "@/lib/account";
import { prisma } from "@/lib/prisma";
import { ChildProfilesManager } from "@/components/account/ChildProfilesManager";

export const metadata: Metadata = { title: "Guest Profiles" };

export default async function AccountChildrenPage() {
  const user = await requireUser("/account/children");

  const children = await prisma.childProfile.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <header>
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary-700">
          Saved profiles
        </p>
        <h1 className="mt-2 font-display text-display-md text-charcoal">Guest profiles</h1>
        <p className="mt-3 text-sm text-charcoal-light">
          Save names, hair types and preferences for anyone you book on behalf of — so future
          appointments take just a few taps.
        </p>
      </header>

      <div className="mt-10">
        <ChildProfilesManager initial={children} />
      </div>
    </div>
  );
}
