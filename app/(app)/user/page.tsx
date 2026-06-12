import { getAllUsers } from "@/actions/user.actions";
import { AppHeader } from "@/components/app-header";
import { AddUserButton } from "./components/add-user-button";
import { UserList } from "./components/user-list";

export default async function UsersPage() {
  const users = await getAllUsers();

  return (
    <>
      <div className="min-h-screen bg-background pb-34">
        <AppHeader title={"Users"} />

        <div className="mx-auto max-w-4xl mt-6 space-y-8 px-6">
          <UserList initialUsers={users as any} />
        </div>

        <AddUserButton />
      </div>
    </>
  );
}
