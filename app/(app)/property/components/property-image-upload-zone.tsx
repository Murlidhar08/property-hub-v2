"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import { Upload, X, Trash2, GripVertical, PlayCircle, Eye, EyeOff, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { updatePropertyDocument, deletePropertyDocument } from "@/actions/file.actions";

interface UploadedFile {
    id?: string;
    fileName: string;
    relativePath: string;
    extension: string;
    documentType: "preview" | "document";
    orderId: number;
    isPrivate: boolean;
    preview?: string; // For client-side preview before final save
    uploading?: boolean;
    progress?: number;
}

interface PropertyImageUploadZoneProps {
    propertyId?: string;
    initialFiles?: UploadedFile[];
    onFilesChange: (files: UploadedFile[]) => void;
}

const MAX_VIDEO_SIZE_MB = 10;

export function PropertyImageUploadZone({ propertyId, initialFiles = [], onFilesChange }: PropertyImageUploadZoneProps) {
    const [files, setFiles] = useState<UploadedFile[]>(initialFiles);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync state when initialFiles changes (e.g., during edit)
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
            const isVideo = file.type.startsWith("video/");
            const isImage = file.type.startsWith("image/");

            if (!isVideo && !isImage) {
                toast.error(`${file.name} is not a valid image/video file.`);
                continue;
            }

            if (isVideo && file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
                toast.error(`Video "${file.name}" exceeds the ${MAX_VIDEO_SIZE_MB}MB limit.`);
                continue;
            }

            // Create temp entry
            const tempId = Math.random().toString(36).substring(7);
            const previewUrl = URL.createObjectURL(file);
            
            const tempFile: UploadedFile = {
                fileName: file.name,
                relativePath: "", // To be filled after upload
                extension: file.name.split(".").pop() || "",
                documentType: "preview",
                orderId: newFiles.length,
                isPrivate: false,
                preview: previewUrl,
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
                            f.preview === previewUrl ? { ...f, progress: percent } : f
                        ));
                    }
                };

                xhr.onload = async () => {
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        const uploadedFile = response.files[0];
                        
                        setFiles(prev => {
                            const updated = prev.map(f => 
                                f.preview === previewUrl 
                                    ? { ...f, ...uploadedFile, uploading: false, progress: 100 } 
                                    : f
                            );
                            handleFilesChange(updated);
                            return updated;
                        });

                        toast.success(`${file.name} uploaded successfully!`);
                    } else {
                        toast.error(`Failed to upload ${file.name}`);
                        setFiles(prev => prev.filter(f => f.preview !== previewUrl));
                    }
                };

                xhr.onerror = () => {
                    toast.error(`Error uploading ${file.name}`);
                    setFiles(prev => prev.filter(f => f.preview !== previewUrl));
                };

                xhr.send(formData);
            } catch (error) {
                console.error(error);
                toast.error(`Failed to upload ${file.name}`);
                setFiles(prev => prev.filter(f => f.preview !== previewUrl));
            }
        }
    };

    const handleRemoveFile = async (index: number) => {
        const fileToRemove = files[index];
        if (!fileToRemove) return;

        if (fileToRemove.id) {
            // Delete from database
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
        
        if (fileToRemove.preview) {
            URL.revokeObjectURL(fileToRemove.preview);
        }
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

    const getFileUrl = (file: UploadedFile) => {
        if (file.uploading) return file.preview;
        return `/api/files/${file.relativePath}`;
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
                    accept="image/*,video/*"
                    onChange={onDrop}
                />
                <div className="bg-primary/10 p-4 rounded-3xl mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-primary" />
                </div>
                <span className="text-foreground font-bold">Drag & drop or click to upload images/videos</span>
                <span className="text-xs text-muted-foreground mt-2">Max video size: {MAX_VIDEO_SIZE_MB}MB</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <AnimatePresence>
                    {files.sort((a, b) => a.orderId - b.orderId).map((file, index) => (
                        <motion.div
                            key={file.id || file.preview || index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative aspect-video rounded-2xl overflow-hidden border border-border bg-muted group shadow-sm hover:shadow-md transition-all"
                        >
                            {file.extension.match(/(mp4|webm|ogg)$/i) ? (
                                <div className="w-full h-full relative bg-black/10 flex items-center justify-center">
                                    <PlayCircle className="text-white z-10" size={32} />
                                    <video src={getFileUrl(file)} className="w-full h-full object-cover" muted />
                                </div>
                            ) : (
                                <img src={getFileUrl(file)} alt={file.fileName} className="w-full h-full object-cover" />
                            )}

                            {/* Uploading Overlay */}
                            {file.uploading && (
                                <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center p-4 z-20">
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 overflow-hidden mb-2">
                                        <div className="bg-primary h-full transition-all duration-300" style={{ width: `${file.progress}%` }} />
                                    </div>
                                    <span className="text-[10px] font-bold text-muted-foreground">{file.progress}%</span>
                                </div>
                            )}

                            {/* Controls */}
                            {!file.uploading && (
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between z-30">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col gap-1 bg-white/90 backdrop-blur-md p-1 rounded-full cursor-pointer hover:bg-white transition">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-5 w-5 rounded-full"
                                                disabled={index === 0}
                                                onClick={(e) => { e.stopPropagation(); moveFile(index, -1); }}
                                            >
                                                <ChevronUp size={10} />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-5 w-5 rounded-full"
                                                disabled={index === files.length - 1}
                                                onClick={(e) => { e.stopPropagation(); moveFile(index, 1); }}
                                            >
                                                <ChevronDown size={10} />
                                            </Button>
                                        </div>
                                        <div 
                                            className="flex items-center gap-1 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full cursor-pointer hover:bg-white transition"
                                            onClick={(e) => { e.stopPropagation(); handlePrivacyToggle(index); }}
                                        >
                                            {file.isPrivate ? <EyeOff size={12} className="text-primary" /> : <Eye size={12} className="text-primary" />}
                                            <span className="text-[10px] font-bold text-foreground">Private</span>
                                            <Checkbox checked={file.isPrivate} className="w-3 h-3 rounded-sm ml-1" />
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            className="h-7 w-7 rounded-full bg-red-500 hover:bg-red-600 shadow-lg"
                                            onClick={(e) => { e.stopPropagation(); handleRemoveFile(index); }}
                                        >
                                            <Trash2 size={12} />
                                        </Button>
                                    </div>
                                    <div className="bg-black/40 backdrop-blur-md p-1 px-2 rounded-lg truncate">
                                        <p className="text-[10px] text-white font-medium truncate">{file.fileName}</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
