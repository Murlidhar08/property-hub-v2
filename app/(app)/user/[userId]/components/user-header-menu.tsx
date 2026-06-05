"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UserHeaderMenuProps {
    userId: string;
}

export function UserHeaderMenu({ userId }: UserHeaderMenuProps) {
    const router = useRouter();

    const handleRefresh = () => {
        router.refresh();
        toast.success("User data refreshed");
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={
                <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 bg-muted/40 hover:bg-muted border border-border/50 transition-all">
                    <MoreVertical size={20} />
                </Button>
            } />
            <DropdownMenuContent align="end" className="rounded-2xl min-w-40 p-2 bg-card/95 backdrop-blur-md shadow-xl border-border/50">
                <DropdownMenuItem
                    onClick={handleRefresh}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-primary/5 text-sm font-bold transition-colors"
                >
                    <RefreshCcw size={16} className="text-emerald-500" />
                    Refresh
                </DropdownMenuItem>
                <Link href={`/user/${userId}/edit` as any}>
                    <DropdownMenuItem className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-primary/5 text-sm font-bold transition-colors">
                        <Pencil size={16} className="text-indigo-500" />
                        Edit
                    </DropdownMenuItem>
                </Link>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
