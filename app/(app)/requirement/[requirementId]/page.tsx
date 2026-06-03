import { getRequirementById } from "@/actions/requirement.actions";
import AppTabs from "@/components/tab/app-tabs";
import { PropertyType } from "@/lib/generated/prisma/client";
import {
    Building2,
    FileText,
    Home,
    Layers,
    Layout,
    MapPin,
    Trees
} from "lucide-react";
import GeneralTab from "./components/general-tab";
import PropertyMapping from "./components/property-mapping";
import { RequirementActions } from "./components/requirement-actions";

const typeIcons: Record<string, any> = {
    [PropertyType.hotel]: <Building2 className="text-rose-500" size={40} />,
    [PropertyType.agricultural]: <Trees className="text-emerald-500" size={40} />,
    [PropertyType.nonagricultural]: <Layers className="text-amber-500" size={40} />,
    [PropertyType.tenament]: <Home className="text-sky-500" size={40} />,
    [PropertyType.flat]: <Building2 className="text-indigo-500" size={40} />,
    [PropertyType.plot]: <Layout className="text-orange-500" size={40} />,
};

export default async function RequirementDetailsPage({ params }: { params: Promise<{ requirementId: string }> }) {
    const { requirementId } = await params;
    const requirement = await getRequirementById(requirementId);

    if (!requirement) {
        return <div className="p-8 font-bold text-center">Requirement not found.</div>;
    }


    const tabs = [
        {
            id: "general",
            label: "GENERAL",
            icon: <FileText size={16} />,
            content: <GeneralTab requirement={requirement} />
        },
        {
            id: "property",
            label: "PROPERTY",
            icon: <Home size={16} />,
            content: <PropertyMapping requirement={requirement} />
        }
    ];

    return (
        <div className="min-h-full w-full bg-background p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Header section from screenshot */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-6">
                    <RequirementActions requirementId={requirement.id} />

                    <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center border border-border shadow-inner">
                        {typeIcons[requirement.propertyType as PropertyType] || <Layout size={40} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-black text-foreground tracking-tight uppercase">
                                {requirement.title}
                            </h1>
                        </div>
                        <div className="flex items-center text-muted-foreground text-sm font-bold mt-1">
                            <MapPin size={14} className="mr-1.5" />
                            {requirement.location}
                        </div>
                    </div>
                </div>
            </div>

            <AppTabs tabs={tabs} defaultTab="general" />
        </div>
    );
}
