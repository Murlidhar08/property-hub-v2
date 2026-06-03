"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ShieldAlert, FileSearch, Image as ImageIcon, MapPin, User, Tag, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface PreviewLinkModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    link: any;
}

export default function PreviewLinkModal({ open, onOpenChange, link }: PreviewLinkModalProps) {
    if (!link) return null;

    const detail = link.detail || {};
    
    const generalDetails = [
        { label: "Price", active: !!detail.price, icon: Tag },
        { label: "Agent", active: !!detail.agent, icon: User },
        { label: "Owner", active: !!detail.owner, icon: User },
        { label: "Description", active: detail.description !== false, icon: Info },
        { label: "Location", active: !!detail.location, icon: MapPin },
    ];

    const privateDetails = [
        { label: "Private Images", active: !!detail.privateImages, icon: ImageIcon },
        { label: "Private Docs", active: !!detail.privateDocs, icon: FileSearch },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <FileSearch className="text-primary" size={20} />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold uppercase tracking-tight">Link Permissions</DialogTitle>
                            <p className="text-xs text-muted-foreground font-medium">Viewing details for: <span className="text-foreground font-bold">{link.label || "Unnamed Link"}</span></p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {/* General Details Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-border pb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">General Information</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {generalDetails.map((item) => (
                                <div key={item.label} className={cn(
                                    "flex items-center justify-between p-3 rounded-xl border transition-all",
                                    item.active ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-transparent opacity-60"
                                )}>
                                    <div className="flex items-center gap-3">
                                        <item.icon size={16} className={cn(item.active ? "text-primary" : "text-muted-foreground")} />
                                        <span className={cn("text-sm font-bold", item.active ? "text-foreground" : "text-muted-foreground")}>
                                            {item.label}
                                        </span>
                                    </div>
                                    {item.active ? (
                                        <Badge className="bg-primary hover:bg-primary text-[9px] font-black h-5 uppercase">Visible</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-[9px] font-bold h-5 uppercase border-dashed">Hidden</Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Private Information Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-border pb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-destructive/70 flex items-center gap-1.5">
                                <ShieldAlert size={12} /> Restricted Content
                            </span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {privateDetails.map((item) => (
                                <div key={item.label} className={cn(
                                    "flex items-center justify-between p-3 rounded-xl border transition-all",
                                    item.active ? "bg-destructive/5 border-destructive/20" : "bg-muted/30 border-transparent opacity-60"
                                )}>
                                    <div className="flex items-center gap-3">
                                        <item.icon size={16} className={cn(item.active ? "text-destructive" : "text-muted-foreground")} />
                                        <span className={cn("text-sm font-bold", item.active ? "text-foreground" : "text-muted-foreground")}>
                                            {item.label}
                                        </span>
                                    </div>
                                    {item.active ? (
                                        <div className="flex items-center gap-1 bg-destructive/10 text-destructive px-2 py-0.5 rounded-full border border-destructive/20">
                                            <CheckCircle2 size={10} />
                                            <span className="text-[9px] font-black uppercase tracking-tight">Unlocked</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                                            <XCircle size={10} />
                                            <span className="text-[9px] font-black uppercase tracking-tight">Locked</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex justify-end">
                    <Button onClick={() => onOpenChange(false)} variant="secondary" className="uppercase text-[10px] font-black tracking-widest px-8">Close Preview</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
