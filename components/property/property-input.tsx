import { PropertyType } from "@/lib/generated/prisma/browser";

export interface PropertyInput {
    id: string;
    title: string;
    address: string;
    measurementValue: any;
    measurementType: any;
    createdAt: Date;
    status: any[];
    documents: any[];
    propertyType: PropertyType;
}