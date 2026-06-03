import { getAgents } from "@/actions/user.actions";
import { AddAgentButton } from "./components/add-agent-button";
import { AgentList } from "./components/agent-list";

export default async function AgentsPage() {
  const agents = await getAgents();

  return (
    <div className="min-h-full bg-background p-4 sm:p-6 lg:p-8 space-y-8 max-w-(--breakpoint-2xl) mx-auto">
      <AddAgentButton />

      <AgentList initialAgents={agents as any} />
    </div>
  );
}
