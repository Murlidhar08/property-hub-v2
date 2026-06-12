"use client";

import { useSession } from "@/lib/auth/auth-client";
import { UserRole } from "@/lib/generated/prisma/enums";
import { tran } from "@/lib/languages/i18n";
import { Bookmark, Calculator, Grid3X3, LayoutDashboard, Mountain, Settings, UserRoundCog, Users } from "lucide-react";
import { TabItem } from "./tab-item";

export const useNavItems = () => {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === UserRole.admin;

  const navItems: TabItem[] = [
    { id: "dashboard", label: tran("nav.dashboard"), icon: <LayoutDashboard size={20} />, href: "/dashboard" },
    { id: "properties", label: tran("nav.properties"), icon: <Grid3X3 size={20} />, href: "/property" },
    { id: "requirements", label: tran("nav.requirements"), icon: <Bookmark size={20} />, href: "/requirement" },
    // { id: "clients", label: tran("nav.clients"), icon: <Users size={20} />, href: "/client" },
    // { id: "agents", label: tran("nav.agents"), icon: <GraduationCap size={20} />, href: "/agent" },
    { id: "users", label: tran("nav.users"), icon: <Users size={20} />, href: "/user" },
    // { id: "owners", label: tran("nav.owners"), icon: <UserCircle size={20} />, href: "/owner" },
    { id: "heat_map", label: tran("nav.heat_map"), icon: <Mountain size={20} />, href: "/heat-map" },
    { id: "tools", label: tran("nav.tools"), icon: <Calculator size={20} />, href: "/tool" },
    { id: "settings", label: tran("nav.settings"), icon: <Settings size={20} />, href: "/settings" },
    ...(isAdmin ? [{ id: "admin", label: tran("nav.admin"), icon: <UserRoundCog size={20} />, href: "/admin" }] : []),
  ];

  return navItems;
};