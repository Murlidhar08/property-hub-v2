import { getDashboardStats } from "@/actions/dashboard.actions";
import { AppHeader } from "@/components/app-header";
import { getUserSession } from "@/lib/auth/auth";
import { DashboardContent } from "./components/dashboard-content";

// Components
export default async function Page() {
  const session = await getUserSession();
  const data = await getDashboardStats();

  return (
    <>
      <AppHeader title="dashboard.title" />

      <div className="flex-1 px-4 space-y-6 sm:space-y-8 pb-34">
        <DashboardContent
          initialData={data}
          userName={session?.user?.name || "Admin"}
        />
      </div>
    </>
  );
}
