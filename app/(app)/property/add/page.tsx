import { getUsersByRole } from "@/actions/user.actions";
import { BackHeader } from "@/components/back-header";
import { PropertyAddForm } from "./components/property-add-form";

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

            <PropertyAddForm
                allAgents={allAgentsWithNames}
                allOwners={allOwnersWithNames}
                googleMapsApiKey={googleMapsApiKey}
            />
        </div>
    );
}
