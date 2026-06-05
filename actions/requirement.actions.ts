"use server";

import { convertToSqFeet } from "@/lib/area-convert";
import { getUserSession } from "@/lib/auth/auth";
import { PropertyStatus, PropertyType, Requirement } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma/prisma";

export async function getRequirements() {
    const session = await getUserSession();
    if (!session?.user?.id) return [];

    const requirements = await prisma.requirement.findMany({
        include: {
            creator: {
                select: {
                    name: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return JSON.parse(JSON.stringify(requirements));
}

export async function createRequirement(data: any) {
    const session = await getUserSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const {
        title,
        propertyType,
        location,
        measurementType,
        minMeasurement,
        maxMeasurement,
        minPrice,
        maxPrice,
        propertyForType,
        clientId,
        agentId,
        description
    } = data;

    const requirement = await prisma.requirement.create({
        data: {
            title,
            propertyType,
            location,
            measurementType: measurementType || null,
            minMeasurement: minMeasurement ? Number(minMeasurement) : null,
            maxMeasurement: maxMeasurement ? Number(maxMeasurement) : null,
            minPrice: minPrice ? Number(minPrice) : null,
            maxPrice: maxPrice ? Number(maxPrice) : null,
            propertyForType,
            clientId: clientId || null,
            agentId: agentId || null,
            description,
            createdBy: session.user.id,
            updatedBy: session.user.id
        }
    });

    return JSON.parse(JSON.stringify(requirement));
}

export async function getRequirementById(id: string) {
    const session = await getUserSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const requirement = await prisma.requirement.findUnique({
        where: { id },
        include: {
            creator: {
                select: { name: true }
            },
            updater: {
                select: { name: true }
            }
        }
    });

    if (!requirement) return null;

    // Manually resolve client and agent names if they exist
    let clientName = null;
    let agentName = null;

    if (requirement.clientId) {
        const client = await prisma.user.findUnique({
            where: { id: requirement.clientId },
            select: { name: true }
        });
        clientName = client?.name;
    }

    if (requirement.agentId) {
        const agent = await prisma.user.findUnique({
            where: { id: requirement.agentId },
            select: { name: true }
        });
        agentName = agent?.name;
    }

    return JSON.parse(JSON.stringify({
        ...requirement,
        clientName,
        agentName
    }));
}

export async function updateRequirement(id: string, data: any) {
    const session = await getUserSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const {
        title,
        propertyType,
        location,
        measurementType,
        minMeasurement,
        maxMeasurement,
        minPrice,
        maxPrice,
        propertyForType,
        clientId,
        agentId,
        description
    } = data;

    const requirement = await prisma.requirement.update({
        where: { id },
        data: {
            title,
            propertyType,
            location,
            measurementType: measurementType || null,
            minMeasurement: minMeasurement ? Number(minMeasurement) : null,
            maxMeasurement: maxMeasurement ? Number(maxMeasurement) : null,
            minPrice: minPrice ? Number(minPrice) : null,
            maxPrice: maxPrice ? Number(maxPrice) : null,
            propertyForType,
            clientId: clientId || null,
            agentId: agentId || null,
            description,
            updatedBy: session.user.id
        }
    });

    return JSON.parse(JSON.stringify(requirement));
}

export async function deleteRequirement(id: string) {
    const session = await getUserSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.requirement.delete({
        where: { id }
    });

    return { success: true };
}

export async function getMatchedProperties(requirement: Requirement) {
    const session = await getUserSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    return await findMatchedProperties(requirement);
}

export async function findMatchedProperties(requirement: Requirement) {

    let lstOfPropertyType = [requirement.propertyType];

    // Land and agricultural are same
    if (requirement.propertyType == PropertyType.nonagricultural) {
        lstOfPropertyType.push(PropertyType.agricultural);
        lstOfPropertyType.push(PropertyType.plot);
        lstOfPropertyType.push(PropertyType.tenament);
    }
    // Plot 
    else if (requirement.propertyType == PropertyType.plot) {
        lstOfPropertyType.push(PropertyType.tenament);
    }
    // Tenament
    else if (requirement.propertyType == PropertyType.tenament) {
        lstOfPropertyType.push(PropertyType.plot);
    }

    // Logic to fetch mapped properties
    const properties = await prisma.property.findMany({
        where: {
            propertyType: {
                in: lstOfPropertyType
            },
            status: {
                some: {
                    status:
                        requirement.propertyForType == PropertyStatus.rent
                            ? PropertyStatus.rent
                            : PropertyStatus.sell,
                    price: {
                        gte: requirement.minPrice ?? undefined,
                        lte: requirement.maxPrice ?? undefined,
                    }
                }
            }
        },
        select: {
            status: true,
            measurementValue: true,
            measurementType: true,
            id: true,
            title: true,
            address: true,
            createdAt: true,
            propertyType: true,
            documents: {
                where: {
                    documentType: "preview"
                },
                take: 1
            },
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    // Convert requirement measurement in Sq.foot
    const requirementMinSqFoot = convertToSqFeet(Number(requirement.minMeasurement), requirement.measurementType);
    const maxMeasurement = Number(requirement.maxMeasurement);
    const requirementMaxSqFoot = maxMeasurement > 0 ? convertToSqFeet(maxMeasurement, requirement.measurementType) : Infinity;

    // Filter properties based on measurement
    const filteredProperties = properties.filter(property => {
        const propertySqFoot = convertToSqFeet(Number(property.measurementValue), property.measurementType);
        return propertySqFoot >= requirementMinSqFoot && propertySqFoot <= requirementMaxSqFoot;
    });


    return JSON.parse(JSON.stringify(filteredProperties));
}