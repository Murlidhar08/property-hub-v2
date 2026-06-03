import { getRequirements } from "@/actions/requirement.actions";
import { RequirementList } from "./components/requirement-list";
import { AppHeader } from "@/components/app-header";

export default async function RequirementsPage() {
  const requirements = await getRequirements();

  return (
    <>
      <AppHeader title={"Requirements"} />

      <div className="h-full bg-background p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <RequirementList initialRequirements={requirements as any} />
      </div>
    </>
  );
}
