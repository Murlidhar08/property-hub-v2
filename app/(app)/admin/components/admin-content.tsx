"use client";

import AppTabs from "@/components/tab/app-tabs";
import { tran } from "@/lib/languages/i18n";
import { useAdminUsers } from "@/tanstacks/admin";
import { Settings as SettingsIcon, Users } from "lucide-react";
import { AdminSkeleton } from "./admin-skeleton";
import { AdminStats } from "./admin-stats";
import { AppSettingsTab } from "./app-settings-tab";
import { UserList } from "./user-list";
import { UserRole } from "@/lib/generated/prisma/enums";
import { FooterButtons } from "@/components/footer-buttons";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AdminContent() {
    const { data: users, isLoading } = useAdminUsers();

    if (isLoading) {
        return <AdminSkeleton />;
    }

    if (!users) return null;

    const totalUsers = users.length;
    const adminUsers = users.filter((u: any) => u.role === UserRole.admin).length;
    const bannedUsers = users.filter((u: any) => u.banned).length;
    const activeUsers = totalUsers - bannedUsers;

    return (
        <div className="flex-1 px-4 pb-34 pt-6 max-w-7xl mx-auto w-full">
            <AppTabs
                defaultTab="user-management"
                tabs={[
                    {
                        id: "user-management",
                        label: tran("admin.user_mng.title"),
                        icon: <Users size={20} />,
                        content: (
                            <>
                                <AdminStats
                                    totalUsers={totalUsers}
                                    activeUsers={activeUsers}
                                    bannedUsers={bannedUsers}
                                    adminUsers={adminUsers}
                                />

                                <UserList />

                                <FooterButtons>
                                    <Link href={"/user/add" as any}>
                                        <Button className="rounded-full px-12 h-12 font-black shadow-lg shadow-primary/20">
                                            Add User
                                        </Button>
                                    </Link>
                                </FooterButtons>
                            </>
                        )
                    },
                    {
                        id: "application-settings",
                        hidden: true,
                        label: tran("admin.app_config.title"),
                        icon: <SettingsIcon size={20} />,
                        content: <AppSettingsTab />
                    }
                ]}
            />
        </div>
    );
}
