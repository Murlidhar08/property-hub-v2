import { PropertyAddForm } from "@/app/(app)/property/components/property-add-form";
import { getUsersByRole } from "@/actions/user.actions";
import { BackHeader } from "@/components/back-header";

export default async function PropertyAddPage() {
    // ⚡ Fetch users for dropdowns on the server
    const [agents, owners] = await Promise.all([
        getUsersByRole("agent"),
        getUsersByRole("owner")
    ]);

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
        <div className="w-full bg-background pb-34">
            <BackHeader title={"Add New Property"} />

            <div className="container mx-auto max-w-5xl py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2">
                    Add New Property
                </h1>
                <p className="text-muted-foreground text-lg">
                    Enter the details of the property to list it in the system.
                </p>
                <div className="h-1 w-20 bg-primary rounded-full mt-6" />
            </div>

            <PropertyAddForm
                allAgents={allAgentsWithNames}
                allOwners={allOwnersWithNames}
                googleMapsApiKey={googleMapsApiKey}
            />
        </div>
    );
}
