import { getUserDetails } from "@/actions/user.actions";
import { UserDetailView } from "@/components/user/user-detail-view";
import { notFound } from "next/navigation";

interface AgentPageProps {
  params: Promise<{ agentId: string }>;
}

export default async function AgentDetailPage({ params }: AgentPageProps) {
  const { agentId } = await params;
  const user = await getUserDetails(agentId);

  if (!user) {
    notFound();
  }

  return <UserDetailView user={user} role="agent" />;
}
