import { getPropertyById } from "@/actions/property.actions";
import { getUsersByRole } from "@/actions/user.actions";
import { PropertyEditForm } from "@/app/(app)/property/components/property-edit-form";
import { BackHeader } from "@/components/back-header";

export default async function EditPropertyPage({ params }: { params: Promise<{ propertyId: string }> }) {
    const { propertyId } = await params;

    // ⚡ Fetch data for the form on the server
    const [property, agents, owners] = await Promise.all([
        getPropertyById(propertyId),
        getUsersByRole("agent"),
        getUsersByRole("owner")
    ]);

    if (!property) {
        return <div className="p-8 font-bold text-center">Property not found.</div>;
    }

    const allAgentsWithNames = agents.map(a => ({
        id: a.id,
        name: a.name || a.email
    }));

    const allOwnersWithNames = owners.map(o => ({
        id: o.id,
        name: o.name || o.email
    }));

    const googleMapsApiKey = process.env.GOOGLE_MAPS_API || "";

    return (
        <>
            <div className="min-h-screen bg-background pb-34">
                <BackHeader title={"Edit Property"} />

                <div className="mx-auto max-w-4xl mt-6 space-y-8 px-6">
                    <PropertyEditForm
                        propertyId={propertyId}
                        initialData={property}
                        allAgents={allAgentsWithNames}
                        allOwners={allOwnersWithNames}
                        googleMapsApiKey={googleMapsApiKey}
                    />
                </div>
            </div>
        </>

    );
}
