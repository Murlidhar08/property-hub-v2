import { getOwners } from "@/actions/user.actions";
import { AddOwnerButton } from "./components/add-owner-button";
import { OwnerList } from "./components/owner-list";
import { AppHeader } from "@/components/app-header";

export default async function OwnersPage() {
  const owners = await getOwners();

  return (
    <div className="min-h-screen bg-background pb-34">
      <AppHeader title={"Owners"} />

      <div className="mx-auto max-w-4xl mt-6 space-y-8 px-6">
        <OwnerList initialOwners={owners as any} />
      </div>

      <AddOwnerButton />
    </div>
  );
}
