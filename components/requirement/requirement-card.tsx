"use client";

import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Clock, IndianRupee, Layers, Layout, MapPin, Target, Ruler, User } from "lucide-react";
import Link from "next/link";
import { Card } from "../ui/card";
import { typeIcons } from "../property/property-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function RequirementCard({ req }: { req: any }) {
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

    // Pick dynamic gradient based on property type for visual premiumness
    const typeGradients: Record<string, string> = {
        apartment: "from-blue-500 to-cyan-500",
        house: "from-emerald-500 to-teal-500",
        villa: "from-amber-500 to-orange-500",
        land: "from-orange-500 to-red-500",
        commercial: "from-violet-500 to-purple-500",
    };
    const gradient = typeGradients[req.propertyType?.toLowerCase()] || "from-primary to-indigo-500";

    return (
        <Card key={req.id} className="group relative overflow-hidden bg-card/60 backdrop-blur-md border border-border hover:border-primary/40 hover:bg-card transition-all duration-500 rounded-[2.2rem] p-5 shadow-sm hover:shadow-2xl hover:shadow-primary/5">
            <Link href={`/requirement/${req.id}` as any} className="flex flex-col h-full">
                {/* Header Section */}
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex gap-4 items-start">
                        {/* Type Icon with Dynamic Circle Wrapper overrides default size */}
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/5 [&>svg]:size-5! [&>svg]:text-white`}>
                            {typeIcons[req.propertyType] || <Layout size={20} className="text-white" />}
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-black text-sm text-foreground uppercase tracking-tight line-clamp-1 group-hover:text-primary transition-colors duration-300">
                                {req.title}
                            </h4>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                                <MapPin size={10} className="text-rose-500" />
                                <span className="truncate max-w-[150px]">{req.location}</span>
                                <span className="text-muted-foreground/30">•</span>
                                <span className="capitalize">{req.propertyType}</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-muted/60 group-hover:bg-primary/10 flex items-center justify-center text-muted-foreground/40 group-hover:text-primary shrink-0 transition-all duration-300">
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </div>

                {/* Fluent Visual Connectors: Dotted Flow representing Budget, Size & Client */}
                <div className="relative pl-6 space-y-4 mb-6 before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border/60 before:border-dashed before:border-l">
                    
                    {/* Budget Node */}
                    <div className="relative flex items-center gap-3 group/node">
                        <div className="absolute -left-[21px] w-2.5 h-2.5 rounded-full border border-background bg-emerald-500 ring-4 ring-emerald-500/10 group-hover:scale-110 transition-transform" />
                        <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/80 flex items-center gap-1">
                                <IndianRupee size={8} className="text-emerald-500" /> Budget Limit
                            </p>
                            <p className="text-xs font-black text-foreground mt-0.5">
                                {getPriceRange(req.minPrice, req.maxPrice)}
                            </p>
                        </div>
                    </div>

                    {/* Size Node */}
                    <div className="relative flex items-center gap-3 group/node">
                        <div className="absolute -left-[21px] w-2.5 h-2.5 rounded-full border border-background bg-blue-500 ring-4 ring-blue-500/10 group-hover:scale-110 transition-transform" />
                        <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/80 flex items-center gap-1">
                                <Ruler size={8} className="text-blue-500" /> Required Area
                            </p>
                            <p className="text-xs font-black text-foreground mt-0.5">
                                {getMeasurementRange(req.minMeasurement, req.maxMeasurement, req.measurementType)}
                            </p>
                        </div>
                    </div>

                    {/* Client Node */}
                    <div className="relative flex items-center gap-3 group/node">
                        <div className="absolute -left-[21px] w-2.5 h-2.5 rounded-full border border-background bg-amber-500 ring-4 ring-amber-500/10 group-hover:scale-110 transition-transform" />
                        <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/80 flex items-center gap-1">
                                <User size={8} className="text-amber-500" /> Client
                            </p>
                            <p className="text-xs font-black text-foreground mt-0.5">
                                {req.creator?.name || "Private Client"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="mt-auto pt-4 border-t border-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 border border-border shadow-xs">
                            <AvatarImage src={req.creator?.image || ""} className="object-cover" />
                            <AvatarFallback className="bg-primary/10 text-primary font-black text-[9px]">
                                {req.creator?.name?.charAt(0) || "C"}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-[10px] font-bold text-muted-foreground">
                            {req.creator?.name || "Client"}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                        <Clock size={10} className="text-muted-foreground/40" />
                        {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
                    </div>
                </div>
            </Link>
        </Card>
    );
}

