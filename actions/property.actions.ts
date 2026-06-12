"use server";

import { convertToSqFeet } from "@/lib/area-convert";
import { getUserSession } from "@/lib/auth/auth";
import { Prisma, Property, PropertyStatus, PropertyType, Requirement, UserType } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma/prisma";

export async function getProperties() {
    const session = await getUserSession();

    if (!session?.user?.id) return [];

    const properties = await prisma.property.findMany({
        include: {
            status: true,
            documents: {
                take: 1,
                where: {
                    documentType: "preview"
                }
            },
            creator: {
                select: { name: true }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return JSON.parse(JSON.stringify(properties));
}

export async function getSellingPropertiesWithLocation() {
    const session = await getUserSession();
    if (!session?.user?.id) return [];

    const properties = await prisma.property.findMany({
        where: {
            status: {
                some: {
                    status: PropertyStatus.sell
                }
            },
            coordinates: {
                not: Prisma.DbNull
            }
        },
        include: {
            status: true,
            documents: {
                where: {
                    documentType: "preview"
                },
                take: 1
            },
            creator: {
                select: { name: true }
            }
        }
    });

    return JSON.parse(JSON.stringify(properties));
}

export async function getPropertyById(id: string) {
    const session = await getUserSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const [property, agreementsCount, sharedLinksCount] = await Promise.all([
        prisma.property.findUnique({
            where: { id },
            include: {
                status: true,
                documents: true,
                creator: {
                    select: { name: true }
                },
                updater: {
                    select: { name: true }
                },
                users: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                }
            }
        }),
        prisma.propertyAgreement.count({ where: { propertyId: id } }),
        prisma.propertySharedLink.count({ where: { propertyId: id } })
    ]);

    if (!property) return null;

    return JSON.parse(JSON.stringify({
        ...property,
        _count: {
            agreements: agreementsCount,
            sharedLinks: sharedLinksCount
        }
    }));
}

export async function createProperty(data: any) {
    const session = await getUserSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const {
        title,
        propertyType,
        address,
        measurementValue,
        measurementType,
        description,
        statusDetails, // Array of { status, price, durationTypeId }
        owners = [], // Array of user IDs
        agents = [], // Array of user IDs
        mapDetails
    } = data;

    return prisma.$transaction(async (tx) => {
        // 1. Create Property
        const property = await tx.property.create({
            data: {
                title,
                propertyType,
                address,
                measurementValue: measurementValue ? Number(measurementValue) : null,
                measurementType: measurementType || null,
                description,
                coordinates: mapDetails || null,
                createdBy: session.user.id,
                updatedBy: session.user.id
            }
        });

        // 2. Create Status Mappings
        if (statusDetails && statusDetails.length > 0) {
            await tx.propertyStatusMapping.createMany({
                data: statusDetails.map((s: any) => ({
                    propertyId: property.id,
                    status: s.status,
                    price: s.price ? Number(s.price) : null,
                    durationTypeId: s.durationTypeId || null
                }))
            });
        }

        // 3. Create User Mappings
        const userMappings = [
            ...agents.map((userId: string) => ({
                propertyId: property.id,
                userId,
                userType: 0 // AGENT
            })),
            ...owners.map((userId: string) => ({
                propertyId: property.id,
                userId,
                userType: 2 // OWNER
            }))
        ];

        if (userMappings.length > 0) {
            await tx.propertyUserMapping.createMany({
                data: userMappings
            });
        }

        return JSON.parse(JSON.stringify(property));
    });
}

export async function updateProperty(id: string, data: any) {
    const session = await getUserSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const {
        title,
        propertyType,
        address,
        measurementValue,
        measurementType,
        description,
        statusDetails, // Array of { status, price, durationTypeId }
        owners = [], // Array of user IDs
        agents = [], // Array of user IDs
        mapDetails
    } = data;

    return prisma.$transaction(async (tx) => {
        // 1. Update Property
        const property = await tx.property.update({
            where: { id },
            data: {
                title,
                propertyType,
                address,
                measurementValue: measurementValue ? Number(measurementValue) : null,
                measurementType: measurementType || null,
                description,
                coordinates: mapDetails || null,
                updatedBy: session.user.id
            }
        });

        // 2. Update Status Mappings (Delete and Re-create)
        await tx.propertyStatusMapping.deleteMany({
            where: { propertyId: id }
        });

        if (statusDetails && statusDetails.length > 0) {
            await tx.propertyStatusMapping.createMany({
                data: statusDetails.map((s: any) => ({
                    propertyId: property.id,
                    status: s.status,
                    price: s.price ? Number(s.price) : null,
                    durationTypeId: s.durationTypeId || null
                }))
            });
        }

        // 3. Update User Mappings (Delete and Re-create)
        await tx.propertyUserMapping.deleteMany({
            where: { propertyId: id }
        });

        const userMappings = [
            ...agents.map((userId: string) => ({
                propertyId: property.id,
                userId,
                userType: UserType.agent
            })),
            ...owners.map((userId: string) => ({
                propertyId: property.id,
                userId,
                userType: UserType.owner
            }))
        ];

        if (userMappings.length > 0) {
            await tx.propertyUserMapping.createMany({
                data: userMappings
            });
        }

        return JSON.parse(JSON.stringify(property));
    });
}

export async function createPropertySharedLink(data: {
    propertyId: string;
    label?: string;
    expiry?: Date | null;
    detail: any;
}) {
    const session = await getUserSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const link = await prisma.propertySharedLink.create({
        data: {
            propertyId: data.propertyId,
            label: data.label,
            expiry: data.expiry,
            detail: data.detail,
            sharedBy: session.user.id,
            visitCount: 0
        }
    });

    return { success: true, link };
}

export async function deleteProperty(id: string) {
    const session = await getUserSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    return prisma.$transaction(async (tx: any) => {
        await tx.propertyStatusMapping.deleteMany({ where: { propertyId: id } });
        await tx.propertyUserMapping.deleteMany({ where: { propertyId: id } });
        await tx.propertyDocument.deleteMany({ where: { propertyId: id } });
        await tx.propertyAgreement.deleteMany({ where: { propertyId: id } });
        await tx.propertySharedLink.deleteMany({ where: { propertyId: id } });

        const property = await tx.property.delete({ where: { id } });
        return property;
    });
}

// User Property
export async function getPropertyByUserId(userId: string) {
    const session = await getUserSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const property = await prisma.property.findMany({
        include: {
            status: true,
            documents: true,
            creator: { select: { name: true } },
            users: {
                include: {
                    user: {
                        select: {
                            name: true,
                            contactNo: true,
                            email: true
                        }
                    }
                }
            }
        },
        where: {
            createdBy: userId
        }
    });

    return JSON.parse(JSON.stringify(property));
}

// Shared links
export async function getPropertySharedLinks(propertyId: string) {
    const session = await getUserSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const links = await prisma.propertySharedLink.findMany({
        where: {
            propertyId: propertyId
        },
        include: {
            user: {
                select: {
                    name: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return JSON.parse(JSON.stringify(links));
}

export async function deletePropertySharedLink(id: string) {
    const session = await getUserSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.propertySharedLink.delete({
        where: { id }
    });

    return { success: true };
}

export async function updatePropertySharedLink(id: string, data: {
    label?: string;
    expiry?: Date | null;
    detail: any;
}) {
    const session = await getUserSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const link = await prisma.propertySharedLink.update({
        where: { id },
        data: {
            label: data.label,
            expiry: data.expiry,
            detail: data.detail
        }
    });

    return { success: true, link };
}

export async function getSharedLinkById(id: string) {
    const link = await prisma.propertySharedLink.findUnique({
        where: { id },
        include: {
            targetProperty: {
                include: {
                    status: true,
                    documents: true,
                    creator: { select: { name: true } },
                    users: {
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    contactNo: true,
                                    email: true
                                }
                            }
                        }
                    }
                }
            },
            user: {
                select: { name: true }
            }
        }
    });

    if (!link) return null;

    if (link.expiry && new Date() > new Date(link.expiry)) {
        prisma.propertySharedLink.delete({ where: { id } }).catch(console.error);
        return { expired: true };
    }
    else {
        prisma.propertySharedLink.update({
            where: { id },
            data: { visitCount: { increment: 1 } }
        }).catch(console.error);
    }

    return JSON.parse(JSON.stringify({
        ...link,
        googleMapsApiKey: process.env.GOOGLE_MAPS_API || ""
    }));
}

// Match requirements
export async function getMatchedRequirements(property: Property) {
    const session = await getUserSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    return await findMatchedRequirements(property);
}

export async function getMatchedRequirementsById(id: string): Promise<Requirement[]> {
    const property = await prisma.property.findUnique({
        where: { id }
    });
    if (!property) return [];
    return await findMatchedRequirements(property);
}

export async function findMatchedRequirements(property: Property) {
    // 1. Ensure we have current status (price/type) mappings for the property
    const propertyWithStatus = await prisma.property.findUnique({
        where: { id: property.id },
        include: { status: true }
    });

    if (!propertyWithStatus || !propertyWithStatus.status.length) return [];

    // 2. Determine compatible property types for matching
    let compatibleTypes = [property.propertyType];

    if (property.propertyType === PropertyType.nonagricultural) {
        compatibleTypes.push(PropertyType.agricultural);
        compatibleTypes.push(PropertyType.plot);
        compatibleTypes.push(PropertyType.tenament);
    } else if (property.propertyType === PropertyType.plot) {
        compatibleTypes.push(PropertyType.tenament);
    } else if (property.propertyType === PropertyType.tenament) {
        compatibleTypes.push(PropertyType.plot);
    }

    // 3. Fetch requirements that might match based on Type and Price
    const requirements = await prisma.requirement.findMany({
        where: {
            propertyType: { in: compatibleTypes },
            OR: propertyWithStatus.status.map((s: any) => ({
                propertyForType: s.status,
                AND: [
                    { OR: [{ minPrice: null }, { minPrice: { lte: s.price || 0 } }] },
                    { OR: [{ maxPrice: null }, { maxPrice: { gte: s.price || 0 } }] }
                ]
            }))
        },
        include: {
            creator: {
                select: { name: true }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    // 4. Final filter based on area measurement (Converting both to Sq. Foot)
    const propertySqFoot = convertToSqFeet(Number(property.measurementValue), property.measurementType || undefined);

    const filteredRequirements = requirements.filter((req: any) => {
        const reqMinSqFoot = convertToSqFeet(Number(req.minMeasurement), req.measurementType || undefined);
        const max = Number(req.maxMeasurement);
        const reqMaxSqFoot = max > 0 ? convertToSqFeet(max, req.measurementType || undefined) : Infinity;

        return propertySqFoot >= reqMinSqFoot && propertySqFoot <= reqMaxSqFoot;
    });

    return JSON.parse(JSON.stringify(filteredRequirements));
}