import { getAgreementsByPropertyId } from "@/actions/agreement.actions";
import { getUserSession } from "@/lib/auth/auth";
import { AgreementView } from "./agreement/agreement-view";

export default async function AgreementTab({ propertyId }: { propertyId: string }) {
    const [agreements, session] = await Promise.all([
        getAgreementsByPropertyId(propertyId),
        getUserSession()
    ]);

    return (
        <AgreementView
            propertyId={propertyId}
            agreements={agreements}
            userId={session?.user?.id || ""}
        />
    );
}
