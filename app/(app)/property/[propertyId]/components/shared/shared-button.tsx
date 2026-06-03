"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
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
import { createPropertySharedLink } from "@/actions/property.actions";
import { toast } from "sonner";

export default function SharedButton({ propertyId }: { propertyId: string }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
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

    const handleShare = async () => {
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

            await createPropertySharedLink({
                propertyId,
                label,
                expiry,
                detail: detailJSON
            });

            toast.success("Property link created successfully!");
            router.refresh();
            setOpen(false);
        } catch (error) {
            toast.error("Failed to share property link.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-24 lg:bottom-10 right-10 w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 z-50 group"
            >
                <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader className="mb-2">
                        <DialogTitle className="text-xl font-bold">Share Property Link</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Shared Label */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground">Shared Label</label>
                            <Input
                                placeholder="Enter label"
                                className="h-10 text-sm"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                            />
                        </div>

                        {/* Expire Option */}
                        <div className="p-4 border border-border rounded-xl space-y-4">
                            <label className="text-sm font-bold text-muted-foreground block">Expire Option</label>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        id="setExpiry"
                                        className="w-5 h-5"
                                        checked={hasExpiry}
                                        onCheckedChange={(checked) => setHasExpiry(!!checked)}
                                    />
                                    <label htmlFor="setExpiry" className="text-sm font-medium cursor-pointer">Set Expiry Date</label>
                                </div>
                                <div className="relative">
                                    {/* Simulated floating label input for datetime */}
                                    <div className="absolute -top-2 left-3 px-1.5 bg-background text-[10px] text-muted-foreground font-medium z-10 w-max">Expires On</div>
                                    <Input
                                        type="datetime-local"
                                        className="w-full sm:w-[220px] text-sm h-11 relative z-0"
                                        disabled={!hasExpiry}
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                    />
                                    {hasExpiry && <p className="text-[10px] text-muted-foreground mt-1 text-right">Link will stop working after this date</p>}
                                </div>
                            </div>
                        </div>

                        {/* General Details */}
                        <div className="p-4 border border-border rounded-xl space-y-4">
                            <label className="text-sm font-bold text-muted-foreground block">General Details</label>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="flex items-center gap-3">
                                    <Checkbox id="price" className="w-5 h-5" checked={price} onCheckedChange={(checked) => setPrice(!!checked)} />
                                    <label htmlFor="price" className="text-sm cursor-pointer">Price</label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Checkbox id="agent" className="w-5 h-5" checked={agent} onCheckedChange={(checked) => setAgent(!!checked)} />
                                    <label htmlFor="agent" className="text-sm cursor-pointer">Agent</label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Checkbox id="owner" className="w-5 h-5" checked={owner} onCheckedChange={(checked) => setOwner(!!checked)} />
                                    <label htmlFor="owner" className="text-sm cursor-pointer">Owner</label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Checkbox id="description" className="w-5 h-5" checked={description} onCheckedChange={(checked) => setDescription(!!checked)} />
                                    <label htmlFor="description" className="text-sm cursor-pointer">Description</label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Checkbox id="location" className="w-5 h-5" checked={location} onCheckedChange={(checked) => setLocation(!!checked)} />
                                    <label htmlFor="location" className="text-sm cursor-pointer">Location</label>
                                </div>
                            </div>
                        </div>

                        {/* Private Info */}
                        <div className="p-4 border border-border rounded-xl space-y-4">
                            <label className="text-sm font-bold text-muted-foreground block">Private Info</label>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="flex items-center gap-3">
                                    <Checkbox id="privateImages" className="w-5 h-5" checked={privateImages} onCheckedChange={(checked) => setPrivateImages(!!checked)} />
                                    <label htmlFor="privateImages" className="text-sm cursor-pointer">Private Images</label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Checkbox id="privateDocs" className="w-5 h-5" checked={privateDocs} onCheckedChange={(checked) => setPrivateDocs(!!checked)} />
                                    <label htmlFor="privateDocs" className="text-sm cursor-pointer">Private Docs</label>
                                </div>
                            </div>
                        </div>

                    </div>

                    <DialogFooter className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={() => setOpen(false)} className="uppercase text-primary font-bold px-6">Close</Button>
                        <Button onClick={handleShare} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white uppercase font-bold px-6">
                            {isSaving ? "Saving..." : "Share"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
