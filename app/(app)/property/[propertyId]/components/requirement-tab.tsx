import { getMatchedRequirementsById } from "@/actions/property.actions";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PropertyType } from "@/lib/generated/prisma/client";
import { formatDistanceToNow } from "date-fns";
import {
    Building2,
    Clock,
    Home,
    IndianRupee,
    Layers,
    Layout,
    MapPin,
    Search,
    Trees,
    ArrowRight
} from "lucide-react";
import Link from "next/link";

const typeIcons: Record<string, any> = {
    [PropertyType.hotel]: <Building2 className="text-rose-500" size={24} />,
    [PropertyType.agricultural]: <Trees className="text-emerald-500" size={24} />,
    [PropertyType.nonagricultural]: <Layers className="text-amber-500" size={24} />,
    [PropertyType.tenament]: <Home className="text-sky-500" size={24} />,
    [PropertyType.flat]: <Building2 className="text-indigo-500" size={24} />,
    [PropertyType.plot]: <Layout className="text-orange-500" size={24} />,
};

export default async function RequirementTab({ propertyId }: { propertyId: string }) {
    const requirements = await getMatchedRequirementsById(propertyId);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            maximumFractionDigits: 0
        }).format(value);
    };

    const getPriceRange = (min: any, max: any) => {
        if (!min && !max) return "Any Budget";
        if (min && max) return `₹ ${formatCurrency(Number(min))} - ${formatCurrency(Number(max))}`;
        if (min) return `From ₹ ${formatCurrency(Number(min))}`;
        if (max) return `Up to ₹ ${formatCurrency(Number(max))}`;
        return "Any Budget";
    };

    const getMeasurementRange = (min: any, max: any, type: any) => {
        if (!min && !max) return "Any Size";
        const typeLabel = type ? ` / ${type}` : "";
        if (min && max) return `${Number(min)} - ${Number(max)}${typeLabel}`;
        if (min) return `${Number(min)}+${typeLabel}`;
        if (max) return `Up to ${Number(max)}${typeLabel}`;
        return "Any Size";
    };

    if (requirements.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-card/50 rounded-[2.5rem] border border-dashed border-border/60 shadow-inner">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6 text-muted-foreground/30 border border-border/50">
                    <Search size={40} />
                </div>
                <h3 className="text-lg font-black text-foreground uppercase tracking-widest leading-none mb-2">No Matches Found</h3>
                <p className="text-sm font-bold text-muted-foreground max-w-sm">
                    We couldn't find any active requirements that match this property's specifications yet.
                </p>
                <div className="mt-8">
                    <Link href="/requirement" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-2">
                        Browse All Requirements <ArrowRight size={12} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        Potential Leads Found
                    </h3>
                </div>
                <Badge variant="secondary" className="rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 border-none">
                    {requirements.length} Active
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requirements.map((req: any) => (
                    <Card key={req.id} className="group relative overflow-hidden bg-card/50 hover:bg-card border-border hover:border-primary/50 transition-all duration-500 rounded-[2rem] p-5 shadow-sm hover:shadow-2xl hover:shadow-primary/5">
                        <Link href={`/requirement/${req.id}` as any} className="flex flex-col h-full">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/5 transition-colors border border-border group-hover:border-primary/20 shadow-inner">
                                        <div className="transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                                            {typeIcons[req.propertyType] || <Layout size={24} className="text-muted-foreground" />}
                                        </div>
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-black text-sm text-foreground uppercase tracking-tight truncate mb-1">
                                            {req.title}
                                        </h4>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                                            <MapPin size={10} className="text-primary" />
                                            <span className="truncate">{req.location}</span>
                                        </div>
                                    </div>
                                </div>
                                <ArrowRight size={14} className="text-muted-foreground/30 group-hover:text-primary transition-colors translate-x-0 group-hover:translate-x-1" />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-muted/30 p-3 rounded-2xl border border-border/50 group-hover:border-primary/10 transition-colors">
                                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                                        <IndianRupee size={10} className="text-emerald-500" /> Budget
                                    </div>
                                    <div className="text-[11px] font-black text-foreground">
                                        {getPriceRange(req.minPrice, req.maxPrice)}
                                    </div>
                                </div>
                                <div className="bg-muted/30 p-3 rounded-2xl border border-border/50 group-hover:border-primary/10 transition-colors">
                                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                                        <Layers size={10} className="text-amber-500" /> Plot Size
                                    </div>
                                    <div className="text-[11px] font-black text-foreground truncate">
                                        {getMeasurementRange(req.minMeasurement, req.maxMeasurement, req.measurementType)}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-dashed border-border/60">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-[10px]">
                                        {req.creator?.name?.charAt(0) || "U"}
                                    </div>
                                    <span className="text-[10px] font-bold text-muted-foreground">
                                        {req.creator?.name || "Client"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">
                                    <Clock size={10} />
                                    {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
                                </div>
                            </div>
                        </Link>
                    </Card>
                ))}
            </div>
        </div>
    );
}