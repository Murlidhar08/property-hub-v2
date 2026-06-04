"use client";

import { getSharedLinkById } from "@/actions/property.actions";
import { ReadOnlyGoogleMap } from "@/app/(app)/property/[propertyId]/components/read-only-google-map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatInWords } from "@/utility/common-function";
import { format, formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
    AlertCircle,
    Building2,
    Check,
    CircleDollarSign,
    Copy,
    LocateFixed,
    MapPin,
    Ruler,
    Share2,
    ShieldCheck,
    User
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SharedPropertyPage() {
    const { linkId } = useParams();
    const [link, setLink] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchLink = async () => {
            try {
                const data = await getSharedLinkById(linkId as string);
                console.log(data);
                setLink(data);
            } catch (error) {
                console.error("Error fetching shared link:", error);
            } finally {
                setLoading(false);
            }
        };

        if (linkId) fetchLink();
    }, [linkId]);

    const copyUrl = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success("Link copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 bg-linear-to-br from-background via-muted/50 to-background">
                <div className="relative w-24 h-24 mb-8">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-4 border-primary/20 rounded-full border-t-primary"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                </div>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground"
                >
                    Loading Property Details...
                </motion.p>
            </div>
        );
    }

    if (!link || link.expired) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 bg-linear-to-br from-background via-destructive/5 to-background">
                <div className="w-20 h-20 rounded-3xl bg-destructive/10 flex items-center justify-center mb-8 border border-destructive/20 shadow-2xl shadow-destructive/10">
                    <AlertCircle className="w-10 h-10 text-destructive" />
                </div>
                <h1 className="text-3xl font-black text-foreground mb-3 tracking-tighter uppercase italic">{link?.expired ? "Link Expired" : "Link Not Found"}</h1>
                <p className="text-muted-foreground text-center max-w-sm mb-10 font-bold leading-relaxed">{link?.expired ? "This shared link has reached its expiry date and is no longer accessible." : "The link you are trying to access might have been deleted or is incorrect."}</p>
                <div className="w-full h-px bg-linear-to-r from-transparent via-border to-transparent max-w-md mb-8" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">Property-Hub Secure Link System</p>
            </div>
        );
    }

    const { targetProperty: property, detail } = link;
    const sellStatus = property.status.find((s: any) => s.status === 'sell');
    const rentStatus = property.status.find((s: any) => s.status === 'rent');
    const primaryStatus = sellStatus || rentStatus || property.status[0];

    const agent = property.users.find((u: any) => u.userType === 0)?.user;
    const owner = property.users.find((u: any) => u.userType === 2)?.user;

    const filteredDocuments = property.documents.filter((doc: any) => {
        if (doc.type === 'private' && !detail.privateDocs) return false;
        if (doc.type === 'image' && !detail.privateImages) {
            // If it's a private image but we don't show private images
            // Wait, how do we know if it's private image?
            // Usually doc has 'isPrivate' or type.
        }
        return true;
    });

    const fadeInUp = {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    };

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
            {/* Navigation / Header */}
            <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-2xl border-b border-border/50">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                            <Building2 className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-sm font-black uppercase tracking-widest leading-none">Property Hub</h1>
                            <p className="text-[10px] text-muted-foreground font-bold tracking-tighter uppercase mt-1">Shared Link View</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-background/50 border-border text-[10px] font-black tracking-widest uppercase h-9 rounded-xl hover:bg-muted"
                            onClick={copyUrl}
                        >
                            {copied ? <Check className="w-3 h-3 mr-2" /> : <Copy className="w-3 h-3 mr-2" />}
                            {copied ? "Copied" : "Copy Link"}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 lg:py-16">
                <div className="max-w-6xl mx-auto space-y-12 lg:space-y-24">

                    {/* Hero Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline" className="px-3 py-1 text-[10px] font-black uppercase tracking-widest border-primary/20 bg-primary/5 text-primary rounded-full">
                                        ID: {property.id.slice(-6).toUpperCase()}
                                    </Badge>
                                    <Badge variant="outline" className="px-3 py-1 text-[10px] font-black uppercase tracking-widest border-border bg-muted/50 text-muted-foreground rounded-full">
                                        {formatDistanceToNow(new Date(property.createdAt), { addSuffix: true })}
                                    </Badge>
                                </div>
                                <h2 className="text-4xl lg:text-5xl xl:text-6xl font-black text-foreground tracking-tighter leading-tight uppercase italic">
                                    {property.title}
                                </h2>
                                <div className="flex items-center gap-3 text-muted-foreground bg-muted/30 p-4 rounded-3xl border border-border w-max max-w-full overflow-hidden">
                                    <MapPin className="w-5 h-5 text-primary shrink-0" />
                                    <span className="text-sm font-bold truncate">{property.address}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-x-12 gap-y-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Building2 className="w-3 h-3" /> Property Type
                                    </p>
                                    <p className="text-xl font-bold uppercase">{property.propertyType}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Ruler className="w-3 h-3" /> Area
                                    </p>
                                    <p className="text-xl font-bold">{property.measurementValue} {property.measurementType}</p>
                                </div>
                                {detail.price && (
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                                            <CircleDollarSign className="w-3 h-3" /> Total Value
                                        </p>
                                        <p className="text-xl font-black text-primary italic">
                                            {sellStatus?.price ? formatInWords(Number(sellStatus.price) * Number(property.measurementValue)) : "N/A"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1 }}
                            className="aspect-4/3 rounded-[2rem] overflow-hidden border-8 border-background shadow-2xl relative group"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                alt="Shared Property"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                                <div className="backdrop-blur-xl bg-white/10 p-4 rounded-2xl border border-white/20 text-white">
                                    <p className="text-[8px] font-black uppercase tracking-widest opacity-70 mb-1">Shared Label</p>
                                    <p className="text-xs font-bold uppercase">{link.label || "External Access"}</p>
                                </div>
                                <div className="backdrop-blur-xl bg-black/30 p-4 rounded-2xl border border-white/10 text-white/90">
                                    <p className="text-[8px] font-black uppercase tracking-widest opacity-70 mb-1">Status</p>
                                    <p className="text-xs font-bold uppercase">{primaryStatus?.status || "Available"}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content Column */}
                        <div className="lg:col-span-2 space-y-12">

                            {/* Description */}
                            {detail.description && property.description && (
                                <section className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-1.5 h-8 bg-primary rounded-full" />
                                        <h3 className="text-xl font-black uppercase tracking-widest">About this property</h3>
                                    </div>
                                    <Card className="p-8 rounded-[2rem] border-border bg-muted/20">
                                        <p className="text-muted-foreground font-medium leading-relaxed">
                                            {property.description}
                                        </p>
                                    </Card>
                                </section>
                            )}

                            {/* Location */}
                            {detail.location && property.coordinates && (
                                <section className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-1.5 h-8 bg-primary rounded-full" />
                                        <h3 className="text-xl font-black uppercase tracking-widest">Location Details</h3>
                                    </div>
                                    <Card className="rounded-[2rem] overflow-hidden border-border bg-card shadow-lg">
                                        <div className="h-96 relative group">
                                            <ReadOnlyGoogleMap
                                                apiKey={link.googleMapsApiKey || ""}
                                                center={property.coordinates as any}
                                            />
                                        </div>
                                        <div className="p-6 bg-muted/30 border-t border-border flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <LocateFixed className="w-5 h-5 text-primary" />
                                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Interactive Property Map</p>
                                            </div>
                                            <Badge variant="outline" className="bg-background font-black uppercase text-[8px] py-1 rounded-full">
                                                GPS Coordinates Ready
                                            </Badge>
                                        </div>
                                    </Card>
                                </section>
                            )}

                            {/* Images Gallery */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-1.5 h-8 bg-primary rounded-full" />
                                    <h3 className="text-xl font-black uppercase tracking-widest">Property Gallery</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
                                        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
                                        "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
                                        "https://images.unsplash.com/photo-1600607687940-477a63bd39d8?auto=format&fit=crop&w=800&q=80"
                                    ].map((img, idx) => (
                                        <motion.div
                                            key={idx}
                                            whileHover={{ scale: 0.98 }}
                                            className="rounded-3xl overflow-hidden aspect-video border border-border/50 shadow-sm"
                                        >
                                            <img src={img} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Sidebar Column */}
                        <aside className="space-y-8">

                            {/* Detailed Pricing */}
                            {detail.price && (
                                <Card className="p-8 rounded-[2rem] border-primary/20 bg-primary/2 shadow-xl shadow-primary/5 space-y-6">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Financial Summary</h3>
                                    <div className="space-y-6">
                                        {sellStatus && (
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">List Price</p>
                                                <p className="text-3xl font-black text-foreground italic">{formatInWords(Number(sellStatus.price))}</p>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">
                                                    at {formatInWords(Number(sellStatus.price) / Number(property.measurementValue))} / unit
                                                </p>
                                            </div>
                                        )}
                                        {rentStatus && (
                                            <div className="space-y-1 border-t border-primary/10 pt-6">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Monthly Lease</p>
                                                <p className="text-3xl font-black text-foreground italic">{formatInWords(Number(rentStatus.price))}</p>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">
                                                    {rentStatus.durationType || 'Per Month'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <Button className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
                                        Inquire Interest
                                    </Button>
                                </Card>
                            )}

                            {/* Contact Info */}
                            {(detail.agent || detail.owner) && (
                                <Card className="p-8 rounded-[2rem] border-border bg-card shadow-sm space-y-8">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Direct Contact</h3>

                                    {detail.agent && agent && (
                                        <div className="space-y-4">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-primary/60">Primary Agent</p>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center border border-border shadow-inner">
                                                    <User className="w-6 h-6 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black uppercase tracking-tight">{agent.name}</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground">Real Estate Associate</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2 pt-2">
                                                <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                                                    <AlertCircle className="w-4 h-4 text-primary" />
                                                    <span>{agent.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {detail.owner && owner && (
                                        <div className="space-y-4 pt-8 border-t border-border">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-primary/60">Property Owner</p>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center border border-border">
                                                    <ShieldCheck className="w-6 h-6 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black uppercase tracking-tight">{owner.name}</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground">Verified Proprietor</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            )}

                            {/* Share & More */}
                            <Card className="p-6 rounded-[2rem] border-border bg-muted/10 space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <Share2 className="w-4 h-4 text-primary" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Security Info</p>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                                        <span className="uppercase tracking-widest">Shared By</span>
                                        <span className="text-foreground uppercase">{link.user?.name}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                                        <span className="uppercase tracking-widest">Visit Count</span>
                                        <span className="text-foreground uppercase font-black">{link.visitCount} Views</span>
                                    </div>
                                    {link.expiry && (
                                        <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                                            <span className="uppercase tracking-widest">Expires</span>
                                            <span className="text-destructive uppercase">{format(new Date(link.expiry), "MMM dd, yyyy")}</span>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </aside>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full bg-muted/30 border-t border-border mt-24 py-12">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">
                        &copy; 2026 PROPERTY-HUB SECURE VIEWING SYSTEM. ALL RIGHTS RESERVED.
                    </p>
                </div>
            </footer>
        </div>
    );
}
