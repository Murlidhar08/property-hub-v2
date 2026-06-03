"use server";

import { getUserSession } from "@/lib/auth/auth";
import { deleteFile, moveFile } from "@/lib/file-operations";
import { PropertyDocumentType } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma/prisma";

export async function createPropertyDocument(data: {
    propertyId: string;
    agreementId?: number;
    fileName: string;
    extension: string;
    relativePath: string;
    documentType: PropertyDocumentType;
    orderId: number;
    isPrivate?: boolean;
}) {
    const session = await getUserSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const doc = await prisma.propertyDocument.create({
        data: {
            ...data,
            uploadedBy: session.user.id,
            isPrivate: data.isPrivate ?? false,
        }
    });

    return JSON.parse(JSON.stringify(doc));
}

export async function deletePropertyDocument(id: string) {
    const session = await getUserSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const doc = await prisma.propertyDocument.findUnique({ where: { id } });
    if (!doc) throw new Error("Document not found");

    // Only creator or admin should delete (simplifying for now)
    if (doc.uploadedBy !== session.user.id) throw new Error("Unauthorized");

    // Delete file from filesystem
    await deleteFile(doc.relativePath);

    // Delete from DB
    await prisma.propertyDocument.delete({ where: { id } });

    return { success: true };
}

export async function updatePropertyDocument(id: string, data: {
    isPrivate?: boolean;
    orderId?: number;
    fileName?: string;
}) {
    const session = await getUserSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const doc = await prisma.propertyDocument.update({
        where: { id },
        data
    });

    return JSON.parse(JSON.stringify(doc));
}

export async function renamePropertyDocument(id: string, newFileName: string) {
    const session = await getUserSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const doc = await prisma.propertyDocument.findUnique({ where: { id } });
    if (!doc) throw new Error("Document not found");

    if (doc.uploadedBy !== session.user.id) throw new Error("Unauthorized");

    // We don't necessarily need to rename the file on disk, 
    // just the display name in the database. 
    // This is safer as relativePath remains unchanged.
    const updated = await prisma.propertyDocument.update({
        where: { id },
        data: { fileName: newFileName }
    });

    return JSON.parse(JSON.stringify(updated));
}

export async function reorderPropertyDocuments(orderedIds: string[]) {
    const session = await getUserSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.$transaction(
        orderedIds.map((id, index) =>
            prisma.propertyDocument.update({
                where: { id },
                data: { orderId: index }
            })
        )
    );

    return { success: true };
}

/**
 * Handles moving files from 'temp' folder to 'property' folder after property creation.
 */
export async function finalizePropertyDocuments(propertyId: string, documents: any[], agreementId?: number) {
    const session = await getUserSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const createdDocs = [];

    for (const doc of documents) {
        let finalPath = doc.relativePath;

        // If it was in temp, move it to the property folder
        if (doc.relativePath.includes("/temp/")) {
            const fileName = doc.relativePath.split("/").pop() || "file";
            const targetFolder = agreementId
                ? `property/${propertyId}/agreement/${agreementId}`
                : `property/${propertyId}`;
            finalPath = await moveFile(doc.relativePath, targetFolder, fileName);
        }

        const createdDoc = await prisma.propertyDocument.create({
            data: {
                propertyId,
                agreementId: agreementId || null,
                fileName: doc.fileName,
                extension: doc.extension,
                relativePath: finalPath,
                documentType: doc.documentType,
                orderId: doc.orderId,
                isPrivate: doc.isPrivate || false,
                uploadedBy: session.user.id,
            }
        });
        createdDocs.push(createdDoc);
    }

    return JSON.parse(JSON.stringify(createdDocs));
}
