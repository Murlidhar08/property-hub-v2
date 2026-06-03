import { getSellingPropertiesWithLocation } from "@/actions/property.actions";
import HeatMapClient from "./components/heat-map-client";

export const dynamic = "force-dynamic";

export default async function HeatMapPage() {
    const properties = await getSellingPropertiesWithLocation();
    const googleMapsApiKey = process.env.GOOGLE_MAPS_API || "";
    const googleMapsId = process.env.GOOGLE_MAPS_ID || "";

    return (
        <HeatMapClient
            properties={properties}
            googleMapsApiKey={googleMapsApiKey}
            googleMapsId={googleMapsId}
        />
    );
}
