import { BackHeader } from "@/components/back-header";
import RequirementAddForm from "../components/requirement-add-form";

export const metadata = {
    title: "Add Requirement | Property Hub",
    description: "Post a new real estate requirement for your clients.",
};

export default function AddRequirementPage() {
    return (
        <>
            <BackHeader title={"Add Requirement"} />

            <div className="min-h-full bg-background p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
                <RequirementAddForm />
            </div>
        </>
    );
}
