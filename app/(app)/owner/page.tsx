import { getOwners } from "@/actions/user.actions";
import { AddOwnerButton } from "./components/add-owner-button";
import { OwnerList } from "./components/owner-list";

export default async function OwnersPage() {
  const owners = await getOwners();

  return (
    <div className="min-h-full bg-background p-4 sm:p-6 lg:p-8 space-y-8 max-w-(--breakpoint-2xl) mx-auto">
      <AddOwnerButton />

      <OwnerList initialOwners={owners as any} />
    </div>
  );
}
