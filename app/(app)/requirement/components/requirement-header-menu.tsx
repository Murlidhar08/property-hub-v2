"use client";

import {
    MoreHorizontal,
    RefreshCw,
    Pencil,
    Trash2
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteRequirement } from "@/actions/requirement.actions";

interface RequirementHeaderMenuProps {
    requirementId: string;
}

export function RequirementHeaderMenu({ requirementId }: RequirementHeaderMenuProps) {
    const router = useRouter();

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this requirement?")) {
            try {
                await deleteRequirement(requirementId);
                toast.success("Requirement deleted successfully");
                window.location.reload();
            } catch (error) {
                console.error(error);
                toast.error("Failed to delete requirement");
            }
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100" onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}>
                    <MoreHorizontal size={18} className="text-slate-400" />
                </Button>
            } />
            <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 shadow-2xl border-slate-100 bg-white/95 backdrop-blur-md">
                <DropdownMenuItem 
                    className="rounded-xl gap-3 py-2.5 focus:bg-primary/10 focus:text-primary cursor-pointer transition-colors" 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.reload();
                    }}
                >
                    <RefreshCw size={16} className="text-blue-500" />
                    <span className="font-bold text-sm">Refresh</span>
                </DropdownMenuItem>

                <DropdownMenuItem 
                    className="rounded-xl gap-3 py-2.5 focus:bg-primary/10 focus:text-primary cursor-pointer transition-colors" 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        router.push(`/requirement/${requirementId}/edit` as any);
                    }}
                >
                    <Pencil size={16} className="text-indigo-600" />
                    <span className="font-bold text-sm">Edit</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-2 bg-slate-100" />

                <DropdownMenuItem 
                    className="rounded-xl gap-3 py-2.5 focus:bg-destructive/10 text-destructive focus:text-destructive cursor-pointer transition-colors" 
                    onClick={handleDelete}
                >
                    <Trash2 size={16} />
                    <span className="font-bold text-sm">Delete</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
