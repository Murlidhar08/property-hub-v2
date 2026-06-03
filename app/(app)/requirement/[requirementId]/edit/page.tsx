import { getRequirementById } from "@/actions/requirement.actions";
import RequirementEditForm from "../../components/requirement-edit-form";
import { BackHeader } from "@/components/back-header";

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
                <div>
                    <h1 className="text-2xl sm:text-4xl font-black tracking-tighter text-foreground">
                        Edit Requirement
                    </h1>
                    <p className="text-muted-foreground font-medium text-sm sm:text-base">
                        Update the details for this requirement.
                    </p>
                </div>

                <RequirementEditForm initialData={requirement} />
            </div>
        </>
    );
}
