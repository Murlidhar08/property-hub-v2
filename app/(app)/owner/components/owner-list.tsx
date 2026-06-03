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

interface Owner {
   id: string;
   name: string;
   email: string;
   image?: string | null;
   contact?: string | null;
}

interface OwnerListProps {
   initialOwners: Owner[];
}

export function OwnerList({ initialOwners }: OwnerListProps) {
   const [search, setSearch] = useState("");
   const router = useRouter();

   const filteredOwners = initialOwners.filter(owner =>
      owner.name.toLowerCase().includes(search.toLowerCase()) ||
      owner.email.toLowerCase().includes(search.toLowerCase()) ||
      (owner.contact && owner.contact.includes(search))
   );

   return (
      <div className="space-y-8">
         <div className="bg-card rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 border border-border items-center">
            <div className="relative flex-1 w-full group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
               <Input
                  placeholder="Search owners by name or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-11 h-11 bg-background border-border rounded-xl focus-visible:ring-primary/10 transition-all font-medium"
               />
            </div>
         </div>

         <div className="grid grid-cols-1 gap-4 pb-12">
            {filteredOwners.map((owner, idx) => (
               <motion.div
                  key={owner.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="cursor-pointer"
                  onClick={() => router.push(`/owner/${owner.id}`)}
               >
                  <Card className="p-5 sm:p-6 rounded-[2rem] border-border bg-card shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all group">
                     <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className="flex items-center gap-4 flex-1">
                           <Avatar className="h-14 w-14 border-2 border-background shadow-md">
                              <AvatarImage src={owner.image || ""} />
                              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                 {owner.name.charAt(0)}
                              </AvatarFallback>
                           </Avatar>
                           <div>
                              <div className="flex items-center gap-2">
                                 <h3 className="text-lg font-black text-foreground tracking-tight group-hover:text-primary transition-colors">{owner.name}</h3>
                              </div>
                              <p className="text-xs font-bold text-muted-foreground mt-0.5 tracking-widest">{owner.email}</p>
                           </div>
                        </div>

                        <div className="flex items-center gap-2 border-t md:border-t-0 border-border pt-4 md:pt-0">
                           {owner.email && (
                              <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 hover:bg-accent text-primary">
                                 <Mail size={18} />
                              </Button>
                           )}
                           {owner.contact && (
                              <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 hover:bg-emerald-500/10 text-emerald-500">
                                 <Phone size={18} />
                              </Button>
                           )}
                           <Button variant="outline" className="rounded-xl font-bold text-[10px] uppercase tracking-widest h-10 px-6 border-border">
                              View Folio
                           </Button>
                        </div>
                     </div>
                  </Card>
               </motion.div>
            ))}
         </div>
      </div>
   );
}
