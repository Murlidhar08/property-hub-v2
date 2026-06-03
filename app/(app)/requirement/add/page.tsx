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
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-4xl font-black tracking-tighter text-foreground">
                            Post Requirement
                        </h1>
                        <p className="text-muted-foreground font-medium mt-1">
                            Find the perfect property for your client.
                        </p>
                    </div>
                </div>

                <RequirementAddForm />
            </div>
        </>
    );
}
