"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserCard } from "@/components/user/user-card";
import {
  Filter,
  Search
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Client {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  contact?: string | null;
  createdAt?: string | Date | null;
  occupation?: string | null;
  address?: string | null;
}

interface ClientListProps {
  initialClients: Client[];
}

export function ClientList({ initialClients }: ClientListProps) {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filteredClients = initialClients.filter(client =>
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.email.toLowerCase().includes(search.toLowerCase()) ||
    (client.contact && client.contact.includes(search))
  );

  return (
    <div className="space-y-8">
      {/* Search Header - Refined */}
      <div className="bg-white rounded-[1.5rem] p-4 shadow-sm flex flex-col sm:flex-row gap-4 border border-slate-100 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
          <Input
            placeholder="Search clients by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-12 bg-slate-50/50 border-slate-100 rounded-2xl focus-visible:ring-primary/10 transition-all font-bold text-sm placeholder:text-slate-400"
          />
        </div>
        <Button variant="outline" className="rounded-2xl h-12 px-6 font-black text-[10px] uppercase tracking-widest border-slate-100 bg-white hover:bg-slate-50 transition-all">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>

      {/* Client List - Premium Card Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredClients.length === 0 ? (
          <div className="col-span-full text-center py-20 font-bold text-slate-400 uppercase tracking-widest text-[10px] bg-white rounded-[2rem] border border-slate-100">
            No matching clients found.
          </div>
        ) : filteredClients.map((client, idx) => (
          <UserCard user={client} delay={idx} />
        ))}
      </div>
    </div>
  );
}
