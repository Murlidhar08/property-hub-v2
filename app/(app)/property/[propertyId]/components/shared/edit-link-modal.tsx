"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { updatePropertySharedLink } from "@/actions/property.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface EditLinkModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    link: any;
}

export default function EditLinkModal({ open, onOpenChange, link }: EditLinkModalProps) {
    const router = useRouter();
    const [label, setLabel] = useState("");
    const [hasExpiry, setHasExpiry] = useState(false);
    const [expiryDate, setExpiryDate] = useState("");
    
    // Checkboxes states for General Details
    const [price, setPrice] = useState(false);
    const [agent, setAgent] = useState(false);
    const [owner, setOwner] = useState(false);
    const [description, setDescription] = useState(true);
    const [location, setLocation] = useState(false);

    // Private Info
    const [privateImages, setPrivateImages] = useState(false);
    const [privateDocs, setPrivateDocs] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (link) {
            setLabel(link.label || "");
            setHasExpiry(!!link.expiry);
            if (link.expiry) {
                // Format date for datetime-local input (YYYY-MM-DDThh:mm)
                const date = new Date(link.expiry);
                const offset = date.getTimezoneOffset() * 60000;
                const localISOTime = new Date(date.getTime() - offset).toISOString().slice(0, 16);
                setExpiryDate(localISOTime);
            } else {
                setExpiryDate("");
            }

            const detail = link.detail || {};
            setPrice(!!detail.price);
            setAgent(!!detail.agent);
            setOwner(!!detail.owner);
            setDescription(detail.description !== false); // default true
            setLocation(!!detail.location);
            setPrivateImages(!!detail.privateImages);
            setPrivateDocs(!!detail.privateDocs);
        }
    }, [link, open]);

    const handleUpdate = async () => {
        setIsSaving(true);
        try {
            const detailJSON = {
                price,
                agent,
                owner,
                description,
                location,
                privateImages,
                privateDocs
            };

            const expiry = (hasExpiry && expiryDate) ? new Date(expiryDate) : null;

            if (hasExpiry && expiry && expiry < new Date()) {
                toast.error("Expiry date cannot be in the past.");
                setIsSaving(false);
                return;
            }

            await updatePropertySharedLink(link.id, {
                label,
                expiry,
                detail: detailJSON
            });

            toast.success("Property link updated successfully!");
            router.refresh();
            onOpenChange(false);
        } catch (error) {
            toast.error("Failed to update property link.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader className="mb-2">
                    <DialogTitle className="text-xl font-bold text-foreground tracking-tight uppercase">Edit Shared Link</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Shared Label */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Shared Label</label>
                        <Input
                            placeholder="Enter label"
                            className="h-10 text-sm font-medium"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                        />
                    </div>

                    {/* Expire Option */}
                    <div className="p-4 border border-border rounded-xl space-y-4 bg-muted/20">
                        <label className="text-sm font-bold text-muted-foreground block uppercase tracking-wider">Expire Option</label>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id="edit-setExpiry"
                                    className="w-5 h-5"
                                    checked={hasExpiry}
                                    onCheckedChange={(checked) => setHasExpiry(!!checked)}
                                />
                                <label htmlFor="edit-setExpiry" className="text-sm font-bold text-foreground cursor-pointer">Set Expiry Date</label>
                            </div>
                            <div className="relative">
                                <div className="absolute -top-2 left-3 px-1.5 bg-background text-[10px] text-primary font-black z-10 w-max uppercase tracking-tighter">Expires On</div>
                                <Input
                                    type="datetime-local"
                                    className="w-full sm:w-[220px] text-sm h-11 relative z-0 font-bold"
                                    disabled={!hasExpiry}
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* General Details */}
                    <div className="p-4 border border-border rounded-xl space-y-4">
                        <label className="text-sm font-bold text-muted-foreground block uppercase tracking-wider">General Details</label>
                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { id: "edit-price", label: "Price", state: price, setter: setPrice },
                                { id: "edit-agent", label: "Agent", state: agent, setter: setAgent },
                                { id: "edit-owner", label: "Owner", state: owner, setter: setOwner },
                                { id: "edit-desc", label: "Description", state: description, setter: setDescription },
                                { id: "edit-loc", label: "Location", state: location, setter: setLocation },
                            ].map((item) => (
                                <div key={item.id} className="flex items-center gap-3">
                                    <Checkbox id={item.id} className="w-5 h-5 border-2" checked={item.state} onCheckedChange={(checked) => item.setter(!!checked)} />
                                    <label htmlFor={item.id} className="text-sm font-bold text-foreground cursor-pointer">{item.label}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Private Info */}
                    <div className="p-4 border border-border rounded-xl space-y-4 bg-muted/10">
                        <label className="text-sm font-bold text-muted-foreground block uppercase tracking-wider">Private Info</label>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex items-center gap-3">
                                <Checkbox id="edit-privateImages" className="w-5 h-5 border-2 text-primary" checked={privateImages} onCheckedChange={(checked) => setPrivateImages(!!checked)} />
                                <label htmlFor="edit-privateImages" className="text-sm font-bold cursor-pointer text-destructive/80">Private Images</label>
                            </div>
                            <div className="flex items-center gap-3">
                                <Checkbox id="edit-privateDocs" className="w-5 h-5 border-2 text-primary" checked={privateDocs} onCheckedChange={(checked) => setPrivateDocs(!!checked)} />
                                <label htmlFor="edit-privateDocs" className="text-sm font-bold cursor-pointer text-destructive/80">Private Docs</label>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex justify-end gap-3 mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="uppercase text-[11px] font-black tracking-widest px-6 h-11 border-2">Cancel</Button>
                    <Button onClick={handleUpdate} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground uppercase text-[11px] font-black tracking-widest px-8 h-11 shadow-lg shadow-primary/25">
                        {isSaving ? "Updating..." : "Update Link"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
