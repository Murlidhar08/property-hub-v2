"use client";

import { deleteAgreement, deleteAgreementPayment } from "@/actions/agreement.actions";
import { DocumentPreview } from "@/components/document-preview";
import { useConfirm } from "@/components/providers/confirm-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getAgreementTypeName } from "@/lib/constants/agreements";
import { cn } from "@/lib/utils";
import { formatIndianCurrency } from "@/utility/formatters";
import { format, formatDistanceToNow } from "date-fns";
import {
    Calendar,
    Clock,
    Edit2,
    ExternalLink,
    Eye,
    FileText,
    Image as ImageIcon,
    MoreVertical,
    Plus,
    Trash2
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AddAgreementModal } from "./add-agreement-modal";
import { AddPaymentModal } from "./add-payment-modal";

interface AgreementViewProps {
    propertyId: string;
    agreements: any[];
    userId: string;
}

export function AgreementView({ propertyId, agreements, userId }: AgreementViewProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [editAgreement, setEditAgreement] = useState<any>(null);
    const [previewFile, setPreviewFile] = useState<any>(null);
    const confirm = useConfirm();

    const openAddModal = () => {
        setEditAgreement(null);
        setIsAgreementModalOpen(true);
    };

    const openEditModal = (agreement: any) => {
        setEditAgreement(agreement);
        setIsAgreementModalOpen(true);
    };

    const selected = agreements[selectedIndex];

    if (!selected && agreements.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-indigo-100 rounded-[2.5rem] bg-indigo-50/10 min-h-100 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mb-6">
                    <Plus size={40} />
                </div>
                <h3 className="text-xl font-black text-indigo-900 tracking-tight">No Agreements Record</h3>
                <p className="text-muted-foreground font-medium text-sm mt-1 mb-8 max-w-70 text-center">Start managing your property deals by adding your first legal agreement.</p>
                <Button
                    onClick={openAddModal}
                    className="rounded-full bg-indigo-600 hover:bg-indigo-700 h-12 px-8 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-indigo-100"
                >
                    <Plus className="mr-2" size={16} strokeWidth={3} /> Add First Agreement
                </Button>

                <AddAgreementModal
                    open={isAgreementModalOpen}
                    onClose={() => setIsAgreementModalOpen(false)}
                    propertyId={propertyId}
                    userId={userId}
                />
            </div>
        );
    }

    const totalGiven = selected?.payments?.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0) || 0;
    const pendingAmount = Number(selected?.price || 0) - totalGiven;

    const handleDeleteAgreement = async () => {
        const ok = await confirm({
            title: "Delete Agreement",
            description: "Are you sure you want to delete this agreement and all its payments?",
        });

        if (ok) {
            const res = await deleteAgreement(selected.id, propertyId);
            if (res.success) {
                toast.success("Agreement deleted");
                setSelectedIndex(0);
            } else {
                toast.error("Failed to delete agreement");
            }
        }
    };

    const handleDeletePayment = async (id: number) => {
        const ok = await confirm({
            title: "Delete Payment",
            description: "Are you sure you want to delete this payment record?",
        });

        if (ok) {
            const res = await deleteAgreementPayment(id, propertyId);
            if (res.success) {
                toast.success("Payment deleted");
            } else {
                toast.error("Failed to delete payment");
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header / Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start gap-4">
                <div className="flex items-center gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger render={
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <MoreVertical size={20} />
                            </Button>
                        } />
                        <DropdownMenuContent align="start" className="rounded-xl">
                            <DropdownMenuItem onClick={() => openEditModal(selected)}>
                                <Edit2 size={14} className="mr-2 text-blue-500" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDeleteAgreement} className="text-destructive">
                                <Trash2 size={14} className="mr-2" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <Select value={selectedIndex.toString()} onValueChange={(v) => setSelectedIndex(parseInt(v ?? "0"))}>
                    <SelectTrigger className="w-full sm:w-75 rounded-2xl bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 font-bold text-indigo-600">
                        <SelectValue>
                            {selected && `${selected.clientName} • ${format(new Date(selected.date), "dd MMM, yyyy")}`}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                        {agreements.map((a, i) => (
                            <SelectItem key={a.id} value={i.toString()}>
                                {a.clientName} • {format(new Date(a.date), "dd MMM, yy")}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Premium "New Agreement" Action */}
                <div className="flex flex-1 justify-end">
                    <Button
                        onClick={openAddModal}
                        className="h-10 sm:h-12 px-2 sm:px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-100 flex items-center gap-3 group transition-all shrink-0 border-none select-none"
                    >
                        <div className="p-1.5 rounded-xl bg-white/20 group-hover:bg-white/30 transition-colors">
                            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" strokeWidth={3} />
                        </div>
                        <div className="text-left hidden sm:block">
                            <p className="text-sm font-black tracking-tight leading-none">New Agreement</p>
                        </div>
                    </Button>
                </div>
            </div>

            {/* Details Grid */}
            {/* Fluent Overview Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-8 rounded-[2.5rem] border-border bg-card shadow-sm relative overflow-hidden group">
                    {/* Decorative Background Element */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-full blur-3xl transition-transform group-hover:scale-110" />

                    <div className="relative flex flex-col sm:flex-row gap-8 items-start">
                        {/* Type Icon & Title */}
                        <div className="flex-1 space-y-6 w-full">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none shrink-0">
                                        <FileText size={24} className="sm:hidden" />
                                        <FileText size={32} className="hidden sm:block" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-lg sm:text-2xl font-black text-foreground tracking-tight truncate">
                                            {getAgreementTypeName(selected.typeId)}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                            <Badge variant="outline" className="rounded-full bg-indigo-50 text-indigo-700 border-indigo-100 px-2 py-0 text-[9px] font-black uppercase tracking-widest leading-normal">
                                                {selected.status}
                                            </Badge>
                                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                                                <Calendar size={10} /> {format(new Date(selected.date), "dd MMM, yy")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest opacity-50">Total Value</p>
                                    <p className="text-xl sm:text-3xl font-black text-indigo-600 tracking-tighter">
                                        {formatIndianCurrency(Number(selected.price))}
                                    </p>
                                </div>
                            </div>

                            {/* Relationship Route (The "Fluent" Style) */}
                            <div className="space-y-4 pt-4">
                                <div className="relative pl-8">
                                    {/* Vertical Line */}
                                    <div className="absolute left-3 top-2 bottom-2 w-px border-l-2 border-dashed border-indigo-200 dark:border-indigo-500/20" />

                                    {/* Owner Start Point */}
                                    <div className="relative mb-8">
                                        <div className="absolute -left-6.75 top-1 w-4 h-4 rounded-full border-2 border-indigo-600 bg-white dark:bg-slate-900 z-10" />
                                        <div>
                                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Agreement Owner</p>
                                            <p className="text-base sm:text-lg font-bold text-foreground leading-tight">{selected.ownerName}</p>
                                        </div>
                                    </div>

                                    {/* Client End Point */}
                                    <div className="relative">
                                        <div className="absolute -left-8 top-1 w-6 h-6 flex items-center justify-center bg-white dark:bg-slate-900 z-10">
                                            <div className="w-4 h-4 rounded-full bg-indigo-600 shadow-sm" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Target Client</p>
                                            <p className="text-base sm:text-lg font-bold text-foreground leading-tight">{selected.clientName}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Secondary Stats/Info Card */}
                <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:flex lg:flex-col">
                    <Card className="p-5 sm:p-6 rounded-[2rem] border-border bg-card shadow-sm flex flex-col justify-center">
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-4 block">Agreement Overview</span>
                        <div className="space-y-3 text-sm font-bold">
                            <div className="flex justify-between items-center bg-muted/30 p-3 rounded-2xl">
                                <span className="text-muted-foreground text-xs font-black uppercase tracking-widest opacity-60">Contract ID</span>
                                <span className="text-indigo-600 font-black">#{selected.id}</span>
                            </div>
                            <div className="flex justify-between items-center bg-muted/30 p-3 rounded-2xl">
                                <span className="text-muted-foreground text-xs font-black uppercase tracking-widest opacity-60">Period</span>
                                <span className="text-xs">{format(new Date(selected.date), "dd/MM/yy")} → {selected.validTill ? format(new Date(selected.validTill), "dd/MM/yy") : "∞"}</span>
                            </div>
                            {selected.validTill && (
                                <div className="flex justify-between items-center p-3 rounded-2xl border border-rose-100 bg-rose-50/30 text-rose-600">
                                    <span className="font-bold flex items-center gap-2"><Clock size={14} /> Time Left</span>
                                    <span className="font-black uppercase text-[10px]">{formatDistanceToNow(new Date(selected.validTill), { addSuffix: false })}</span>
                                </div>
                            )}
                        </div>
                    </Card>

                    <AddPaymentButton onClick={() => setIsPaymentModalOpen(true)} />
                </div>
            </div>

            {/* Payments Table */}
            <Card className="rounded-[2.5rem] border-border overflow-hidden bg-card shadow-sm border">
                <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between bg-muted/5">
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        Transaction Ledger
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 border-none">
                                <TableHead className="w-15 text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-4 sm:pl-6">Action</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Label</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</TableHead>
                                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground pr-4 sm:pr-6">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {selected.payments?.length > 0 ? (
                                selected.payments.map((p: any) => (
                                    <TableRow key={p.id} className="hover:bg-muted/20 transition-colors border-border/50 text-xs sm:text-sm">
                                        <TableCell className="pl-4 sm:pl-6">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger render={
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full">
                                                        <MoreVertical size={14} />
                                                    </Button>
                                                } />
                                                <DropdownMenuContent className="rounded-xl">
                                                    <DropdownMenuItem className="text-destructive" onClick={() => handleDeletePayment(p.id)}>
                                                        <Trash2 size={14} className="mr-2" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                        <TableCell className="font-bold">{p.label}</TableCell>
                                        <TableCell className="text-muted-foreground opacity-70">{format(new Date(p.paidDate), "dd MMM, yy")}</TableCell>
                                        <TableCell className="text-right font-black text-indigo-600 pr-4 sm:pr-6">{formatIndianCurrency(Number(p.amount))}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground uppercase tracking-widest text-[10px] font-bold">
                                        No payments recorded
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Summary & Description */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20 lg:pb-0">
                <Card className="p-8 rounded-[2.5rem] border-border bg-linear-to-br from-indigo-50/50 to-white dark:from-indigo-900/10 dark:to-card shadow-sm space-y-4">
                    <div className="space-y-4">
                        <SummaryRow label="Total Price" value={formatIndianCurrency(Number(selected.price))} />
                        <SummaryRow label="Given" value={formatIndianCurrency(totalGiven)} color="text-emerald-600" />
                        <hr className="border-indigo-100 dark:border-indigo-500/20" />
                        <SummaryRow label="Pending" value={formatIndianCurrency(pendingAmount)} color="text-rose-600" />
                    </div>
                </Card>

                {selected.description && (
                    <Card className="p-8 rounded-[2.5rem] border-border bg-card shadow-sm">
                        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">Description</h3>
                        <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                            {selected.description}
                        </div>
                    </Card>
                )}
            </div>

            {/* Documents Section */}
            {selected.documents?.length > 0 && (
                <div className="space-y-6 pb-20">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Agreement Paperwork</h3>
                        <div className="h-px flex-1 bg-border" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {selected.documents.sort((a: any, b: any) => a.orderId - b.orderId).map((doc: any) => (
                            <Card key={doc.id} className="group p-3 rounded-2xl border-border bg-card/50 shadow-sm transition-all hover:scale-[1.02] hover:border-indigo-200 cursor-pointer overflow-hidden relative"
                                onClick={() => setPreviewFile(doc)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "p-3 rounded-xl border shrink-0",
                                        doc.extension.toLowerCase() === ".pdf" ? "bg-rose-50 text-rose-500 border-rose-100" : "bg-indigo-50 text-indigo-500 border-indigo-100"
                                    )}>
                                        {doc.extension.toLowerCase() === ".pdf" ? <FileText size={20} /> : <ImageIcon size={20} />}
                                    </div>
                                    <div className="truncate flex-1">
                                        <p className="text-[10px] font-black text-foreground truncate uppercase tracking-tight">{doc.fileName}</p>
                                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest leading-none mt-1">{doc.extension.replace(".", "")} File</p>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        {doc.extension.toLowerCase() === ".pdf" ? <ExternalLink size={14} className="text-muted-foreground" /> : <Eye size={14} className="text-muted-foreground" />}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Document Preview Component */}
            {previewFile && (
                <DocumentPreview
                    isOpen={!!previewFile}
                    onClose={() => setPreviewFile(null)}
                    url={`/api/files/${previewFile.relativePath}`}
                    fileName={previewFile.fileName}
                    fileExtension={previewFile.extension.toLowerCase()}
                />
            )}

            {/* Unified Agreement Modal (Add/Edit) */}
            <AddAgreementModal
                open={isAgreementModalOpen}
                onClose={() => {
                    setIsAgreementModalOpen(false);
                    setEditAgreement(null);
                }}
                propertyId={propertyId}
                agreement={editAgreement}
                userId={userId}
            />

            <AddPaymentModal
                open={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                agreementId={selected.id}
                propertyId={propertyId}
                userId={userId}
            />
        </div>
    );
}

function AddPaymentButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="w-full relative group overflow-hidden p-6 rounded-[2rem] bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all active:scale-[0.98] outline-hidden"
        >
            <div className="absolute inset-0 bg-linear-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between relative z-10">
                <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Action Needed</p>
                    <p className="text-xl font-black">Record Payment</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <Plus size={24} strokeWidth={3} />
                </div>
            </div>
        </button>
    );
}

function SummaryRow({ label, value, subValue, color = "text-foreground" }: any) {
    return (
        <div className="flex flex-col gap-0.5">
            <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{label}</span>
                <span className={cn("text-lg font-black", color)}>{value}</span>
            </div>
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight text-right opacity-60">
                {subValue}
            </div>
        </div>
    );
}
