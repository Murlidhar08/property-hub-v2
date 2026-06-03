"use client";

import { addUpdateAgreement } from "@/actions/agreement.actions";
import { finalizePropertyDocuments } from "@/actions/file.actions";
import { getClients, getOwners } from "@/actions/user.actions";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AGREEMENT_TYPES } from "@/lib/constants/agreements";
import { AgreementStatus } from "@/lib/generated/prisma/browser";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, IndianRupee } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AgreementDocumentUploadZone } from "./agreement-document-upload-zone";

interface AddAgreementModalProps {
    open: boolean;
    onClose: () => void;
    propertyId: string;
    agreement?: any; // For editing
    userId: string;
}

export function AddAgreementModal({ open, onClose, propertyId, agreement, userId }: AddAgreementModalProps) {
    const [loading, setLoading] = useState(false);
    const [owners, setOwners] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);

    const [form, setForm] = useState({
        ownerId: "",
        clientId: "",
        typeId: "1",
        status: "pending" as AgreementStatus,
        price: "",
        date: new Date(),
        validTill: undefined as Date | undefined,
        description: "",
        documents: [] as any[],
    });

    useEffect(() => {
        const fetchData = async () => {
            const [ownersData, clientsData] = await Promise.all([
                getOwners(),
                getClients()
            ]);
            setOwners(ownersData);
            setClients(clientsData);
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (agreement) {
            setForm({
                ownerId: agreement.ownerId,
                clientId: agreement.clientId,
                typeId: agreement.typeId.toString(),
                status: agreement.status,
                price: agreement.price.toString(),
                date: new Date(agreement.date),
                validTill: agreement.validTill ? new Date(agreement.validTill) : undefined,
                description: agreement.description || "",
                documents: agreement.documents || [],
            });
        } else {
            setForm({
                ownerId: "",
                clientId: "",
                typeId: "1",
                status: "pending",
                price: "",
                date: new Date(),
                validTill: undefined,
                description: "",
                documents: [],
            });
        }
    }, [agreement, open]);

    const handleSubmit = async () => {
        if (!form.ownerId || !form.clientId || !form.price || !form.date) {
            toast.error("Please fill all required fields");
            return;
        }

        setLoading(true);
        try {
            const result = await addUpdateAgreement({
                id: agreement?.id,
                propertyId,
                ownerId: form.ownerId,
                clientId: form.clientId,
                typeId: parseInt(form.typeId),
                price: parseFloat(form.price),
                status: form.status,
                date: form.date,
                validTill: form.validTill,
                description: form.description,
                userId,
            });

            if (result.success) {
                // Finalize documents
                if (form.documents.length > 0) {
                    await finalizePropertyDocuments(propertyId, form.documents, result.agreementId);
                }

                toast.success(agreement ? "Agreement updated" : "Agreement added");
                onClose();
            } else {
                toast.error(result.error || "Something went wrong");
            }
        } catch (error) {
            toast.error("Failed to save agreement");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto rounded-[2rem]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-indigo-600 uppercase tracking-tight">
                        {agreement ? "Edit Agreement" : "Add Agreement"}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Owner */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Owner</Label>
                        <Select value={form.ownerId} onValueChange={(v) => setForm({ ...form, ownerId: v || "" })}>
                            <SelectTrigger className="rounded-xl border-border bg-muted/20">
                                <SelectValue placeholder="Select Owner">
                                    {owners.find(o => o.id === form.ownerId)?.name || "Select Owner"}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {owners.map((owner) => (
                                    <SelectItem key={owner.id} value={owner.id}>{owner.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Client */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Client</Label>
                        <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v || "" })}>
                            <SelectTrigger className="rounded-xl border-border bg-muted/20">
                                <SelectValue placeholder="Select Client">
                                    {clients.find(c => c.id === form.clientId)?.name || "Select Client"}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {clients.map((client) => (
                                    <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Agreement Type */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Agreement Type</Label>
                            <Select value={form.typeId} onValueChange={(v) => setForm({ ...form, typeId: v || "1" })}>
                                <SelectTrigger className="rounded-xl border-border bg-muted/20">
                                    <SelectValue placeholder="Select Type">
                                        {AGREEMENT_TYPES.find((t: any) => t.id.toString() === form.typeId)?.name || "Select Type"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {AGREEMENT_TYPES.map((type: any) => (
                                        <SelectItem key={type.id} value={type.id.toString()}>{type.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Agreement Status */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Agreement Status</Label>
                            <Select value={form.status} onValueChange={(v: AgreementStatus | null) => v && setForm({ ...form, status: v })}>
                                <SelectTrigger className="rounded-xl border-border bg-muted/20">
                                    <SelectValue placeholder="Status">
                                        <span className="capitalize">{form.status}</span>
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(AgreementStatus).map((status) => (
                                        <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Price (₹)</Label>
                        <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            <Input
                                type="number"
                                className="pl-10 rounded-xl border-border bg-muted/20"
                                placeholder="Enter price"
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Date */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Agreement Date</Label>
                            <Popover>
                                <PopoverTrigger render={
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal rounded-xl border-border bg-muted/20",
                                            !form.date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {form.date ? format(form.date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                } />
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={form.date}
                                        onSelect={(d) => d && setForm({ ...form, date: d })}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Valid Till */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Valid Till</Label>
                            <Popover>
                                <PopoverTrigger render={
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal rounded-xl border-border bg-muted/20",
                                            !form.validTill && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {form.validTill ? format(form.validTill, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                } />
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={form.validTill}
                                        onSelect={(d) => setForm({ ...form, validTill: d })}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</Label>
                        <Textarea
                            placeholder="Description ..."
                            className="min-h-30 rounded-2xl border-border bg-muted/20 resize-none"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </div>

                    {/* Documents */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Agreement Paperwork</Label>
                            <div className="h-px flex-1 bg-border" />
                        </div>
                        <AgreementDocumentUploadZone
                            propertyId={propertyId}
                            initialFiles={form.documents}
                            onFilesChange={(files) => setForm({ ...form, documents: files })}
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold uppercase tracking-widest text-[10px]">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-widest text-[10px]">
                        {loading ? "Saving..." : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
