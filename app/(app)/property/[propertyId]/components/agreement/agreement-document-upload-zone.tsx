"use client";

import { deletePropertyDocument, updatePropertyDocument } from "@/actions/file.actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
    ChevronDown,
    ChevronUp,
    Edit2,
    ExternalLink,
    Eye,
    FileText,
    Image as ImageIcon,
    MoreVertical,
    Trash2,
    Upload,
    X
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface UploadedFile {
    id?: string;
    fileName: string;
    relativePath: string;
    extension: string;
    documentType: "agreement";
    orderId: number;
    isPrivate: boolean;
    uploading?: boolean;
    progress?: number;
    preview?: string;
}

interface AgreementDocumentUploadZoneProps {
    propertyId: string;
    initialFiles?: UploadedFile[];
    onFilesChange: (files: UploadedFile[]) => void;
}

const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];

export function AgreementDocumentUploadZone({ propertyId, initialFiles = [], onFilesChange }: AgreementDocumentUploadZoneProps) {
    const [files, setFiles] = useState<UploadedFile[]>(initialFiles);
    const [editingFile, setEditingFile] = useState<{ index: number, name: string } | null>(null);
    const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setFiles(initialFiles);
    }, [initialFiles]);

    const handleFilesChange = useCallback((updated: UploadedFile[]) => {
        setFiles(updated);
        onFilesChange(updated);
    }, [onFilesChange]);

    const onDrop = async (e: React.DragEvent | React.ChangeEvent<HTMLInputElement>) => {
        let acceptedFiles: File[] = [];
        if ('dataTransfer' in e) {
            e.preventDefault();
            acceptedFiles = Array.from(e.dataTransfer.files);
        } else if (e.target instanceof HTMLInputElement && e.target.files) {
            acceptedFiles = Array.from(e.target.files);
        }

        if (acceptedFiles.length === 0) return;

        const newFiles = [...files];

        for (const file of acceptedFiles) {
            const ext = "." + file.name.split(".").pop()?.toLowerCase();

            if (!ALLOWED_EXTENSIONS.includes(ext)) {
                toast.error(`${file.name} is not a supported type. Please use PDF or Images.`);
                continue;
            }

            const isImage = file.type.startsWith("image/");
            const previewUrl = isImage ? URL.createObjectURL(file) : undefined;

            const tempFile: UploadedFile = {
                fileName: file.name,
                relativePath: "",
                extension: ext,
                documentType: "agreement",
                orderId: newFiles.length,
                isPrivate: false,
                uploading: true,
                progress: 0,
                preview: previewUrl
            };

            newFiles.push(tempFile);
            setFiles([...newFiles]);

            try {
                const formData = new FormData();
                formData.append("files", file);
                formData.append("propertyId", propertyId);

                const xhr = new XMLHttpRequest();
                xhr.open("POST", "/api/upload", true);

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percent = Math.round((event.loaded * 100) / event.total);
                        setFiles(prev => prev.map(f =>
                            (f.uploading && f.fileName === file.name) ? { ...f, progress: percent } : f
                        ));
                    }
                };

                xhr.onload = async () => {
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        const uploadedFile = response.files[0];

                        setFiles(prev => {
                            const updated = prev.map(f =>
                                (f.uploading && f.fileName === file.name)
                                    ? { ...f, ...uploadedFile, uploading: false, progress: 100 }
                                    : f
                            );
                            handleFilesChange(updated);
                            return updated;
                        });
                        toast.success(`${file.name} uploaded!`);
                    } else {
                        toast.error(`Failed to upload ${file.name}`);
                        setFiles(prev => prev.filter(f => !(f.uploading && f.fileName === file.name)));
                    }
                };

                xhr.onerror = () => {
                    toast.error(`Error uploading ${file.name}`);
                    setFiles(prev => prev.filter(f => !(f.uploading && f.fileName === file.name)));
                };

                xhr.send(formData);
            } catch (error) {
                toast.error(`Failed to upload ${file.name}`);
                setFiles(prev => prev.filter(f => !(f.uploading && f.fileName === file.name)));
            }
        }
    };

    const handleRemoveFile = async (index: number) => {
        const fileToRemove = files[index];
        if (!fileToRemove) return;

        if (fileToRemove.id) {
            try {
                await deletePropertyDocument(fileToRemove.id);
            } catch (err) {
                toast.error("Failed to delete document");
                return;
            }
        }

        const updated = files.filter((_, i) => i !== index);
        handleFilesChange(updated);
    };

    const handleRenameFile = async () => {
        if (!editingFile) return;
        const { index, name } = editingFile;
        const updated = [...files];
        const file = updated[index];

        const oldName = file.fileName;
        file.fileName = name;

        if (file.id) {
            try {
                await updatePropertyDocument(file.id, { fileName: name });
                toast.success("Document renamed");
            } catch (err) {
                file.fileName = oldName;
                toast.error("Failed to rename document");
                return;
            }
        }

        handleFilesChange(updated);
        setEditingFile(null);
    };

    const moveFile = (index: number, direction: number) => {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= files.length) return;

        const updated = [...files];
        const temp = updated[index];
        updated[index] = updated[newIndex];
        updated[newIndex] = temp;

        const reordered = updated.map((f, i) => ({ ...f, orderId: i }));
        handleFilesChange(reordered);
    };

    const getFileUrl = (file: UploadedFile) => {
        if (file.uploading) return file.preview || "";
        return `/api/files/${file.relativePath}`;
    };

    const handlePreview = (file: UploadedFile) => {
        if (file.extension.toLowerCase() === ".pdf") {
            window.open(getFileUrl(file), "_blank");
        } else {
            setPreviewFile(file);
        }
    };

    return (
        <div className="w-full space-y-6">
            <div
                className="border-2 border-dashed border-indigo-200 p-8 rounded-[2rem] bg-indigo-50/30 cursor-pointer flex flex-col items-center justify-center hover:bg-indigo-50/50 transition-all duration-300 group"
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    accept={ALLOWED_EXTENSIONS.join(",")}
                    onChange={onDrop}
                />
                <div className="bg-indigo-600/10 p-4 rounded-3xl mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-indigo-600" />
                </div>
                <span className="text-foreground font-black uppercase tracking-widest text-[10px]">Agreement Paperwork</span>
                <span className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-widest">DRAG & DROP PDF OR IMAGES</span>
            </div>

            <div className="grid grid-cols-1 gap-4 items-start">
                <AnimatePresence>
                    {files.sort((a, b) => a.orderId - b.orderId).map((file, index) => (
                        <motion.div
                            key={file.id || file.fileName + index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group"
                        >
                            <Card className="p-4 rounded-2xl flex items-center justify-start border-border group-hover:border-indigo-200 group-hover:shadow-xl group-hover:shadow-indigo-500/5 transition-all relative overflow-hidden bg-card/50 backdrop-blur-sm">
                                {file.uploading && (
                                    <div className="absolute bottom-0 left-0 h-1 bg-indigo-100 transition-all" style={{ width: `${file.progress}%` }}>
                                        <div className="h-full bg-indigo-600 animate-pulse" />
                                    </div>
                                )}
                                <div className="flex justify-start w-full gap-3 truncate">
                                    <div className="flex flex-col gap-1 mr-1">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-5 w-5 rounded-md hover:bg-indigo-50 text-muted-foreground/40 hover:text-indigo-600 transition-colors"
                                            disabled={index === 0}
                                            onClick={() => moveFile(index, -1)}
                                        >
                                            <ChevronUp size={12} />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-5 w-5 rounded-md hover:bg-indigo-50 text-muted-foreground/40 hover:text-indigo-600 transition-colors"
                                            disabled={index === files.length - 1}
                                            onClick={() => moveFile(index, 1)}
                                        >
                                            <ChevronDown size={12} />
                                        </Button>
                                    </div>
                                    <div className={cn(
                                        "p-2.5 rounded-xl border",
                                        file.extension.toLowerCase() === ".pdf" ? "bg-rose-50 text-rose-500 border-rose-100" : "bg-indigo-50 text-indigo-500 border-indigo-100"
                                    )}>
                                        {file.extension.toLowerCase() === ".pdf" ? <FileText size={20} /> : <ImageIcon size={20} />}
                                    </div>
                                    <div className="truncate">
                                        <p className="text-xs font-black text-foreground truncate uppercase tracking-tight">{file.fileName}</p>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none mt-1">{file.extension.replace(".", "")} Document</p>
                                    </div>
                                    <div className="flex flex-1 items-center justify-end gap-2">
                                        {file.uploading ? (
                                            <span className="text-[10px] font-black text-indigo-600">{file.progress}%</span>
                                        ) : (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger render={
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                                        <MoreVertical size={16} />
                                                    </Button>
                                                } />
                                                <DropdownMenuContent align="end" className="rounded-xl border-border">
                                                    <DropdownMenuItem onClick={() => handlePreview(file)} className="gap-2 cursor-pointer font-bold text-[10px] uppercase tracking-widest">
                                                        {file.extension.toLowerCase() === ".pdf" ? <ExternalLink size={14} /> : <Eye size={14} />}
                                                        {file.extension.toLowerCase() === ".pdf" ? "Open PDF" : "Preview"}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setEditingFile({ index, name: file.fileName })} className="gap-2 cursor-pointer font-bold text-[10px] uppercase tracking-widest text-indigo-600">
                                                        <Edit2 size={14} />
                                                        Rename
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleRemoveFile(index)} className="gap-2 cursor-pointer font-bold text-[10px] uppercase tracking-widest text-rose-600">
                                                        <Trash2 size={14} />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Rename Dialog */}
            <Dialog open={editingFile !== null} onOpenChange={() => setEditingFile(null)}>
                <DialogContent className="sm:max-w-106.25 rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight text-indigo-600">Edit Document Name</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">File Name</Label>
                        <Input
                            value={editingFile?.name || ""}
                            onChange={(e) => setEditingFile(prev => prev ? { ...prev, name: e.target.value } : null)}
                            className="mt-2 rounded-xl border-border bg-muted/20 font-bold"
                            onKeyDown={(e) => e.key === "Enter" && handleRenameFile()}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEditingFile(null)} className="rounded-xl font-bold uppercase tracking-widest text-[10px]">Cancel</Button>
                        <Button onClick={handleRenameFile} className="rounded-xl bg-indigo-600 text-white font-bold uppercase tracking-widest text-[10px]">Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Image Preview Modal */}
            <Dialog open={previewFile !== null} onOpenChange={() => setPreviewFile(null)}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden border-none bg-transparent shadow-none">
                    <div className="relative group">
                        <img
                            src={previewFile ? getFileUrl(previewFile) : ""}
                            alt="Preview"
                            className="w-full h-auto max-h-[85vh] object-contain rounded-[2rem]"
                        />
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); setPreviewFile(null); }}
                            className="absolute top-4 right-4 rounded-full bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/40 text-white"
                        >
                            <X size={20} />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

