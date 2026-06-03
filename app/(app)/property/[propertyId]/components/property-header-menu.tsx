"use client";

import { deleteProperty } from "@/actions/property.actions";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    MoreHorizontal,
    Pencil,
    Printer,
    RefreshCw,
    Trash2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface PropertyHeaderMenuProps {
    propertyId: string;
}

export function PropertyHeaderMenu({ propertyId }: PropertyHeaderMenuProps) {
    const router = useRouter();

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this property?")) {
            try {
                await deleteProperty(propertyId);
                toast.success("Property deleted successfully");
                router.push("/property");
            } catch (error) {
                console.error(error);
                toast.error("Failed to delete property");
            }
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full hover:bg-muted">
                    <MoreHorizontal size={20} />
                </Button>
            } />
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-border bg-card/95 backdrop-blur-md">
                <DropdownMenuItem className="rounded-xl gap-3 py-2.5 focus:bg-primary/10 focus:text-primary cursor-pointer transition-colors" onClick={() => window.location.reload()}>
                    <RefreshCw size={18} className="text-blue-500" />
                    <span className="font-bold text-sm">Refresh</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl gap-3 py-2.5 focus:bg-primary/10 focus:text-primary cursor-pointer transition-colors" onClick={() => window.print()}>
                    <Printer size={18} className="text-rose-500" />
                    <span className="font-bold text-sm">Print</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="rounded-xl gap-3 py-2.5 focus:bg-primary/10 focus:text-primary cursor-pointer transition-colors" onClick={() => router.push(`/property/${propertyId}/edit` as any)}>
                    <Pencil size={18} className="text-blue-600" />
                    <span className="font-bold text-sm">Edit</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-2 bg-border/50" />

                <DropdownMenuItem className="rounded-xl gap-3 py-2.5 focus:bg-destructive/10 text-destructive focus:text-destructive cursor-pointer transition-colors" onClick={handleDelete}>
                    <Trash2 size={18} />
                    <span className="font-bold text-sm">Delete</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
