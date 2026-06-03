// Bump for refresh
import { getPropertyById } from "@/actions/property.actions";
import AppTabs from "@/components/tab/app-tabs";
import { PropertyType } from "@/lib/generated/prisma/client";
import {
    Building2,
    FileText,
    Handshake,
    Home,
    Info,
    Layers,
    Layout,
    ListChecks,
    MapPin,
    Share2,
    Trees
} from "lucide-react";
import AgreementTab from "./components/agreement-tab";
import DocumentTab from "./components/document-tab";
import GeneralTab from "./components/general-tab";
import { PropertyHeaderMenu } from "./components/property-header-menu";
import RequirementTab from "./components/requirement-tab";
import SharedTab from "./components/shared-tab";

const typeIcons: Record<string, any> = {
    [PropertyType.hotel]: <Building2 className="text-rose-500" size={40} />,
    [PropertyType.agricultural]: <Trees className="text-emerald-500" size={40} />,
    [PropertyType.nonagricultural]: <Layers className="text-amber-500" size={40} />,
    [PropertyType.tenament]: <Home className="text-sky-500" size={40} />,
    [PropertyType.flat]: <Building2 className="text-indigo-500" size={40} />,
    [PropertyType.plot]: <Layout className="text-orange-500" size={40} />,
};

export default async function PropertyDetailsPage({ params }: { params: Promise<{ propertyId: string }> }) {
    const { propertyId } = await params;
    const property = await getPropertyById(propertyId);

    if (!property) {
        return <div className="p-8 font-bold text-center">Property not found.</div>;
    }

    return (
        <div className="min-h-full bg-background p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
            {/* Header section from screenshot */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-6">
                    <PropertyHeaderMenu propertyId={propertyId} />
                    <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center border border-border shadow-inner">
                        {typeIcons[property.propertyType as PropertyType] || <Building2 size={40} />}
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg sm:text-2xl font-black text-foreground tracking-tight uppercase">
                                {property.title}
                            </h1>
                        </div>
                        <div className="flex items-center text-muted-foreground text-sm font-bold mt-1">
                            <MapPin size={14} className="mr-1.5" />
                            {property.address}
                        </div>
                    </div>
                </div>
            </div>

            <hr className="border-border" />

            {/* Tabs */}
            <AppTabs
                defaultTab="general"
                tabs={[
                    {
                        id: "general",
                        label: "GENERAL",
                        icon: <Info size={20} />,
                        content: <GeneralTab property={property} />
                    },
                    {
                        id: "requirements",
                        label: "REQUIREMENTS",
                        icon: <ListChecks size={20} />,
                        content: <RequirementTab propertyId={propertyId} />
                    },
                    {
                        id: "document",
                        label: "DOCUMENT",
                        icon: <FileText size={20} />,
                        content: <DocumentTab propertyId={propertyId} />
                    },
                    {
                        id: "shared",
                        label: "SHARED",
                        icon: <Share2 size={20} />,
                        badgeCount: property._count?.sharedLinks || 0,
                        content: <SharedTab propertyId={propertyId} />
                    },
                    {
                        id: "agreement",
                        label: "AGREEMENT",
                        icon: <Handshake size={20} />,
                        badgeCount: property._count?.agreements || 0,
                        content: <AgreementTab propertyId={propertyId} />
                    }
                ]}
            />
        </div>
    );
}

