"use client";

import { deletePropertySharedLink } from "@/actions/property.actions";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { format, formatDistanceToNow } from "date-fns";
import { Copy, ExternalLink, Eye, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import EditLinkModal from "./edit-link-modal";
import PreviewLinkModal from "./preview-link-modal";

interface SharedLink {
    id: string;
    label: string | null;
    sharedBy: string;
    visitCount: number;
    createdAt: string;
    expiry: string | null;
    user: {
        name: string;
    };
    detail: any;
}

interface SharedListProps {
    links: SharedLink[];
}

export default function SharedList({ links }: SharedListProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [previewLink, setPreviewLink] = useState<SharedLink | null>(null);
    const [editLink, setEditLink] = useState<SharedLink | null>(null);

    const handleCopy = (id: string) => {
        const url = `${window.location.origin}/shared/${id}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
    };

    const handleDelete = async (id: string) => {
        setIsDeleting(id);
        try {
            await deletePropertySharedLink(id);
            toast.success("Shared link deleted successfully");
            router.refresh();
        } catch (error) {
            toast.error("Failed to delete shared link");
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider">Label</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider">Shared By</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider">Share Link</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider">Days Ago</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider">Date</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider">Visit Count</TableHead>
                            <TableHead className="font-bold text-[11px] uppercase tracking-wider text-right">Expiry Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {links.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground font-medium">
                                    No shared links found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            links.map((link) => (
                                <TableRow key={link.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger className="h-8 w-8 hover:bg-muted rounded-full flex items-center justify-center transition-colors outline-none">
                                                <MoreVertical size={16} />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start" className="w-48">
                                                <DropdownMenuItem onClick={() => handleCopy(link.id)} className="gap-2 cursor-pointer font-bold">
                                                    <Copy size={14} className="text-primary" /> Copy URL
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setPreviewLink(link)} className="gap-2 cursor-pointer font-bold">
                                                    <Eye size={14} className="text-secondary-foreground" /> Preview Access
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setEditLink(link)} className="gap-2 cursor-pointer font-bold">
                                                    <Pencil size={14} className="text-orange-500" /> Edit Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(link.id)}
                                                    className="gap-2 text-destructive focus:text-destructive cursor-pointer font-bold"
                                                    disabled={isDeleting === link.id}
                                                >
                                                    <Trash2 size={14} /> {isDeleting === link.id ? "Deleting..." : "Delete Link"}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                    <TableCell className="font-bold text-foreground">
                                        {link.label || "N/A"}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground font-medium">
                                        {link.user.name}
                                    </TableCell>
                                    <TableCell>
                                        <a
                                            href={`/shared/${link.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline font-bold flex items-center gap-1.5"
                                        >
                                            Open Link <ExternalLink size={12} />
                                        </a>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground font-semibold">
                                        {formatDistanceToNow(new Date(link.createdAt), { addSuffix: true })}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground font-mono text-[11px]">
                                        {format(new Date(link.createdAt), "yyyy-MM-dd HH:mm:ss")}
                                    </TableCell>
                                    <TableCell className="text-center font-black text-foreground">
                                        {link.visitCount}
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-muted-foreground">
                                        {link.expiry ? format(new Date(link.expiry), "PPP") : "No Expiry"}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <PreviewLinkModal
                open={!!previewLink}
                onOpenChange={(open) => !open && setPreviewLink(null)}
                link={previewLink}
            />

            <EditLinkModal
                open={!!editLink}
                onOpenChange={(open) => !open && setEditLink(null)}
                link={editLink}
            />
        </div>
    );
}
