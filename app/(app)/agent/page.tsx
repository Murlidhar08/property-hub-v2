import { getAgents } from "@/actions/user.actions";
import { AppHeader } from "@/components/app-header";
import { AddAgentButton } from "./components/add-agent-button";
import { AgentList } from "./components/agent-list";

export default async function AgentsPage() {
  const agents = await getAgents();

  return (
    <>
      <div className="min-h-screen bg-background pb-34">
        <AppHeader title={"Agents"} />

        <div className="mx-auto max-w-4xl mt-6 space-y-8 px-6">
          <AgentList initialAgents={agents as any} />
        </div>

        <AddAgentButton />
      </div>
    </>
  );
}
