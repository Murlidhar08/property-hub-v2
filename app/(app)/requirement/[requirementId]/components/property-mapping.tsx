import { getMatchedProperties } from "@/actions/requirement.actions";
import PropertyCard from "@/components/property/property-card";
import { Card } from "@/components/ui/card";
import { Requirement } from "@/lib/generated/prisma/client";
import { Building2 } from "lucide-react";

export default async function PropertyMapping({ requirement }: { requirement: Requirement }) {
    const matchedProperties = await getMatchedProperties(requirement);

    if (matchedProperties.length === 0) {
        return (
            <Card className="p-12 flex flex-col items-center justify-center rounded-[2.5rem] border-dashed bg-muted/20 hover:bg-muted/30 transition-colors duration-500">
                <div className="p-6 bg-background rounded-full shadow-xl mb-6">
                    <Building2 size={48} className="text-muted-foreground/20" />
                </div>
                <p className="text-muted-foreground font-black uppercase tracking-widest text-xs text-center leading-relaxed">
                    No matching properties found for this requirement yet.
                </p>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {matchedProperties.map((property: any, idx: number) => (
                <PropertyCard key={property.id + idx.toString()} property={property} />
            ))}
        </div>
    )
}