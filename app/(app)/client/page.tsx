import { getClients } from "@/actions/user.actions";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientList } from "./components/client-list";
import { AddClientButton } from "./components/add-client-button";

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className="min-h-full bg-background p-4 sm:p-6 lg:p-8 space-y-8 max-w-(--breakpoint-2xl) mx-auto">
      <AddClientButton />

      <ClientList initialClients={clients as any} />
    </div>
  );
}
