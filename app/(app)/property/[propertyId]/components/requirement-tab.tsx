import { getMatchedRequirementsById } from "@/actions/property.actions";
import { typeIcons } from "@/components/property/property-icons";
import RequirementCard from "@/components/requirement/requirement-card";
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

export default async function RequirementTab({ propertyId }: { propertyId: string }) {
    const requirements = await getMatchedRequirementsById(propertyId);

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
                    <RequirementCard req={req} />
                ))}
            </div>
        </div>
    );
}