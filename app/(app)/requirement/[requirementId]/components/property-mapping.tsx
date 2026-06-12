import { getMatchedProperties } from "@/actions/requirement.actions";
import PropertyList from "@/components/property/property-list";
import { Requirement } from "@/lib/generated/prisma/client";

export default async function PropertyMapping({ requirement }: { requirement: Requirement }) {
    const matchedProperties = await getMatchedProperties(requirement);

    return (
        <PropertyList property={matchedProperties} />
    )
}