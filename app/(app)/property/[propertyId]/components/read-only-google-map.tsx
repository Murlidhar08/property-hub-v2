"use client";

import { useEffect, useRef } from "react";

interface ReadOnlyGoogleMapProps {
    apiKey: string;
    center: { lat: number; lng: number, zoom?: number };
}

export function ReadOnlyGoogleMap({ apiKey, center }: ReadOnlyGoogleMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!apiKey) return;

        const loadGoogleMaps = () => {
            if (window.google) {
                initMap();
                return;
            }

            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMapDetails`;
            script.async = true;
            script.defer = true;
            window.initGoogleMapDetails = initMap;
            document.head.appendChild(script);
        };

        const initMap = () => {
            if (!mapRef.current) return;

            const map = new window.google.maps.Map(mapRef.current, {
                center: { lat: center.lat, lng: center.lng },
                zoom: center.zoom || 15,
                mapTypeId: 'hybrid',
                disableDefaultUI: true,
                zoomControl: true,
            });

            new window.google.maps.Marker({
                position: { lat: center.lat, lng: center.lng },
                map,
            });
        };

        loadGoogleMaps();
    }, [apiKey, center]);

    return <div ref={mapRef} className="w-full h-full" />;
}

declare global {
    interface Window {
        initGoogleMapDetails: () => void;
    }
}
