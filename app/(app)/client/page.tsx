import { getClients } from "@/actions/user.actions";
import { ClientList } from "./components/client-list";
import { AddClientButton } from "./components/add-client-button";
import { AppHeader } from "@/components/app-header";
import { motion } from "framer-motion";
import { containerVariants } from "@/lib/animations";

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className="min-h-screen bg-background pb-34">
      <AppHeader title={"Clients"} />

      <div className="mx-auto max-w-4xl mt-6 space-y-8 px-6">
        <ClientList initialClients={clients as any} />
      </div>

      <AddClientButton />
    </div>
  );
}
