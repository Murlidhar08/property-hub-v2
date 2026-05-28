"use client";

import { useSession } from "@/lib/auth/auth-client";
import { tran } from "@/lib/languages/i18n";
import { LayoutDashboard, Settings, UserRoundCog } from "lucide-react";
import { TabItem } from "./tab-item";
import { UserRole } from "@/lib/generated/prisma/enums";

export const useNavItems = () => {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === UserRole.admin;

  const navItems: TabItem[] = [
    { id: "dashboard", label: tran("nav.dashboard"), icon: <LayoutDashboard size={20} />, href: "/dashboard" },
    { id: "settings", label: tran("nav.settings"), icon: <Settings size={20} />, href: "/settings" },
    ...(isAdmin ? [{ id: "admin", label: tran("nav.admin"), icon: <UserRoundCog size={20} />, href: "/admin" }] : []),
  ];

  return navItems;
};