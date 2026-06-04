"use client";

import { deleteRequirement } from "@/actions/requirement.actions";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/components/providers/confirm-provider";
import { Edit2, MoreHorizontal, RefreshCcw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BackHeader } from "@/components/back-header";

interface RequirementActionsProps {
    requirementId: string;
}

export function RequirementActions({ requirementId }: RequirementActionsProps) {
    const router = useRouter();
    const confirm = useConfirm();

    const handleRefresh = () => {
        router.refresh();
        toast.success("Page Refreshed");
    };

    const handleEdit = () => {
        router.push(`/requirement/${requirementId}/edit` as any);
    };

    const handleDelete = async () => {
        const ok = await confirm({
            title: "Delete Requirement",
            description: "Are you sure you want to delete this requirement? This action cannot be undone.",
        });

        if (ok) {
            try {
                await deleteRequirement(requirementId);
                toast.success("Requirement deleted");
                router.push("/requirement");
                router.refresh();
            } catch (error) {
                toast.error("Failed to delete requirement");
            }
        }
    };

    return (
        <BackHeader
            title={"Requirement Details"}
            menuItems={[
                {
                    label: "Refresh",
                    icon: <RefreshCcw size={14} className="text-emerald-500" />,
                    onClick: handleRefresh
                },
                {
                    label: "Edit",
                    icon: <Edit2 size={14} className="text-indigo-500" />,
                    onClick: handleEdit
                },
                {
                    label: "Delete",
                    icon: <Trash2 size={14} />,
                    onClick: handleDelete,
                    destructive: true,
                }
            ]}
        />
    );
}
