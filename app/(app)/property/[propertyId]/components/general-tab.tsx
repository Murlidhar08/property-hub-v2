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
    Ruler
} from "lucide-react";
import { format } from "date-fns";
import { ReadOnlyGoogleMap } from "./read-only-google-map";
import Link from "next/link";
import { PropertyMediaGallery } from "../../components/property-media-gallery";
import { formatInWords } from "@/utility/common-function";

export default async function GeneralTab({ property }: { property: any }) {
    const mediaItems = (property.documents || []).filter((d: any) => d.documentType === "preview");

    const sellStatus = property.status.find((s: any) => s.status === 'sell');
    const rentStatus = property.status.find((s: any) => s.status === 'rent');
    const primaryStatus = sellStatus || rentStatus || property.status[0];

    const agent = property.users.find((u: any) => u.userType === 0)?.user;
    const owner = property.users.find((u: any) => u.userType === 2)?.user;

    return (
        <div className="space-y-6">
            {/* Media Gallery */}
            <PropertyMediaGallery items={mediaItems} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card className="p-6 rounded-3xl border-border bg-card/50 shadow-sm">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                <FileText size={12} /> Title
                            </p>
                            <p className="text-sm font-bold text-foreground">{property.title}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                <Hash size={12} /> Listing ID
                            </p>
                            <p className="text-sm font-bold text-primary">{property.id}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                <Building2 size={12} /> Type
                            </p>
                            <p className="text-sm font-bold text-foreground capitalize">{property.propertyType}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                <MapPin size={12} /> Address
                            </p>
                            <p className="text-sm font-bold text-foreground truncate">{property.address}</p>
                        </div>
                    </div>
                </Card>

                {/* Pricing */}
                <Card className="p-6 rounded-3xl border-border bg-card shadow-sm">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6">Pricing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                        {/* Sell Price */}
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border">
                                <CircleDollarSign size={20} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sell Price</p>
                                <p className="text-sm font-bold text-foreground">
                                    {sellStatus?.price ? `${formatInWords(Number(sellStatus.price))} / ${property.measurementType}` : "N/A"}
                                </p>
                            </div>
                        </div>

                        {/* Total Sell Price */}
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border">
                                <CircleDollarSign size={20} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Sell Price</p>
                                <p className="text-sm font-bold text-foreground">
                                    {sellStatus?.price ? formatInWords(Number(sellStatus.price) * Number(property.measurementValue)) : "N/A"}
                                </p>
                            </div>
                        </div>

                        {/* Rent Price */}
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border">
                                <CircleDollarSign size={20} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rent Price</p>
                                <p className="text-sm font-bold text-foreground">
                                    {rentStatus?.price ? `${formatInWords(Number(rentStatus.price))} / ${rentStatus.durationType || 'Month'}` : "N/A"}
                                </p>
                            </div>
                        </div>

                        {/* Measurement */}
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border">
                                <Ruler size={20} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Measurement</p>
                                <p className="text-sm font-bold text-foreground">{property.measurementValue} {property.measurementType}</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Ownership */}
            <Card className="p-6 rounded-3xl border-border bg-card/50 shadow-sm mt-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6">Ownership</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                <ShieldCheck size={12} /> Status
                            </p>
                            <p className="text-sm font-bold text-foreground capitalize">{primaryStatus?.status || "Draft"}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                <Briefcase size={12} /> Agent
                            </p>
                            {agent ? (
                                <Link href={`/user/${agent.id}` as any} className="text-sm font-bold text-primary hover:underline">
                                    {agent.name}
                                </Link>
                            ) : (
                                <p className="text-sm font-bold text-primary">Unassigned</p>
                            )}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                            <User size={12} /> Owner
                        </p>
                        {owner ? (
                            <Link href={`/user/${owner.id}` as any} className="text-sm font-bold text-primary hover:underline">
                                {owner.name}
                            </Link>
                        ) : (
                            <p className="text-sm font-bold text-primary">Private</p>
                        )}
                    </div>
                </div>
            </Card>

            {/* Metadata */}
            <Card className="p-6 rounded-3xl border-border bg-card/50 shadow-sm mt-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6">Metadata</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                <Calendar size={12} /> Created
                            </p>
                            <p className="text-sm font-bold text-foreground">
                                {format(new Date(property.createdAt), "cccc")}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                <User size={12} /> Created By
                            </p>
                            <Link href={`/user/${property.createdBy}` as any} className="text-sm font-bold text-foreground hover:text-primary hover:underline">
                                {property.creator.name}
                            </Link>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                <User size={12} /> Updated By
                            </p>
                            <Link href={`/user/${property.updatedBy || property.createdBy}` as any} className="text-sm font-bold text-foreground hover:text-primary hover:underline">
                                {property.updater?.name || property.creator.name}
                            </Link>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                <Clock size={12} /> Created At
                            </p>
                            <p className="text-sm font-bold text-foreground">
                                {format(new Date(property.createdAt), "yyyy-MM-dd HH:mm:ss")}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                <Clock size={12} /> Updated At
                            </p>
                            <p className="text-sm font-bold text-foreground">
                                {format(new Date(property.updatedAt), "yyyy-MM-dd HH:mm:ss")}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Location */}
            <Card className="p-6 rounded-3xl border-border bg-card/50 shadow-sm mt-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                    <MapPin size={16} /> Location
                </h3>
                <div className="h-96 bg-muted rounded-2xl flex items-center justify-center relative overflow-hidden group border border-border">
                    {property.coordinates ? (
                        <ReadOnlyGoogleMap
                            apiKey={process.env.GOOGLE_MAPS_API || ""}
                            center={property.coordinates as any}
                        />
                    ) : (
                        <>
                            <img
                                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200"
                                className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-700"
                                alt="Map Placeholder"
                            />
                            <div className="z-10 bg-background/80 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-border shadow-xl">
                                Location Not Set
                            </div>
                        </>
                    )}
                </div>
            </Card>
        </div>
    )
}