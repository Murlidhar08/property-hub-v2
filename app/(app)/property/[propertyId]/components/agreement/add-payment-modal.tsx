"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, IndianRupee } from "lucide-react";
import { addAgreementPayment } from "@/actions/agreement.actions";
import { toast } from "sonner";

interface AddPaymentModalProps {
    open: boolean;
    onClose: () => void;
    agreementId: number;
    propertyId: string;
    userId: string;
    payment?: any; // For editing (if implemented)
}

export function AddPaymentModal({ open, onClose, agreementId, propertyId, userId, payment }: AddPaymentModalProps) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        label: "",
        amount: "",
        paidDate: new Date(),
    });

    useEffect(() => {
        if (payment) {
            setForm({
                label: payment.label,
                amount: payment.amount.toString(),
                paidDate: new Date(payment.paidDate),
            });
        } else {
            setForm({
                label: "",
                amount: "",
                paidDate: new Date(),
            });
        }
    }, [payment, open]);

    const handleSubmit = async () => {
        if (!form.label || !form.amount || !form.paidDate) {
            toast.error("Please fill all fields");
            return;
        }

        setLoading(true);
        try {
            const result = await addAgreementPayment({
                agreementId,
                label: form.label,
                amount: parseFloat(form.amount),
                paidDate: form.paidDate,
                userId,
                propertyId
            });

            if (result.success) {
                toast.success("Payment added successfully");
                onClose();
            } else {
                toast.error("Failed to add payment");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-100 rounded-[2rem]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-indigo-600 uppercase tracking-tight">
                        {payment ? "Edit Payment" : "Add Payment"}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Label */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payment Label</Label>
                        <Input
                            placeholder="Enter value"
                            className="rounded-xl border-border bg-muted/20"
                            value={form.label}
                            onChange={(e) => setForm({ ...form, label: e.target.value })}
                        />
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount (₹)</Label>
                        <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            <Input
                                type="number"
                                className="pl-10 rounded-xl border-border bg-muted/20"
                                placeholder="Enter value"
                                value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payment Date</Label>
                        <Popover>
                            <PopoverTrigger render={
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal rounded-xl border-border bg-muted/20",
                                        !form.paidDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {form.paidDate ? format(form.paidDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            } />
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={form.paidDate}
                                    onSelect={(d) => d && setForm({ ...form, paidDate: d })}
                                />
                            </PopoverContent>
                        </Popover>
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
