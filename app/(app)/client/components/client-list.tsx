"use client";

import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Mail,
  Phone,
  MoreVertical,
  Briefcase,
  MapPin,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredClients.length === 0 ? (
          <div className="col-span-full text-center py-20 font-bold text-slate-400 uppercase tracking-widest text-[10px] bg-white rounded-[2rem] border border-slate-100">
            No matching clients found.
          </div>
        ) : filteredClients.map((client, idx) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="group cursor-pointer"
            onClick={() => router.push(`/client/${client.id}`)}
          >
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 relative overflow-hidden flex flex-col sm:flex-row items-center gap-8">
                {/* Large Avatar Section */}
                <div className="relative shrink-0">
                    <Avatar className="h-32 w-32 rounded-full border border-slate-100 bg-slate-50 shadow-md ring-8 ring-slate-50/50 group-hover:scale-105 transition-transform duration-500">
                      <AvatarImage src={client.image || ""} className="object-cover" />
                      <AvatarFallback className="bg-slate-100 text-slate-400 font-black text-2xl uppercase">
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                </div>
                
                {/* Information Cluster */}
                <div className="flex-1 min-w-0 space-y-3 text-center sm:text-left">
                    <div className="mb-4">
                      <h3 className="text-2xl font-black text-slate-900 truncate tracking-tight leading-tight group-hover:text-primary transition-colors">
                        {client.name}
                      </h3>
                      <div className="flex items-center justify-center sm:justify-start text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-60">
                         <Clock size={12} className="mr-2" />
                         {client.createdAt ? formatDistanceToNow(new Date(client.createdAt), { addSuffix: true }) : "Recent Client"}
                      </div>
                    </div>
                    
                    <div className="space-y-2.5">
                       <div className="flex items-center justify-center sm:justify-start gap-4 text-slate-500 group-hover:text-slate-700 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100/50">
                            <Briefcase size={16} className="text-slate-400" />
                          </div>
                          <span className="text-sm font-bold truncate">{client.occupation || "No Occupation Specified"}</span>
                       </div>
                       
                       <div className="flex items-center justify-center sm:justify-start gap-4 text-slate-500 group-hover:text-slate-700 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100/50">
                            <Phone size={16} className="text-slate-400" />
                          </div>
                          <span className="text-sm font-bold truncate">{client.contact || "No Contact Number"}</span>
                       </div>
                       
                       <div className="flex items-center justify-center sm:justify-start gap-4 text-slate-500 group-hover:text-slate-700 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100/50">
                            <MapPin size={16} className="text-slate-400" />
                          </div>
                          <span className="text-sm font-bold truncate">{client.address || "No Address Provided"}</span>
                       </div>
                    </div>
                </div>

                {/* Corner Menu */}
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-slate-50">
                        <MoreVertical size={20} className="text-slate-300" />
                    </Button>
                </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
