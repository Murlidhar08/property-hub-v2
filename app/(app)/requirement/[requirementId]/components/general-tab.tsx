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
    User
} from "lucide-react";
import Link from "next/link";

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
        <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Basic Information */}
            <Card className="p-6 rounded-3xl border-border bg-card/50 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                <Hash size={12} /> Requirement ID
                            </p>
                            <p className="text-sm font-bold text-foreground"># {requirement.id.slice(-4)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                <Briefcase size={12} /> Requirement For
                            </p>
                            <p className="text-sm font-bold text-foreground capitalize">{requirement.propertyForType}</p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                <ShieldCheck size={12} /> Status
                            </p>
                            <p className="text-sm font-bold text-foreground capitalize">{requirement.status}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                <MapPin size={12} /> Location
                            </p>
                            <p className="text-sm font-bold text-foreground">{requirement.location}</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Requirement Specifications */}
            <Card className="p-6 rounded-3xl border-border bg-card/50 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6">Requirement Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                            <Layers size={12} /> Measurement Range
                        </p>
                        <p className="text-sm font-bold text-foreground">
                            {getMeasurementRange(requirement.minMeasurement, requirement.maxMeasurement, requirement.measurementType)}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                            <IndianRupee size={12} /> Price Range
                        </p>
                        <p className="text-sm font-bold text-foreground">
                            {getPriceRange(requirement.minPrice, requirement.maxPrice)}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Ownership */}
            <Card className="p-6 rounded-3xl border-border bg-card/50 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6">Ownership</h3>
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <User size={12} /> Client
                    </p>
                    <Link href={`/user/${requirement.clientId}` as any} className="text-sm font-bold text-primary hover:underline">
                        {requirement.clientName || "Unknown Client"}
                    </Link>
                </div>
                {requirement.agentId && (
                    <div className="space-y-1 mt-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                            <ShieldCheck size={12} /> Agent
                        </p>
                        <Link href={`/user/${requirement.agentId}` as any} className="text-sm font-bold text-primary hover:underline">
                            {requirement.agentName}
                        </Link>
                    </div>
                )}
            </Card>

            {/* Metadata */}
            <Card className="p-6 rounded-3xl border-border bg-card/50 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6">Metadata</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                <Calendar size={12} /> Created
                            </p>
                            <p className="text-sm font-bold text-foreground">
                                {formatDistanceToNow(new Date(requirement.createdAt), { addSuffix: true })}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                <User size={12} /> Created By
                            </p>
                            <Link href={`/user/${requirement.createdBy}` as any} className="text-sm font-bold text-foreground hover:text-primary hover:underline">
                                {requirement.creator.name}
                            </Link>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                <User size={12} /> Updated By
                            </p>
                            <Link href={`/user/${requirement.updatedBy}` as any} className="text-sm font-bold text-foreground hover:text-primary hover:underline">
                                {requirement.updater.name}
                            </Link>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                <Clock size={12} /> Created At
                            </p>
                            <p className="text-sm font-bold text-foreground">
                                {format(new Date(requirement.createdAt), "yyyy-MM-dd HH:mm:ss")}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                <Clock size={12} /> Updated At
                            </p>
                            <p className="text-sm font-bold text-foreground">
                                {format(new Date(requirement.updatedAt), "yyyy-MM-dd HH:mm:ss")}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
