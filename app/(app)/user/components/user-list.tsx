"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { UserCard } from "@/components/user/user-card";
import {
  Filter,
  Search
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { tran } from "@/lib/languages/i18n";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  contactNo?: string | null;
  occupation?: string | null;
  role?: string;
  userRoleMappings?: { roleType: string }[];
}

interface UserListProps {
  initialUsers: User[];
}

export function UserList({ initialUsers }: UserListProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "agent" | "client" | "owner">("all");

  const filteredUsers = initialUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      (user.contactNo && user.contactNo.includes(search));

    const matchesType = filterType === "all" ||
      user.role === "admin" ||
      user.userRoleMappings?.some(mapping => mapping.roleType === filterType);

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8">
      <div className="bg-card rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 border border-border items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 w-full max-w-lg group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
          <Input
            placeholder="Search users by name, email, or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-11 bg-background border-border rounded-xl focus-visible:ring-primary/10 transition-all font-medium"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" className="w-full sm:w-auto h-11 rounded-2xl gap-2 px-5 border-2 border-blue-500/10 bg-background hover:bg-blue-500/5 hover:border-blue-500/20 shadow-sm text-xs font-bold text-blue-600 transition-all">
                  <Filter className="h-4 w-4" />
                  {filterType === "all" ? tran("admin.user_mng.all_users") : filterType === "agent" ? "Agents" : filterType === "client" ? "Clients" : "Owners"}
                </Button>
              }
            />
            <DropdownMenuContent className="rounded-2xl w-48 p-2 border-2 border-blue-500/5 bg-background shadow-lg">
              <DropdownMenuItem onClick={() => setFilterType("all")} className="rounded-xl font-bold cursor-pointer hover:bg-blue-500/5">
                {tran("admin.user_mng.all_users")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("agent")} className="rounded-xl font-bold text-blue-600 cursor-pointer hover:bg-blue-500/5">
                Agents
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("client")} className="rounded-xl font-bold text-purple-600 cursor-pointer hover:bg-blue-500/5">
                Clients
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType("owner")} className="rounded-xl font-bold text-amber-600 cursor-pointer hover:bg-blue-500/5">
                Owners
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredUsers.map((user, idx) => (
          <UserCard key={user.id} user={user} delay={idx} />
        ))}
      </div>
    </div >
  );
}
