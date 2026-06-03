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
        <DropdownMenu>
            <DropdownMenuTrigger render={
                <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal size={16} />
                </Button>
            } />
            <DropdownMenuContent align="start" className="rounded-xl min-w-32">
                <DropdownMenuItem onClick={handleRefresh} className="gap-2 cursor-pointer font-bold">
                    <RefreshCcw size={14} className="text-emerald-500" /> Refresh
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit} className="gap-2 cursor-pointer font-bold">
                    <Edit2 size={14} className="text-indigo-500" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="gap-2 text-destructive focus:text-destructive cursor-pointer font-bold">
                    <Trash2 size={14} /> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
