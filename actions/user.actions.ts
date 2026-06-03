"use server";

import { auth, getUserSession } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";
import { deleteFile, uploadFile } from "@/lib/file-operations";
import { headers } from "next/headers";
import { UserStatus } from "@/lib/generated/prisma/enums";

export async function getCurrentUser() {
    const session = await getUserSession();
    if (!session?.user?.id) return null;

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            contactNo: true,
            role: true,
            createdAt: true,
            username: true,
        }
    });

    return user;
}

export async function getDeviceSessions() {
    const session = await getUserSession();
    if (!session?.user?.id) return null;

    return await auth.api.listDeviceSessions({
        headers: await headers()
    });
}

export async function setActiveSession(sessionToken: string) {
    return await auth.api.setActiveSession({
        body: { sessionToken },
        headers: await headers(),
    });
}

export async function revokeSession(sessionToken: string) {
    return await auth.api.revokeDeviceSession({
        body: { sessionToken },
        headers: await headers(),
    });
}


export async function uploadProfileImage(formData: FormData) {
    const session = await getUserSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const file = formData.get("file") as File;
    if (!file) throw new Error("No file uploaded");

    // 1. Find existing user to identify the old image path
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { image: true }
    });

    // 2. Delete existing file if it's a local storage file
    if (user?.image && !user.image.startsWith("http")) {
        // Clear prefix if migration required, and remove query params for fs check
        const oldRelativePath = user.image.replace("/api/files/", "").split("?")[0];
        try {
            await deleteFile(oldRelativePath);
        } catch (e) {
            console.error("Failed to delete old profile image:", e);
        }
    }

    // 3. Prepare deterministic filename: [userId].[extension]
    const ext = file.name.split(".").pop() || "png";
    const fileName = `${session.user.id}.${ext}`;

    // 4. Upload to 'profile' root folder
    const relativePath = await uploadFile(file, "profile", fileName);
    // Add version parameter to the relative path
    const dbPath = `${relativePath}?v=${Date.now()}`;

    // 5. Update user image in Database
    await prisma.user.update({
        where: { id: session.user.id },
        data: { image: dbPath }
    });

    return { filePath: dbPath };
}

export async function getUsersByRole(role: "agent" | "owner" | "client") {
    return prisma.user.findMany({
        where: {
            userRoleMappings: {
                some: {
                    roleType: role as any
                }
            }
        },
        select: {
            id: true,
            name: true,
            email: true
        }
    });
}

export async function updateUserStatus(userId: string, status: string) {
    const session = await getUserSession();
    if (session?.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    return prisma.user.update({
        where: { id: userId },
        data: { status: status as any }
    });
}

export async function updateUserRole(userId: string, roles: string[]) {
    const session = await getUserSession();
    if (session?.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    const isAdmin = roles.includes("admin");
    const validOtherRoles = roles.filter(r => ["agent", "client", "owner"].includes(r));

    return await prisma.$transaction([
        prisma.user.update({
            where: { id: userId },
            data: {
                role: isAdmin ? "admin" : "user"
            }
        }),
        prisma.userRoleMapping.deleteMany({
            where: { userId }
        }),
        ...(validOtherRoles.length > 0 ? [
            prisma.userRoleMapping.createMany({
                data: validOtherRoles.map(role => ({
                    userId,
                    roleType: role as any
                }))
            })
        ] : [])
    ]);
}

// Get list of Clients (including admins)
export async function getClients() {
    return prisma.user.findMany({
        where: {
            OR: [
                { role: "admin" },
                {
                    userRoleMappings: {
                        some: { roleType: "client" }
                    }
                }
            ]
        },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            contactNo: true,
            createdAt: true,
            occupation: true,
            address: true
        }
    });
}

// Get List of Agents (including admins)
export async function getAgents() {
    return prisma.user.findMany({
        where: {
            OR: [
                { role: "admin" },
                {
                    userRoleMappings: {
                        some: { roleType: "agent" }
                    }
                }
            ]
        },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            contactNo: true,
            occupation: true
        }
    });
}

// Get List of Owners (including admins)
export async function getOwners() {
    return prisma.user.findMany({
        where: {
            OR: [
                { role: "admin" },
                {
                    userRoleMappings: {
                        some: { roleType: "owner" }
                    }
                }
            ]
        },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            contactNo: true
        }
    });
}

export async function getUserById(userId: string) {
    const session = await getUserSession();
    if (!session) throw new Error("Unauthorized");

    return prisma.user.findUnique({
        where: { id: userId },
        include: {
            userRoleMappings: true,
            accounts: {
                select: {
                    providerId: true
                }
            }
        }
    });
}

export async function getUserDetails(userId: string) {
    const session = await getUserSession();
    if (!session) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) return null;

    // Fetch related data based on roles
    const [userRoleMappings, requirements, properties, agentProperties, userDocuments, creator, updater] = await Promise.all([
        prisma.userRoleMapping.findMany({ where: { userId } }),
        prisma.requirement.findMany({
            where: { clientId: userId },
            include: { creator: { select: { name: true } } }
        }),
        prisma.property.findMany({
            where: {
                users: {
                    some: {
                        userId: userId,
                        userType: 2 // OWNER
                    }
                }
            },
            include: { status: true, creator: { select: { name: true } } }
        }),
        prisma.property.findMany({
            where: {
                users: {
                    some: {
                        userId: userId,
                        userType: 0 // AGENT
                    }
                }
            },
            include: { status: true, creator: { select: { name: true } } }
        }),
        prisma.userDocument.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" }
        }),
        user.createdBy ? prisma.user.findUnique({ where: { id: user.createdBy }, select: { name: true } }) : Promise.resolve(null),
        user.updatedBy ? prisma.user.findUnique({ where: { id: user.updatedBy }, select: { name: true } }) : Promise.resolve(null)
    ]);

    return JSON.parse(JSON.stringify({
        ...user,
        userRoleMappings,
        requirements,
        properties,
        agentProperties,
        userDocuments,
        creatorName: creator?.name || "System",
        updaterName: updater?.name || "System"
    }));
}

