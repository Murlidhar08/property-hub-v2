import { getPropertySharedLinks } from "@/actions/property.actions";
import SharedPropertyButton from "./shared/shared-button";
import SharedList from "./shared/shared-list";

export default async function SharedTab({ propertyId }: { propertyId: string }) {
    const sharedLinks = await getPropertySharedLinks(propertyId);

    return (
        <div className="space-y-6 pb-24 sm:pb-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-foreground tracking-tight uppercase">Shared Links</h2>
                    <p className="text-xs text-muted-foreground font-medium">Manage and track your active shared property links</p>
                </div>
            </div>

            <SharedList links={sharedLinks} />

            <SharedPropertyButton propertyId={propertyId} />
        </div>
    );
}
