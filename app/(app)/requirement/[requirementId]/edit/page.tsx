import { getRequirementById } from "@/actions/requirement.actions";
import { BackHeader } from "@/components/back-header";
import RequirementEditForm from "../../components/requirement-edit-form";

export const metadata = {
    title: "Edit Requirement | Property Hub",
};

export default async function EditRequirementPage({ params }: { params: Promise<{ requirementId: string }> }) {
    const { requirementId } = await params;
    const requirement = await getRequirementById(requirementId);

    if (!requirement) {
        return <div className="p-8 font-bold text-center">Requirement not found.</div>;
    }

    return (
        <>
            <BackHeader title="Edit Requirement" />

            <div className="w-full bg-background p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
                <RequirementEditForm initialData={requirement} />
            </div>
        </>
    );
}
