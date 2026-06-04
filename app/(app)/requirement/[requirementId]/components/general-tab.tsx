import { Card } from "@/components/ui/card";
import { format, formatDistanceToNow } from "date-fns";
import {
    Briefcase,
    Calendar,
    Clock,
    Hash,
    IndianRupee,
    Layers,
    MapPin,
    ShieldCheck,
    User,
    Ruler,
    History,
    ChevronRight
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(value);
};

const getPriceRange = (min: any, max: any) => {
    if (!min && !max) return "At any price";
    if (min && max) return `${formatCurrency(Number(min))} - ${formatCurrency(Number(max))}`;
    if (min) return `From ${formatCurrency(Number(min))}`;
    if (max) return `Up to ${formatCurrency(Number(max))}`;
    return "At any price";
};

const getMeasurementRange = (min: any, max: any, type: any) => {
    if (!min && !max) return "Unknown";
    const typeLabel = type ? ` / ${type}` : "";
    if (min && max) return `${Number(min)} - ${Number(max)}${typeLabel}`;
    if (min) return `${Number(min)}+${typeLabel}`;
    if (max) return `Up to ${Number(max)}${typeLabel}`;
    return "Unknown";
};

export default async function GeneralTab({ requirement }: { requirement: any }) {

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left side stack */}
            <div className="lg:col-span-7 space-y-6">

                {/* Unified Summary Header Card */}
                <Card className="overflow-hidden rounded-[2rem] border border-border bg-card/60 backdrop-blur-md shadow-lg shadow-black/[0.02] p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex gap-4 items-start">
                            <div className="space-y-1.5">
                                <div className="flex flex-col flex-wrap gap-2 items-start">
                                    <Badge variant="outline" className="font-bold border-primary/20 text-primary capitalize px-2.5 py-0.5">
                                        {requirement.propertyType}
                                    </Badge>
                                    <Badge variant="secondary" className="font-bold px-2.5 py-0.5">
                                        ID: #{requirement.id}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Budget range display */}
                        <div className="sm:text-right shrink-0 flex flex-col items-start sm:items-end gap-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target Budget</p>
                            <p className="text-xl font-black text-emerald-500 tracking-tight">
                                {getPriceRange(requirement.minPrice, requirement.maxPrice)}
                            </p>
                            <Badge className="font-bold uppercase bg-amber-500 text-white mt-1 px-3 py-0.5">
                                For {requirement.propertyForType || "Any"}
                            </Badge>
                        </div>
                    </div>

                    {/* Size and area specifications info inline */}
                    <div className="mt-6 pt-5 border-t border-border/60 flex justify-between gap-4 text-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground">
                                <Ruler size={16} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Required Size</p>
                                <p className="font-bold text-foreground">
                                    {getMeasurementRange(requirement.minMeasurement, requirement.maxMeasurement, requirement.measurementType)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground">
                                <ShieldCheck size={16} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Matching Status</p>
                                <p className="font-bold text-foreground capitalize">{requirement.status || "Active"}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Fluent visual path card (Timeline layout linking client and agent) */}
                <Card className="rounded-[2rem] border border-border bg-card/60 backdrop-blur-md shadow-lg shadow-black/[0.02] p-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/80 mb-6 flex items-center gap-2">
                        <User size={14} className="text-primary" /> Client & Agent Assignment
                    </h3>

                    <div className="relative pl-8 space-y-8 before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-linear-to-b before:from-emerald-500 before:via-blue-500 before:to-muted-foreground/30 before:border-dashed before:border-l-2">
                        {/* Client Node */}
                        <div className="relative flex items-center gap-4 group">
                            <div className="absolute -left-[31px] w-8 h-8 rounded-full border-4 border-background bg-emerald-500 flex items-center justify-center shadow-md">
                                <User size={12} className="text-white" />
                            </div>
                            <div className="flex-1 flex justify-between items-center bg-background/40 hover:bg-background/80 border border-border/50 rounded-2xl p-3.5 transition-all duration-300">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border border-border shadow-sm">
                                        <AvatarFallback className="bg-emerald-500/10 text-emerald-600 font-black">
                                            {requirement.clientName?.charAt(0) || "C"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Client / Seeker</p>
                                        <Link href={`/user/${requirement.clientId}` as any} className="text-sm font-bold text-foreground hover:text-primary transition-colors flex items-center gap-0.5 group/link">
                                            {requirement.clientName || "Unknown Client"}
                                            <ChevronRight size={14} className="opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-300" />
                                        </Link>
                                    </div>
                                </div>
                                <Badge variant="outline" className="border-emerald-500/20 text-emerald-600 font-bold bg-emerald-500/5">Principal</Badge>
                            </div>
                        </div>

                        {/* Agent Node */}
                        {requirement.agentId ? (
                            <div className="relative flex items-center gap-4 group">
                                <div className="absolute -left-[31px] w-8 h-8 rounded-full border-4 border-background bg-blue-500 flex items-center justify-center shadow-md">
                                    <Briefcase size={12} className="text-white" />
                                </div>
                                <div className="flex-1 flex justify-between items-center bg-background/40 hover:bg-background/80 border border-border/50 rounded-2xl p-3.5 transition-all duration-300">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border border-border shadow-sm">
                                            <AvatarFallback className="bg-blue-500/10 text-blue-600 font-black">
                                                {requirement.agentName?.charAt(0) || "A"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-blue-600">Assigned Agent</p>
                                            <Link href={`/user/${requirement.agentId}` as any} className="text-sm font-bold text-foreground hover:text-primary transition-colors flex items-center gap-0.5 group/link">
                                                {requirement.agentName}
                                                <ChevronRight size={14} className="opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-300" />
                                            </Link>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="border-blue-500/20 text-blue-600 font-bold bg-blue-500/5">Broker</Badge>
                                </div>
                            </div>
                        ) : (
                            <div className="relative flex items-center gap-4 group">
                                <div className="absolute -left-[31px] w-8 h-8 rounded-full border-4 border-background bg-blue-500 flex items-center justify-center shadow-md">
                                    <Briefcase size={12} className="text-white" />
                                </div>
                                <div className="flex-1 bg-background/40 border border-border/50 rounded-2xl p-3.5">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Assigned Agent</p>
                                    <p className="text-sm font-bold text-muted-foreground mt-0.5">Unassigned</p>
                                </div>
                            </div>
                        )}

                        {/* Preferred Location Node */}
                        <div className="relative flex items-center gap-4 group">
                            <div className="absolute -left-[31px] w-8 h-8 rounded-full border-4 border-background bg-muted-foreground flex items-center justify-center shadow-md">
                                <MapPin size={12} className="text-white" />
                            </div>
                            <div className="flex-1 bg-background/40 hover:bg-background/80 border border-border/50 rounded-2xl p-3.5 transition-all duration-300">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Preferred Location</p>
                                <p className="text-sm font-bold text-foreground mt-1 group-hover:text-primary transition-colors line-clamp-2">
                                    {requirement.location}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Right side lifecycle timeline */}
            <div className="lg:col-span-5 space-y-6">

                {/* Audit Log / Lifecycle Card */}
                <Card className="rounded-[2rem] border border-border bg-card/60 backdrop-blur-md shadow-lg shadow-black/[0.02] p-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/80 mb-6 flex items-center gap-2">
                        <History size={14} className="text-primary animate-spin" style={{ animationDuration: '6s' }} /> Requirement Audit Log
                    </h3>

                    <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border/60">
                        {/* Created log */}
                        <div className="relative group">
                            <div className="absolute -left-[20px] w-3 h-3 rounded-full border-2 border-background bg-indigo-500 ring-4 ring-indigo-500/10 group-hover:scale-125 transition-transform duration-300" />
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    Created On
                                </p>
                                <p className="text-sm font-bold text-foreground">
                                    {format(new Date(requirement.createdAt), "cccc, MMM dd, yyyy")}
                                </p>
                                <p className="text-xs text-muted-foreground/80 font-medium">
                                    By{" "}
                                    <Link href={`/user/${requirement.createdBy}` as any} className="text-primary hover:underline font-semibold">
                                        {requirement.creator?.name || "System"}
                                    </Link>{" "}
                                    at {format(new Date(requirement.createdAt), "hh:mm a")}
                                </p>
                            </div>
                        </div>

                        {/* Updated log */}
                        <div className="relative group">
                            <div className="absolute -left-[20px] w-3 h-3 rounded-full border-2 border-background bg-amber-500 ring-4 ring-amber-500/10 group-hover:scale-125 transition-transform duration-300" />
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    Last Updated On
                                </p>
                                <p className="text-sm font-bold text-foreground">
                                    {format(new Date(requirement.updatedAt), "cccc, MMM dd, yyyy")}
                                </p>
                                <p className="text-xs text-muted-foreground/80 font-medium">
                                    By{" "}
                                    <Link href={`/user/${requirement.updatedBy}` as any} className="text-primary hover:underline font-semibold">
                                        {requirement.updater?.name || requirement.creator?.name || "System"}
                                    </Link>{" "}
                                    at {format(new Date(requirement.updatedAt), "hh:mm a")}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
