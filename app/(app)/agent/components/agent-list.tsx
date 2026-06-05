"use client";

import { Input } from "@/components/ui/input";
import {
  Search
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserCard } from "./user-card";

interface Agent {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  contactNo?: string | null;
  occupation?: string | null;
}

interface AgentListProps {
  initialAgents: Agent[];
}

export function AgentList({ initialAgents }: AgentListProps) {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filteredAgents = initialAgents.filter(agent =>
    agent.name.toLowerCase().includes(search.toLowerCase()) ||
    agent.email.toLowerCase().includes(search.toLowerCase()) ||
    (agent.contactNo && agent.contactNo.includes(search))
  );

  return (
    <div className="space-y-8">
      <div className="bg-card rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 border border-border items-center justify-between">
        <div className="relative flex-1 w-full max-w-lg group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
          <Input
            placeholder="Search agents by name, specialty, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-11 bg-background border-border rounded-xl focus-visible:ring-primary/10 transition-all font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredAgents.map((agent, idx) => (
          <UserCard user={agent} delay={idx} />
        ))}
      </div>
    </div >
  );
}
