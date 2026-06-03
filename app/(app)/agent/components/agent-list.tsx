"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  Search
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Agent {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  contact?: string | null;
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
    (agent.contact && agent.contact.includes(search))
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredAgents.map((agent, idx) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="cursor-pointer"
            onClick={() => router.push(`/agent/${agent.id}`)}
          >
            <Card className="relative overflow-visible p-0 min-w-75 rounded-[2.5rem] border-border bg-card shadow-sm hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 group">
              <div className="h-24 w-full bg-linear-to-br from-primary/10 to-indigo-500/5 rounded-t-[2.5rem] border-b border-border" />

              <div className="px-6 pb-8">
                <div className="relative -mt-12 mb-4 flex justify-between items-end">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-xl group-hover:scale-105 transition-transform duration-500">
                    <AvatarImage src={agent.image || ""} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary font-black text-xl">
                      {agent.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex gap-2 mb-2">
                    {agent.email && (
                      <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 bg-background shadow-sm border border-border text-primary hover:bg-primary/10">
                        <Mail size={18} />
                      </Button>
                    )}
                    {agent.contact && (
                      <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 bg-background shadow-sm border border-border text-emerald-500 hover:bg-emerald-500/10">
                        <Phone size={18} />
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors uppercase">
                    {agent.name}
                  </h3>
                  {agent.occupation && (
                    <p className="text-sm font-bold text-muted-foreground mt-0.5">
                      {agent.occupation}
                    </p>
                  )}
                </div>

                <div className="flex-1 mt-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Contact</p>
                  <p className="text-sm font-bold text-foreground mt-1 truncate">{agent.contact || "N/A"}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div >
  );
}
