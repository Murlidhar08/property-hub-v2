import { Card } from "@/components/ui/card";
import {
    MapPin,
    Building2,
    User,
    ShieldCheck,
    Briefcase,
    Calendar,
    Clock,
    Hash,
    FileText,
    CircleDollarSign,
    Ruler,
    History,
    ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { ReadOnlyGoogleMap } from "./read-only-google-map";
import Link from "next/link";
import { PropertyMediaGallery } from "../../components/property-media-gallery";
import { formatInWords } from "@/utility/common-function";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatUserCurrency } from "@/utility/currency-fn";

export default async function GeneralTab({ property }: { property: any }) {
    const mediaItems = (property.documents || []).filter((d: any) => d.documentType === "preview");

    const sellStatus = property.status.find((s: any) => s.status === 'sell');
    const rentStatus = property.status.find((s: any) => s.status === 'rent');
    const primaryStatus = sellStatus || rentStatus || property.status[0];

    const agent = property.users.find((u: any) => u.userType === 0)?.user;
    const owner = property.users.find((u: any) => u.userType === 2)?.user;

    // Pick dynamic gradient based on property type
    const typeGradients: Record<string, string> = {
        apartment: "from-blue-500 to-cyan-500",
        house: "from-emerald-500 to-teal-500",
        villa: "from-amber-500 to-orange-500",
        land: "from-orange-500 to-red-500",
        commercial: "from-violet-500 to-purple-500",
    };
    const gradient = typeGradients[property.propertyType?.toLowerCase()] || "from-primary to-indigo-500";

    const hasSellPrice = !!sellStatus?.price;
    const hasRentPrice = !!rentStatus?.price;

    return (
        <div className="space-y-8">
            {/* Media Gallery */}
            <PropertyMediaGallery items={mediaItems} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main fluent details card stack */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Fluent Header Card: Title, Status, and Price details */}
                    <Card className="overflow-hidden rounded-[2rem] border border-border bg-card/60 backdrop-blur-md shadow-lg shadow-black/[0.02] p-6 hover:shadow-xl transition-all duration-300">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="flex gap-4 items-start">
                                <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${gradient} flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/10`}>
                                    <Building2 size={24} className="animate-pulse" />
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex flex-col flex-wrap gap-2 items-start">
                                        <Badge variant="outline" className="font-bold border-primary/20 text-primary capitalize px-2.5 py-0.5">
                                            {property.propertyType}
                                        </Badge>
                                        <Badge variant="secondary" className="font-bold px-2.5 py-0.5">
                                            ID: #{property.id}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Prices display */}
                            <div className="sm:text-right shrink-0 flex flex-col items-start sm:items-end gap-1">
                                {hasSellPrice && (
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sell Price</p>
                                        <p className="text-2xl font-black text-emerald-500 tracking-tight">
                                            {formatUserCurrency(Number(sellStatus.price))}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground/80 font-bold">
                                            / {property.measurementType}
                                        </p>
                                    </div>
                                )}
                                {hasRentPrice && (
                                    <div className={hasSellPrice ? "mt-2 pt-2 border-t border-border w-full text-right" : ""}>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rent Price</p>
                                        <p className="text-xl font-black text-blue-500 tracking-tight">
                                            {formatUserCurrency(Number(rentStatus.price))}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground/80 font-bold">
                                            / {rentStatus.durationType || 'Month'}
                                        </p>
                                    </div>
                                )}
                                {!hasSellPrice && !hasRentPrice && (
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</p>
                                        <Badge className="font-bold uppercase bg-amber-500 text-white mt-1 px-3 py-1">
                                            {primaryStatus?.status || "Draft"}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Extra measurement detail inline */}
                        <div className="mt-6 pt-5 border-t border-border/60 flex justify-between gap-4 text-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground">
                                    <Ruler size={16} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Size / Area</p>
                                    <p className="font-bold text-foreground">{property.measurementValue} {property.measurementType}</p>
                                </div>
                            </div>
                            {hasSellPrice && (
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground">
                                        <CircleDollarSign size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Total Sell Value</p>
                                        <p className="font-bold text-foreground">
                                            {formatUserCurrency(Number(sellStatus.price) * Number(property.measurementValue))}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Fluent visual path card (Inspired by Syracuse -> Jamesville path) */}
                    <Card className="rounded-[2rem] border border-border bg-card/60 backdrop-blur-md shadow-lg shadow-black/[0.02] p-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/80 mb-6 flex items-center gap-2">
                            <ShieldCheck size={14} className="text-primary" /> Relationship & Location Flow
                        </h3>

                        <div className="relative pl-8 space-y-8 before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-linear-to-b before:from-emerald-500 before:via-blue-500 before:to-muted-foreground/30 before:border-dashed before:border-l-2">
                            {/* Owner Node */}
                            <div className="relative flex items-center gap-4 group">
                                <div className="absolute -left-[31px] w-8 h-8 rounded-full border-4 border-background bg-emerald-500 flex items-center justify-center shadow-md">
                                    <User size={12} className="text-white" />
                                </div>
                                <div className="flex-1 flex justify-between items-center bg-background/40 hover:bg-background/80 border border-border/50 rounded-2xl p-3.5 transition-all duration-300">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border border-border shadow-sm">
                                            <AvatarImage src={owner?.image || ""} className="object-cover" />
                                            <AvatarFallback className="bg-emerald-500/10 text-emerald-600 font-black">
                                                {owner?.name?.charAt(0) || "P"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Owner</p>
                                            {owner ? (
                                                <Link href={`/user/${owner.id}` as any} className="text-sm font-bold text-foreground hover:text-primary transition-colors flex items-center gap-0.5 group/link">
                                                    {owner.name}
                                                    <ChevronRight size={14} className="opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-300" />
                                                </Link>
                                            ) : (
                                                <p className="text-sm font-bold text-muted-foreground">Private Listing</p>
                                            )}
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="border-emerald-500/20 text-emerald-600 font-bold bg-emerald-500/5">Primary</Badge>
                                </div>
                            </div>

                            {/* Agent Node */}
                            <div className="relative flex items-center gap-4 group">
                                <div className="absolute -left-[31px] w-8 h-8 rounded-full border-4 border-background bg-blue-500 flex items-center justify-center shadow-md">
                                    <Briefcase size={12} className="text-white" />
                                </div>
                                <div className="flex-1 flex justify-between items-center bg-background/40 hover:bg-background/80 border border-border/50 rounded-2xl p-3.5 transition-all duration-300">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border border-border shadow-sm">
                                            <AvatarImage src={agent?.image || ""} className="object-cover" />
                                            <AvatarFallback className="bg-blue-500/10 text-blue-600 font-black">
                                                {agent?.name?.charAt(0) || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-blue-600">Assigned Agent</p>
                                            {agent ? (
                                                <Link href={`/user/${agent.id}` as any} className="text-sm font-bold text-foreground hover:text-primary transition-colors flex items-center gap-0.5 group/link">
                                                    {agent.name}
                                                    <ChevronRight size={14} className="opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-300" />
                                                </Link>
                                            ) : (
                                                <p className="text-sm font-bold text-muted-foreground">Unassigned</p>
                                            )}
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="border-blue-500/20 text-blue-600 font-bold bg-blue-500/5">Manager</Badge>
                                </div>
                            </div>

                            {/* Location Node */}
                            <div className="relative flex items-center gap-4 group">
                                <div className="absolute -left-[31px] w-8 h-8 rounded-full border-4 border-background bg-muted-foreground flex items-center justify-center shadow-md">
                                    <MapPin size={12} className="text-white" />
                                </div>
                                <div className="flex-1 bg-background/40 hover:bg-background/80 border border-border/50 rounded-2xl p-3.5 transition-all duration-300">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Location Address</p>
                                    <p className="text-sm font-bold text-foreground mt-1 group-hover:text-primary transition-colors line-clamp-2">
                                        {property.address}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right side: Map, Timeline feed */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Location Map Card */}
                    <Card className="overflow-hidden rounded-[2rem] border border-border bg-card/60 backdrop-blur-md shadow-lg shadow-black/[0.02] p-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/80 mb-3 px-2 flex items-center gap-2">
                            <MapPin size={14} className="text-rose-500" /> Interactive Map View
                        </h3>
                        <div className="h-72 bg-muted/50 rounded-2xl flex items-center justify-center relative overflow-hidden group border border-border">
                            {property.coordinates ? (
                                <ReadOnlyGoogleMap
                                    apiKey={process.env.GOOGLE_MAPS_API || ""}
                                    center={property.coordinates as any}
                                />
                            ) : (
                                <>
                                    <img
                                        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200"
                                        className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale group-hover:grayscale-0 transition-all duration-700"
                                        alt="Map Placeholder"
                                    />
                                    <div className="z-10 bg-background/90 backdrop-blur-md px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-border shadow-xl">
                                        Coordinates Not Configured
                                    </div>
                                </>
                            )}
                        </div>
                    </Card>

                    {/* Metadata Timeline Card */}
                    <Card className="rounded-[2rem] border border-border bg-card/60 backdrop-blur-md shadow-lg shadow-black/[0.02] p-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/80 mb-6 flex items-center gap-2">
                            <History size={14} className="text-primary animate-spin" style={{ animationDuration: '6s' }} /> Audit Log & Lifecycle
                        </h3>

                        <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border/60">
                            {/* Created log */}
                            <div className="relative group">
                                <div className="absolute -left-[20px] w-3 h-3 rounded-full border-2 border-background bg-indigo-500 ring-4 ring-indigo-500/10 group-hover:scale-125 transition-transform duration-300" />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                        Created On
                                    </p>
                                    <p className="text-sm font-bold text-foreground">
                                        {format(new Date(property.createdAt), "cccc, MMM dd, yyyy")}
                                    </p>
                                    <p className="text-xs text-muted-foreground/80 font-medium">
                                        By{" "}
                                        <Link href={`/user/${property.createdBy}` as any} className="text-primary hover:underline font-semibold">
                                            {property.creator?.name || "System"}
                                        </Link>{" "}
                                        at {format(new Date(property.createdAt), "hh:mm a")}
                                    </p>
                                </div>
                            </div>

                            {/* Updated log */}
                            <div className="relative group">
                                <div className="absolute -left-[20px] w-3 h-3 rounded-full border-2 border-background bg-amber-500 ring-4 ring-amber-500/10 group-hover:scale-125 transition-transform duration-300" />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                        Last Updated On
                                    </p>
                                    <p className="text-sm font-bold text-foreground">
                                        {format(new Date(property.updatedAt), "cccc, MMM dd, yyyy")}
                                    </p>
                                    <p className="text-xs text-muted-foreground/80 font-medium">
                                        By{" "}
                                        <Link href={`/user/${property.updatedBy || property.createdBy}` as any} className="text-primary hover:underline font-semibold">
                                            {property.updater?.name || property.creator?.name || "System"}
                                        </Link>{" "}
                                        at {format(new Date(property.updatedAt), "hh:mm a")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
