"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import { Upload, X, Trash2, GripVertical, FileText, Check, Eye, EyeOff, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { updatePropertyDocument, deletePropertyDocument } from "@/actions/file.actions";

interface UploadedFile {
    id?: string;
    fileName: string;
    relativePath: string;
    extension: string;
    documentType: "preview" | "document";
    orderId: number;
    isPrivate: boolean;
    uploading?: boolean;
    progress?: number;
}

interface PropertyDocumentUploadZoneProps {
    propertyId?: string;
    initialFiles?: UploadedFile[];
    onFilesChange: (files: UploadedFile[]) => void;
}

const ALLOWED_DOC_EXTENSIONS = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt"];

export function PropertyDocumentUploadZone({ propertyId, initialFiles = [], onFilesChange }: PropertyDocumentUploadZoneProps) {
    const [files, setFiles] = useState<UploadedFile[]>(initialFiles);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync state when initialFiles changes
    useEffect(() => {
        if (initialFiles && initialFiles.length > 0) {
            setFiles(initialFiles);
        }
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

        const newFiles: UploadedFile[] = [...files];

        for (const file of acceptedFiles) {
            const ext = "." + file.name.split(".").pop()?.toLowerCase();

            if (!ALLOWED_DOC_EXTENSIONS.includes(ext)) {
                toast.error(`${file.name} is not an allowed document type.`);
                continue;
            }

            // Create temp entry
            const tempId = Math.random().toString(36).substring(7);

            const tempFile: UploadedFile = {
                fileName: file.name,
                relativePath: "",
                extension: ext,
                documentType: "document",
                orderId: newFiles.length,
                isPrivate: false,
                uploading: true,
                progress: 0
            };

            newFiles.push(tempFile);
            setFiles([...newFiles]);

            // Perform upload
            try {
                const formData = new FormData();
                formData.append("files", file);
                if (propertyId) formData.append("propertyId", propertyId);

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

                        toast.success(`${file.name} uploaded successfully!`);
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
                console.error(error);
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
                console.error(err);
                toast.error("Failed to delete document from server");
                return;
            }
        }

        const updated = files.filter((_, i) => i !== index);
        handleFilesChange(updated);
    };

    const handlePrivacyToggle = async (index: number) => {
        const updated = [...files];
        updated[index].isPrivate = !updated[index].isPrivate;

        if (updated[index].id) {
            try {
                await updatePropertyDocument(updated[index].id!, { isPrivate: updated[index].isPrivate });
            } catch (err) {
                console.error(err);
                toast.error("Failed to update privacy");
                return;
            }
        }

        handleFilesChange(updated);
    };

    const moveFile = (index: number, direction: number) => {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= files.length) return;

        const updated = [...files];
        const temp = updated[index];
        updated[index] = updated[newIndex];
        updated[newIndex] = temp;

        // Update orderId
        const reordered = updated.map((f, i) => ({ ...f, orderId: i }));
        handleFilesChange(reordered);
    };

    return (
        <div className="w-full space-y-6">
            <div
                className="border-2 border-dashed border-muted-foreground/20 p-12 rounded-[2rem] bg-muted/5 cursor-pointer flex flex-col items-center justify-center hover:bg-muted/10 transition-all duration-300 group"
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    accept={ALLOWED_DOC_EXTENSIONS.join(",")}
                    onChange={onDrop}
                />
                <div className="bg-primary/10 p-4 rounded-3xl mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-primary" />
                </div>
                <span className="text-foreground font-bold">Drag & drop or click to upload documents</span>
                <span className="text-xs text-muted-foreground mt-2">Allowed: {ALLOWED_DOC_EXTENSIONS.join(", ").toUpperCase()}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                    {files.sort((a, b) => a.orderId - b.orderId).map((file, index) => (
                        <motion.div
                            key={file.id || file.fileName + index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="group"
                        >
                            <Card className="p-4 rounded-2xl flex items-center justify-between bg-muted/20 border-border group-hover:shadow-md transition-all relative overflow-hidden">
                                {file.uploading && (
                                    <div className="absolute bottom-0 left-0 h-1 bg-primary/20 transition-all" style={{ width: `${file.progress}%` }} />
                                )}
                                <div className="flex items-center gap-3 truncate">
                                    <GripVertical className="text-muted-foreground/40 shrink-0 cursor-move" size={16} />
                                    <div className="bg-primary/10 p-2 rounded-xl">
                                        <FileText className="text-primary" size={18} />
                                    </div>
                                    <div className="truncate">
                                        <p className="text-sm font-bold text-foreground truncate">{file.fileName}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase">{file.extension.replace(".", "")}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {!file.uploading && (
                                        <>
                                            <div className="flex flex-col gap-0.5 mr-2">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-5 w-5 rounded-md hover:bg-primary/10"
                                                    disabled={index === 0}
                                                    onClick={() => moveFile(index, -1)}
                                                >
                                                    <ChevronUp size={12} />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-5 w-5 rounded-md hover:bg-primary/10"
                                                    disabled={index === files.length - 1}
                                                    onClick={() => moveFile(index, 1)}
                                                >
                                                    <ChevronDown size={12} />
                                                </Button>
                                            </div>
                                            <div
                                                className="flex items-center gap-1 cursor-pointer"
                                                onClick={() => handlePrivacyToggle(index)}
                                            >
                                                {file.isPrivate ? <EyeOff size={14} className="text-primary" /> : <Eye size={14} className="text-primary/40" />}
                                                <span className="text-[11px] font-bold text-muted-foreground hidden sm:inline">Private</span>
                                                <Checkbox checked={file.isPrivate} className="w-4 h-4 rounded-md" />
                                            </div>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-50"
                                                onClick={() => handleRemoveFile(index)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </>
                                    )}
                                    {file.uploading && <span className="text-[10px] font-bold text-primary">{file.progress}%</span>}
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
