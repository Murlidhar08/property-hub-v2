import { getPropertyById } from "@/actions/property.actions";
import { getUsersByRole } from "@/actions/user.actions";
import { PropertyEditForm } from "@/app/(app)/property/components/property-edit-form";

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
        <div className="container mx-auto max-w-5xl py-12 px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
                <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2">
                    Edit Property
                </h1>
                <p className="text-muted-foreground text-lg">
                    Update the details of the property in the system.
                </p>
                <div className="h-1 w-20 bg-primary rounded-full mt-6" />
            </div>

            <PropertyEditForm
                propertyId={propertyId}
                initialData={property}
                allAgents={allAgentsWithNames}
                allOwners={allOwnersWithNames}
                googleMapsApiKey={googleMapsApiKey}
            />
        </div>
    );
}
