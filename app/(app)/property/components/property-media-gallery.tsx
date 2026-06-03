"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X, PlayCircle, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn, getFileUrl } from "@/lib/utils";

interface MediaItem {
    id: string;
    fileName: string;
    relativePath: string;
    extension: string;
    documentType: string;
    isPrivate?: boolean;
}

interface PropertyMediaGalleryProps {
    items: MediaItem[];
}

export function PropertyMediaGallery({ items }: PropertyMediaGalleryProps) {
    const [current, setCurrent] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    if (!items || items.length === 0) {
        return (
            <div className="w-full h-80 bg-muted/30 rounded-[2.5rem] flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20">
                <PlayCircle className="text-muted-foreground/20 mb-4" size={48} />
                <span className="text-muted-foreground font-black uppercase tracking-widest text-xs">No media assets available</span>
            </div>
        );
    }

    const isVideo = (item: MediaItem) => item.extension.match(/(mp4|webm|ogg)$/i);
    const activeItem = items[current];

    const nextMedia = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrent((prev) => (prev + 1) % items.length);
    };

    const prevMedia = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrent((prev) => (prev - 1 + items.length) % items.length);
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = getFileUrl(activeItem.relativePath);
        link.download = activeItem.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-4">
            <div className={cn(
                "grid gap-4 rounded-[2.5rem] overflow-hidden",
                items.length > 1 ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"
            )}>
                {/* Main Display Area */}
                <div
                    className="relative aspect-video lg:col-span-2 rounded-[2.5rem] overflow-hidden bg-black group border border-border shadow-2xl cursor-pointer"
                    onClick={() => setIsLightboxOpen(true)}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeItem.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="w-full h-full flex items-center justify-center"
                        >
                            {isVideo(activeItem) ? (
                                <video
                                    src={getFileUrl(activeItem.relativePath)}
                                    className="w-full h-full object-contain"
                                    controls
                                    autoPlay={false}
                                    muted
                                />
                            ) : (
                                <img
                                    src={getFileUrl(activeItem.relativePath)}
                                    alt={activeItem.fileName}
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Top Badges */}
                    <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
                        <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full border border-white/10 tracking-widest uppercase">
                            {current + 1} / {items.length}
                        </span>
                        {activeItem.isPrivate && (
                            <span className="bg-destructive/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full border border-white/10 tracking-widest uppercase">
                                Private
                            </span>
                        )}
                    </div>

                    <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-6 right-6 z-10 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white border-white/10"
                        onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(true); }}
                    >
                        <Maximize2 size={20} />
                    </Button>

                    {/* Bottom Right Controls */}
                    {items.length > 1 && (
                        <div className="absolute bottom-6 right-6 z-10 flex gap-2">
                            <Button
                                variant="secondary"
                                size="icon"
                                className="bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white border-white/10 transition-all hover:scale-110"
                                onClick={prevMedia}
                            >
                                <ChevronLeft size={20} />
                            </Button>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white border-white/10 transition-all hover:scale-110"
                                onClick={nextMedia}
                            >
                                <ChevronRight size={20} />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Thumbnail Grid Area */}
                {items.length > 1 && (
                    <div className="relative grid grid-cols-2 grid-rows-2 gap-4 h-full">
                        {items.slice(0, 3).map((item, index) => (
                            <div
                                key={item.id}
                                className={cn(
                                    "relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300 group flex items-center justify-center",
                                    current === index
                                        ? "border-primary shadow-lg ring-4 ring-primary/20"
                                        : "border-transparent opacity-80 hover:opacity-100"
                                )}
                                onClick={() => setCurrent(index)}
                            >
                                {isVideo(item) ? (
                                    <div className="w-full h-full bg-black relative">
                                        <video src={getFileUrl(item.relativePath)} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <PlayCircle size={24} className="text-white" />
                                        </div>
                                    </div>
                                ) : (
                                    <img
                                        src={getFileUrl(item.relativePath)}
                                        alt={item.fileName}
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                )}
                                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors" />
                                {current === index && (
                                    <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full shadow-lg">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15 4 10.586a1 1 0 111.414-1.414L8.414 12.172l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Last Tile Logic */}
                        {items.length >= 4 && (
                            <div
                                className="relative rounded-3xl overflow-hidden border-2 border-transparent cursor-pointer group"
                                onClick={() => items.length > 4 ? setIsLightboxOpen(true) : setCurrent(3)}
                            >
                                {isVideo(items[3]) ? (
                                    <video src={getFileUrl(items[3].relativePath)} className="w-full h-full object-cover" />
                                ) : (
                                    <img src={getFileUrl(items[3].relativePath)} alt="More items" className="w-full h-full object-cover" />
                                )}
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white backdrop-blur-[2px] group-hover:bg-black/70 transition-all">
                                    {items.length > 4 ? (
                                        <>
                                            <span className="text-lg font-black tracking-tight">+{items.length - 3}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">More Media</span>
                                        </>
                                    ) : (
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Select</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Lightbox / Preview Modal - Premium Implementation */}
            <AnimatePresence>
                {isLightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-100 bg-black/98 flex flex-col backdrop-blur-xl overflow-hidden"
                    >
                        {/* Lightbox Header */}
                        <div className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-4">
                                <span className="bg-white/10 text-white text-[11px] font-black px-4 py-2 rounded-full border border-white/10 tracking-[0.2em] uppercase">
                                    {current + 1} / {items.length}
                                </span>
                                <h4 className="text-white/60 text-xs font-bold uppercase tracking-widest hidden sm:block">
                                    {activeItem.fileName}
                                </h4>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="rounded-full bg-white/10 hover:bg-white/20 text-white border-white/10"
                                    onClick={handleDownload}
                                >
                                    <Download size={20} />
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="rounded-full bg-white/10 hover:bg-white/20 text-white border-white/10"
                                    onClick={() => setIsLightboxOpen(false)}
                                >
                                    <X size={24} />
                                </Button>
                            </div>
                        </div>

                        {/* Large Preview */}
                        <div className="flex-1 relative group min-h-0 w-full flex items-center justify-center">
                            {/* Navigation Arrows */}
                            {items.length > 1 && (
                                <>
                                    <div className="absolute left-0 top-0 h-full w-24 md:w-32 flex items-center justify-start z-10">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="ml-4 md:ml-8 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/10 hover:bg-white/20 text-white"
                                            onClick={prevMedia}
                                        >
                                            <ChevronLeft size={32} />
                                        </Button>
                                    </div>
                                    <div className="absolute right-0 top-0 h-full w-24 md:w-32 flex items-center justify-end z-10">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="mr-4 md:mr-8 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/10 hover:bg-white/20 text-white"
                                            onClick={nextMedia}
                                        >
                                            <ChevronRight size={32} />
                                        </Button>
                                    </div>
                                </>
                            )}

                            <motion.div
                                key={`lightbox-${activeItem.id}`}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-full h-full flex items-center justify-center p-4"
                            >
                                {isVideo(activeItem) ? (
                                    <video
                                        src={getFileUrl(activeItem.relativePath)}
                                        className="max-w-full max-h-full object-contain shadow-2xl rounded-2xl"
                                        controls
                                        autoPlay
                                    />
                                ) : (
                                    <img
                                        src={getFileUrl(activeItem.relativePath)}
                                        className="max-w-full max-h-full object-contain shadow-2xl rounded-2xl select-none"
                                        alt={activeItem.fileName}
                                    />
                                )}
                            </motion.div>
                        </div>

                        {/* Lightbox Footer - Thumbnails Row (Carousel Effect) */}
                        <div className="p-6 bg-black/40 border-t border-white/5 relative group/thumbs">
                            <div
                                className="max-w-6xl mx-auto overflow-hidden relative"
                            >
                                <div
                                    className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory justify-start md:justify-center no-scrollbar"
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                >
                                    {items.map((item, index) => (
                                        <div
                                            key={`thumb-${item.id}`}
                                            data-index={index}
                                            className={cn(
                                                "relative shrink-0 w-20 h-14 md:w-28 md:h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-300 snap-center",
                                                current === index ? "border-primary scale-110 shadow-xl shadow-primary/40 z-10" : "border-white/10 opacity-30 hover:opacity-100 hover:scale-105"
                                            )}
                                            onClick={() => setCurrent(index)}
                                            ref={(el) => {
                                                if (el && current === index) {
                                                    el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                                                }
                                            }}
                                        >
                                            {isVideo(item) ? (
                                                <div className="w-full h-full bg-black relative">
                                                    <img
                                                        src={getFileUrl(item.relativePath)}
                                                        alt="Thumbnail"
                                                        className="w-full h-full object-cover opacity-60"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <PlayCircle size={20} className="text-white" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <img
                                                    src={getFileUrl(item.relativePath)}
                                                    alt="Thumbnail"
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
