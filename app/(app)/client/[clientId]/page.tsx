import { getUserDetails } from "@/actions/user.actions";
import { UserDetailView } from "@/components/user/user-detail-view";
import { notFound } from "next/navigation";

interface ClientPageProps {
  params: Promise<{ clientId: string }>;
}

export default async function ClientDetailPage({ params }: ClientPageProps) {
  const { clientId } = await params;
  const user = await getUserDetails(clientId);

  if (!user) {
    notFound();
  }

  return <UserDetailView user={user} role="client" />;
}
