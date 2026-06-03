"use client";

import {
    AdvancedMarker,
    APIProvider,
    Map,
} from '@vis.gl/react-google-maps';
import { memo } from 'react';
import { MarkerCard } from './marker-card';

const DEFAULT_COORDINATES = { lat: 22.214, lng: 68.968 }; // Dwarka, Gujarat focus
const DEFAULT_ZOOM = 13;

function generateThresholds(properties: any[]) {
    const result: Record<string, any> = {};

    properties.forEach((p) => {
        const sellMapping = p.status?.find((s: any) => s.status === "sell");
        if (!sellMapping?.price) return;

        const type = p.measurementType || "Unit";
        const price = Number(sellMapping.price);

        if (!result[type]) {
            result[type] = { min: price, max: price };
        } else {
            result[type].min = Math.min(result[type].min, price);
            result[type].max = Math.max(result[type].max, price);
        }
    });

    Object.keys(result).forEach(type => {
        const { min, max } = result[type];
        const range = max - min;
        const step = range / 3;

        result[type] = {
            intermediate: min + (range > 0 ? step : 0),
            danger: min + (range > 0 ? step * 2 : 0)
        };
    });

    return result;
}

interface GoogleHeatMapProps {
    properties: any[];
    apiKey: string;
    mapId: string;
}

const GoogleHeatMapContent = ({ properties, apiKey, mapId }: GoogleHeatMapProps) => {
    const thresholds = generateThresholds(properties);

    return (
        <APIProvider apiKey={apiKey} libraries={['marker', 'visualization']}>
            <div className="w-full h-full">
                <Map
                    defaultCenter={DEFAULT_COORDINATES}
                    defaultZoom={DEFAULT_ZOOM}
                    mapId={mapId}
                    mapTypeId="hybrid"
                    gestureHandling="greedy"
                    disableDefaultUI={true}
                    streetViewControl={true}
                    fullscreenControl={true}
                    className="w-full h-full"
                >
                    {properties.map((property) => {
                        const coords = property.coordinates as { lat: number, lng: number };
                        if (!coords?.lat || !coords?.lng) return null;

                        const type = property.measurementType || "Unit";
                        const threshold = thresholds[type] || { intermediate: 0, danger: 0 };

                        return (
                            <AdvancedMarker
                                key={property.id}
                                position={{ lat: coords.lat, lng: coords.lng }}
                            >
                                <MarkerCard
                                    property={property}
                                    threshold={threshold}
                                />
                            </AdvancedMarker>
                        );
                    })}
                </Map>
            </div>
        </APIProvider>
    );
};

export const GoogleHeatMap = memo(GoogleHeatMapContent);
export default GoogleHeatMap;