export async function removeUserRole(userId: string, roleToRemove: "agent" | "owner" | "client") {
    const session = await getUserSession();
    if (session?.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    return await prisma.$transaction(async (tx) => {
        // Remove the specific role
        await tx.userRoleMapping.deleteMany({
            where: {
                userId: userId,
                roleType: roleToRemove as any
            }
        });

        // Check remaining roles
        const remainingRoles = await tx.userRoleMapping.count({
            where: { userId: userId }
        });

        // Check if user is also an admin
        const user = await tx.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        const isStillNeeded = remainingRoles > 0 || user?.role === "admin";

        if (!isStillNeeded) {
            // Delete entire account if no roles remain and not an admin
            await tx.account.deleteMany({ where: { userId } });
            await tx.session.deleteMany({ where: { userId } });
            await tx.user.delete({ where: { id: userId } });
            return { success: true, deletedUser: true };
        }

        return { success: true, deletedUser: false };
    });
}

export async function deleteUser(userId: string) {
    const session = await getUserSession();
    if (session?.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    return await prisma.$transaction(async (tx) => {
        await tx.userRoleMapping.deleteMany({ where: { userId } });
        await tx.account.deleteMany({ where: { userId } });
        await tx.session.deleteMany({ where: { userId } });
        return tx.user.delete({
            where: { id: userId }
        });
    });
}

export async function createUser(data: any) {
    const session = await getUserSession();
    if (session?.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    const {
        name,
        email,
        contactNo,
        username,
        status,
        occupation,
        address,
        description,
        roles
    } = data;

    return await prisma.$transaction(async (tx) => {
        const isAdmin = (roles || []).includes("admin");
        const validOtherRoles = (roles || []).filter((r: string) => ["agent", "client", "owner"].includes(r));

        const user = await tx.user.create({
            data: {
                name,
                email,
                contactNo,
                username: username || null,
                status: status || UserStatus.pendingapproval,
                occupation: occupation || null,
                address: address || null,
                description: description || null,
                role: isAdmin ? "admin" : "user",
                createdBy: session?.user?.id || null,
                updatedBy: session?.user?.id || null
            }
        });

        if (validOtherRoles.length > 0) {
            await tx.userRoleMapping.createMany({
                data: validOtherRoles.map((roleValue: string) => ({
                    userId: user.id,
                    roleType: roleValue as any
                }))
            });
        }

        return user;
    });
}

export async function updateUser(id: string, data: any) {
    const session = await getUserSession();
    if (session?.user.role !== "admin") {
        throw new Error("Unauthorized");
    }

    const {
        name,
        email,
        contactNo,
        username,
        status,
        occupation,
        address,
        description,
        roles
    } = data;

    return await prisma.$transaction(async (tx) => {
        const isAdmin = (roles || []).includes("admin");
        const validOtherRoles = (roles || []).filter((r: string) => ["agent", "client", "owner"].includes(r));

        const user = await tx.user.update({
            where: { id },
            data: {
                name,
                email,
                contactNo,
                username: username || null,
                status: status || UserStatus.pendingapproval,
                occupation: occupation || null,
                address: address || null,
                description: description || null,
                role: isAdmin ? "admin" : "user",
                updatedBy: session?.user?.id || null
            }
        });

        await tx.userRoleMapping.deleteMany({
            where: { userId: id }
        });

        if (validOtherRoles.length > 0) {
            await tx.userRoleMapping.createMany({
                data: validOtherRoles.map((roleValue: string) => ({
                    userId: user.id,
                    roleType: roleValue as any
                }))
            });
        }

        return user;
    });
}

export async function checkUsernameUnique(username: string, excludeUserId?: string) {
    const user = await prisma.user.findFirst({
        where: {
            username,
            id: excludeUserId ? { not: excludeUserId } : undefined
        }
    });
    return !user;
}

export async function uploadUserDocument(userId: string, formData: FormData) {
    const session = await getUserSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const file = formData.get("file") as File;
    const documentType = formData.get("documentType") as string;
    if (!file) throw new Error("No file uploaded");

    const ext = `.${file.name.split(".").pop() || ""}`.toLowerCase();
    const uniqueName = `${Date.now()}_${Math.round(Math.random() * 1000)}${ext}`;

    const relativePath = await uploadFile(file, `document/${userId}`, uniqueName);

    return prisma.userDocument.create({
        data: {
            userId,
            fileName: file.name,
            extension: ext,
            documentRelativePath: relativePath,
            documentType: documentType as any,
            createdBy: session.user.id
        }
    });
}

export async function deleteUserDocument(documentId: string) {
    const session = await getUserSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const doc = await prisma.userDocument.findUnique({
        where: { id: documentId }
    });

    if (!doc) throw new Error("Document not found");

    const relativePath = doc.documentRelativePath.replace("/api/files/", "");
    try {
        await deleteFile(relativePath);
    } catch (e) {
        console.error("Failed to delete physical file:", e);
    }

    return prisma.userDocument.delete({
        where: { id: documentId }
    });
}

export async function getUserDocuments(userId: string) {
    return prisma.userDocument.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" }
    });
}

export async function renameUserDocument(documentId: string, newName: string) {
    return prisma.userDocument.update({
        where: { id: documentId },
        data: { fileName: newName }
    });
}


