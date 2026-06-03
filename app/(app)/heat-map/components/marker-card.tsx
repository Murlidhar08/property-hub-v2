"use client";

import { Button } from "@/components/ui/button";
import { cn, getFileUrl } from "@/lib/utils";
import { rupeeToWords } from "@/utility/amount-fn";
import { formatIndianNumber } from "@/utility/formatters";
import { ExternalLink, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useState } from "react";

interface MarkerCardProps {
    property: any;
    threshold: {
        intermediate: number;
        danger: number;
    };
}

export const MarkerCard = ({ property, threshold }: MarkerCardProps) => {
    const router = useRouter();
    const [isSelected, setIsSelected] = useState(false);

    // In the new project, property.status is a mapping
    // We filter for "sell" status price
    const sellStatusMapping = property.status?.find((s: any) => s.status === "sell");
    const price = sellStatusMapping?.price ? Number(sellStatusMapping.price) : 0;
    const measurementValue = property.measurementValue ? Number(property.measurementValue) : 0;
    const totalPrice = price * measurementValue;

    const formattedPrice = () => {
        if (!price) return "₹?";
        return `₹${formatIndianNumber(price)} / ${property.measurementType || ""}`;
    };

    // Determine background color based on thresholds
    let bgColor = "bg-emerald-500 shadow-emerald-500/20";
    if (!price) bgColor = "bg-sky-500 shadow-sky-500/20";
    else if (price >= threshold.danger) bgColor = "bg-rose-500 shadow-rose-500/20";
    else if (price > threshold.intermediate) bgColor = "bg-amber-500 shadow-amber-500/20";

    const getStatusUI = (status: string) => {
        switch (status) {
            case "sell": return { label: "Selling", color: "bg-emerald-500" };
            case "soldout": return { label: "Sold Out", color: "bg-rose-500" };
            case "rent": return { label: "Rent", color: "bg-emerald-500" };
            case "rented": return { label: "Rented", color: "bg-rose-500" };
            case "hold": return { label: "On Hold", color: "bg-amber-500" };
            default: return { label: status, color: "bg-sky-500" };
        }
    };

    const statusUI = getStatusUI("sell"); // Based on our fetch logic

    const toggleCard = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsSelected(!isSelected);
    };

    const previewDoc = property.documents?.[0];
    const imageUrl = previewDoc ? getFileUrl(previewDoc.relativePath) : "";

    return (
        <div className="relative inline-block isolate">
            {/* Expanded Card */}
            {isSelected && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-4 w-72 bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white/20 backdrop-blur-xl z-50 animate-in fade-in zoom-in duration-300">
                    <div className="relative h-32 w-full bg-slate-100 overflow-hidden">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={property.title}
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-200">
                                <p className="text-[10px] font-black uppercase text-slate-400">No Preview</p>
                            </div>
                        )}
                        <div className="absolute top-4 left-4">
                            <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/20">
                                {property.propertyType}
                            </span>
                        </div>
                        <button
                            onClick={toggleCard}
                            className="absolute top-3 right-3 bg-white/90 backdrop-blur-md rounded-full p-2 shadow-xl hover:bg-white transition-all hover:scale-110"
                        >
                            <X size={14} className="text-slate-900" />
                        </button>
                    </div>

                    <div className="p-5 space-y-3">
                        <div className="flex justify-between items-start">
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Valuation</p>
                                <h4 className="text-lg font-black text-slate-900 leading-none" title={rupeeToWords(totalPrice)}>
                                    ₹{formatIndianNumber(totalPrice)}
                                </h4>
                            </div>
                            <span className={cn("px-2.5 py-1 text-[9px] font-black text-white rounded-lg uppercase tracking-widest", statusUI.color)}>
                                {statusUI.label}
                            </span>
                        </div>

                        <div>
                            <h3 className="text-sm font-black text-slate-800 truncate">{property.title}</h3>
                            <p className="text-xs font-bold text-slate-500 line-clamp-1 mt-0.5">{property.address}</p>
                        </div>

                        <Button
                            onClick={() => router.push(`/property/${property.id}` as any)}
                            className="w-full h-10 rounded-xl bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest transition-all hover:shadow-lg"
                        >
                            <ExternalLink size={14} className="mr-2" /> View Asset
                        </Button>
                    </div>
                </div>
            )}

            {/* Price Marker Trigger */}
            <div
                onClick={toggleCard}
                className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-white shadow-xl cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 whitespace-nowrap select-none",
                    bgColor,
                    isSelected ? "ring-4 ring-white" : ""
                )}
            >
                <span className="text-white text-[11px] font-black tracking-tight drop-shadow-sm uppercase">
                    {formattedPrice()}
                </span>
            </div>
        </div>
    );
};

export default memo(MarkerCard);
