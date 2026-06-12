import { getMatchedRequirementsById } from "@/actions/property.actions";
import RequirementList from "@/components/requirement/requirement-list";

export default async function RequirementTab({ propertyId }: { propertyId: string }) {
    const requirements = await getMatchedRequirementsById(propertyId);

    return (
        <RequirementList requirements={requirements} />
    );
}