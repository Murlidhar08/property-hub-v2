"use client";

import { PropertyType } from "@/lib/generated/prisma/browser";
import { PropertyInput } from "@/components/property/property-input";
import PropertyCard from "@/components/property/property-card";

export function PropertiesGrid({ properties }: { properties: PropertyInput[] }) {
    const acc = properties.reduce((acc, property) => {
        const type = property.propertyType;
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(property);
        return acc;
    }, {} as Record<PropertyType, PropertyInput[]>);

    return (
        <div className="space-y-20">
            {Object.entries(acc).map(([type, properties]) => {
                return <PropertyGroup key={type} type={type as PropertyType} properties={properties} />
            })}
        </div>
    );
}

const getPropertyTypeLabel = (type: PropertyType) => {
    switch (type) {
        case PropertyType.agricultural:
            return "Agricultural Lands";
        case PropertyType.nonagricultural:
            return "Non-Agricultural Lands";
        case PropertyType.hotel:
            return "Hotels & Commercial";
        case PropertyType.tenament:
            return "Tenaments";
        case PropertyType.flat:
            return "Flats & Apartments";
        case PropertyType.plot:
            return "Plots & Layouts";
        default:
            return "Properties";
    }
}

const PropertyGroup = ({ type, properties }: { type: PropertyType, properties: PropertyInput[] }) => {
    return (
        <div className="mb-20 last:mb-0">
            <div className="mb-10">
                <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3 uppercase">
                    {getPropertyTypeLabel(type)}
                    <div className="h-1 flex-1 bg-border rounded-full max-w-xs ml-4" />
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {properties.map((property, idx) => {
                    return (
                        <PropertyCard key={property.id + idx.toString()} property={property} />
                    );
                })}
            </div>
        </div>
    )
}

