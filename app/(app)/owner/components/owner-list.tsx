"use client";

import { Input } from "@/components/ui/input";
import { UserCard } from "@/components/user/user-card";
import {
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

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredOwners.map((owner, idx) => (
               <UserCard user={owner} delay={idx} />
            ))}
         </div>
      </div>
   );
}
