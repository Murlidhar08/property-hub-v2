import { AppHeader } from "@/components/app-header";
import { getUserSession } from "@/lib/auth/auth";
import { tran } from "@/lib/languages/i18n";

import { DashboardContent } from "./components/dashboard-content";
import { getDashboardStats } from "@/actions/dashboard.actions";

// Components
export default async function Page() {
  const session = await getUserSession();
  const data = await getDashboardStats();

  return (
    <>
      <AppHeader title={tran("dashboard.title")} />

      <DashboardContent
        initialData={data}
        userName={session?.user?.name || "Admin"}
      />
    </>
  );
}
