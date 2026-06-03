"use client";

import { deletePropertyDocument, renamePropertyDocument } from "@/actions/file.actions";
import { getPropertyById } from "@/actions/property.actions";
import { DocumentPreview } from "@/components/document-preview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { getFileUrl } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Eye, FileText, Image as ImageIcon, Maximize2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DocumentTabProps {
    propertyId: string;
}

export default function DocumentTab({ propertyId }: DocumentTabProps) {
    const queryClient = useQueryClient();
    const [previewDoc, setPreviewDoc] = useState<any>(null);
    const [renameDoc, setRenameDoc] = useState<any>(null);
    const [newName, setNewName] = useState("");

    const { data: property, isLoading } = useQuery({
        queryKey: ["property", propertyId],
        queryFn: () => getPropertyById(propertyId)
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deletePropertyDocument(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
            toast.success("Document deleted successfully");
        },
        onError: () => toast.error("Failed to delete document")
    });

    const renameMutation = useMutation({
        mutationFn: ({ id, name }: { id: string, name: string }) => renamePropertyDocument(id, name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
            toast.success("Document renamed successfully");
            setRenameDoc(null);
            setNewName("");
        },
        onError: () => toast.error("Failed to rename document")
    });

    const handleRenameClick = (doc: any) => {
        setRenameDoc(doc);
        setNewName(doc.fileName);
    };

    if (isLoading) return <div className="p-8 text-center text-muted-foreground font-bold animate-pulse">Loading documents...</div>;
    if (!property) return <div className="p-8 text-center text-destructive font-black">Property not found.</div>;

    const documents = (property.documents || []).filter((d: any) => d.documentType === "document");

    const handleDownload = (doc: any) => {
        const link = document.createElement('a');
        link.href = getFileUrl(doc.relativePath);
        link.download = doc.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                    <FileText className="text-primary" />
                    Property Documents
                </h3>
                <span className="text-xs font-black text-muted-foreground uppercase tracking-widest bg-muted px-3 py-1 rounded-full">
                    {documents.length} Total
                </span>
            </div>

            {documents.length === 0 ? (
                <Card className="p-16 rounded-[3rem] border-2 border-dashed border-border/60 flex flex-col items-center justify-center bg-muted/5 transition-all hover:bg-muted/10">
                    <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center mb-4">
                        <FileText size={32} className="text-muted-foreground/30" />
                    </div>
                    <p className="text-muted-foreground font-black text-sm uppercase tracking-tighter">No documents uploaded</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents.map((doc: any) => (
                        <Card key={doc.id} className="p-5 rounded-[2rem] border-border bg-card hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                                    {doc.extension.match(/(jpg|jpeg|png|gif|webp)$/i) ? (
                                        <ImageIcon className="text-primary" size={28} />
                                    ) : (
                                        <FileText className="text-primary" size={28} />
                                    )}
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger render={
                                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreVertical size={18} />
                                        </Button>
                                    } />
                                    <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-40 shadow-2xl border-border">
                                        <DropdownMenuItem onClick={() => setPreviewDoc(doc)} className="rounded-xl flex items-center gap-2 py-2.5 font-bold cursor-pointer">
                                            <Maximize2 size={16} /> Preview
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDownload(doc)} className="rounded-xl flex items-center gap-2 py-2.5 font-bold cursor-pointer">
                                            <Download size={16} /> Download
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleRenameClick(doc)} className="rounded-xl flex items-center gap-2 py-2.5 font-bold cursor-pointer">
                                            <Pencil size={16} /> Rename
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => deleteMutation.mutate(doc.id)}
                                            className="rounded-xl flex items-center gap-2 py-2.5 font-bold cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                                        >
                                            <Trash2 size={16} /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="min-w-0 mb-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-black text-foreground truncate">{doc.fileName}</p>
                                    {doc.isPrivate && (
                                        <span className="bg-primary/10 text-primary text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shrink-0">Private</span>
                                    )}
                                </div>
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{doc.extension.replace(".", "")} File</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-auto">
                                <Button
                                    variant="outline"
                                    className="rounded-xl h-9 text-xs font-black uppercase tracking-widest hover:bg-primary/5 hover:text-primary border-border"
                                    onClick={() => setPreviewDoc(doc)}
                                >
                                    <Eye size={14} className="mr-2" /> Preview
                                </Button>
                                <Button
                                    variant="outline"
                                    className="rounded-xl h-9 text-xs font-black uppercase tracking-widest hover:bg-primary/5 hover:text-primary border-border"
                                    onClick={() => handleDownload(doc)}
                                >
                                    <Download size={14} className="mr-2" /> Get
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Premium Document Preview */}
            <DocumentPreview
                isOpen={!!previewDoc}
                onClose={() => setPreviewDoc(null)}
                url={previewDoc ? getFileUrl(previewDoc.relativePath) : ""}
                fileName={previewDoc?.fileName || "document"}
                fileExtension={previewDoc?.extension}
            />

            {/* Rename Dialog */}
            <Dialog open={!!renameDoc} onOpenChange={(open) => !open && setRenameDoc(null)}>
                <DialogContent className="max-w-md p-8 rounded-[2rem] border-border bg-card shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">Rename Document</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 mt-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Document Name</label>
                            <Input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="h-12 rounded-xl border-border bg-muted/20 font-bold px-4 focus:ring-primary"
                                placeholder="Enter new name..."
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button variant="ghost" className="flex-1 rounded-xl h-12 font-bold" onClick={() => setRenameDoc(null)}>Cancel</Button>
                            <Button
                                className="flex-1 rounded-xl h-12 font-black shadow-lg shadow-primary/20"
                                onClick={() => renameMutation.mutate({ id: renameDoc.id, name: newName })}
                            >
                                {renameMutation.isPending ? "Renaming..." : "Save Name"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
