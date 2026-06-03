"use client";

import { PropertyStatus, PropertyType } from "@/lib/generated/prisma/browser";
import { cn, getFileUrl } from "@/lib/utils";
import { formatCurrency } from "@/utility/amount-fn";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
    IndianRupee,
    Layers,
    Layout,
    MapPin
} from "lucide-react";
import Link from "next/link";
import { PropertyHeaderMenu } from "../[propertyId]/components/property-header-menu";
import { typeIcons } from "@/components/property/property-icons";
import { PropertyInput } from "@/components/property/property-input";

export function PropertiesGrid({ properties }: { properties: PropertyInput[] }) {
    const acc = properties.reduce((acc, property) => {
        const type = property.propertyType;
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(property);
        return acc;
    }, {} as Record<PropertyType, PropertyInput[]>);

    return (
        <div className="space-y-20">
            {Object.entries(acc).map(([type, properties]) => {
                return <PropertyGroup key={type} type={type as PropertyType} properties={properties} />
            })}
        </div>
    );
}

const getPropertyTypeLabel = (type: PropertyType) => {
    switch (type) {
        case PropertyType.agricultural:
            return "Agricultural Lands";
        case PropertyType.nonagricultural:
            return "Non-Agricultural Lands";
        case PropertyType.hotel:
            return "Hotels & Commercial";
        case PropertyType.tenament:
            return "Tenaments";
        case PropertyType.flat:
            return "Flats & Apartments";
        case PropertyType.plot:
            return "Plots & Layouts";
        default:
            return "Properties";
    }
}

const PropertyGroup = ({ type, properties }: { type: PropertyType, properties: PropertyInput[] }) => {
    return (
        <div className="mb-20 last:mb-0">
            <div className="mb-10">
                <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3 uppercase">
                    {getPropertyTypeLabel(type)}
                    <div className="h-1 flex-1 bg-border rounded-full max-w-xs ml-4" />
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {properties.map((property) => {
                    return (
                        <PropertyCard key={property.id} property={property} />
                    );
                })}
            </div>
        </div>
    )
}

const getStatusColors = (status: PropertyStatus) => {
    switch (status) {
        case PropertyStatus.rent:
            return "text-blue-600 bg-blue-50/95 border-blue-100";
        case PropertyStatus.rented:
            return "text-slate-600 bg-slate-50/95 border-slate-100";
        case PropertyStatus.sell:
            return "text-emerald-600 bg-emerald-50/95 border-emerald-100";
        case PropertyStatus.soldout:
            return "text-rose-600 bg-rose-50/95 border-rose-100";
        case PropertyStatus.draft:
            return "text-gray-500 bg-gray-50/95 border-gray-100";
        case PropertyStatus.hold:
            return "text-amber-600 bg-amber-50/95 border-amber-200";
        default:
            return "text-primary bg-white/95 border-slate-100";
    }
};

const PropertyCard = ({ property }: { property: PropertyInput }) => {
    const priceStatus = property.status.find((s: any) => s.price);
    const firstImg = property.documents?.[0]?.relativePath;
    const status = property.status[0]?.status || "Selling";

    return (
        <motion.div
            key={property.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group"
        >
            <div className="relative bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500 h-full flex flex-col overflow-hidden">
                <div className="absolute top-4 right-4 z-50">
                    <PropertyHeaderMenu propertyId={property.id} />
                </div>

                <Link href={`/property/${property.id}` as any} className="flex-1 flex flex-col">
                    {/* Compact Image Section */}
                    <div className="relative aspect-video overflow-hidden shrink-0 bg-slate-50">
                        {/* Status Badge */}
                        <div className="absolute top-3 left-3 z-10">
                            <div className={cn(
                                "backdrop-blur-sm px-3 py-1 rounded-full shadow-xs border transition-colors duration-300",
                                getStatusColors(status)
                            )}>
                                <span className="text-[9px] font-black uppercase tracking-widest">
                                    {status}
                                </span>
                            </div>
                        </div>

                        {firstImg ? (
                            <img
                                src={getFileUrl(firstImg)}
                                alt={property.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-50 relative group-hover:bg-slate-100 transition-colors duration-500">
                                <div className="p-5 rounded-2xl bg-white shadow-sm transition-transform duration-500 group-hover:scale-110">
                                    {typeIcons[property.propertyType] || <Layout className="text-primary" size={32} />}
                                </div>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    {/* Compact Content Section */}
                    <div className="px-4 py-4 flex-1 flex flex-col">
                        <div className="mb-3">
                            <h3 className="text-slate-900 text-base font-black tracking-tight group-hover:text-primary transition-colors uppercase truncate mb-1">
                                {property.title}
                            </h3>
                            <div className="flex items-center text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                                <MapPin size={10} className="mr-1 text-primary/60" />
                                <span className="truncate">{property.address}</span>
                            </div>
                        </div>

                        <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Area</span>
                                <div className="flex items-center text-slate-900 font-black text-xs">
                                    <Layers size={12} className="mr-1 text-primary/40" />
                                    {Number(property.measurementValue) || 0} {property.measurementType || ""}
                                </div>
                            </div>

                            <div className="flex flex-col items-end">
                                <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Price</span>
                                <div className="flex items-center text-emerald-600 font-black text-sm tabular-nums">
                                    <IndianRupee size={12} className="mr-0.5" />
                                    {priceStatus?.price ? formatCurrency(Number(priceStatus.price)) : "?"}
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 flex items-center justify-end">
                            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                                {formatDistanceToNow(new Date(property.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                    </div>
                </Link>
            </div>
        </motion.div>
    )
}

