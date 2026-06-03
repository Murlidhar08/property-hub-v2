"use server";

import { AgreementStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma/prisma";
import { revalidatePath } from "next/cache";

export async function getAgreementsByPropertyId(propertyId: string) {
    try {
        const agreements = await prisma.propertyAgreement.findMany({
            where: { propertyId },
            include: {
                owner: true,
                client: true,
                payments: true,
                documents: true,
            },
            orderBy: {
                date: 'desc'
            }
        });

        return JSON.parse(JSON.stringify(agreements.map(agreement => ({
            ...agreement,
            ownerName: agreement.owner.name,
            clientName: agreement.client.name,
        }))));
    } catch (error) {
        console.error("Error fetching agreements:", error);
        return [];
    }
}

export async function addUpdateAgreement(data: {
    id?: number;
    propertyId: string;
    ownerId: string;
    clientId: string;
    typeId: number;
    price: number;
    status: AgreementStatus;
    date: Date;
    validTill?: Date | null;
    description?: string | null;
    userId: string;
}) {
    try {
        const { id, ...rest } = data;
        const payload = {
            propertyId: rest.propertyId,
            ownerId: rest.ownerId,
            clientId: rest.clientId,
            typeId: rest.typeId,
            price: rest.price,
            status: rest.status,
            date: rest.date,
            validTill: rest.validTill,
            description: rest.description,
            updatedBy: rest.userId,
        } as any;

        let agreementId = id;
        if (id) {
            await prisma.propertyAgreement.update({
                where: { id },
                data: payload
            });
        } else {
            const newAgreement = await prisma.propertyAgreement.create({
                data: {
                    ...payload,
                    createdBy: rest.userId,
                }
            });
            agreementId = newAgreement.id;
        }

        revalidatePath(`/property/${rest.propertyId}`);
        return { success: true, agreementId };
    } catch (error) {
        console.error("Error saving agreement:", error);
        return { success: false, error: "Failed to save agreement" };
    }
}

export async function deleteAgreement(id: number, propertyId: string) {
    try {
        // Delete payments first (cascade might not be set in schema, let's check)
        // Schema says: model PropertyAgreementPayment { ... agreement PropertyAgreement @relation(fields: [agreementId], references: [id]) }
        // No onDelete: Cascade shown in view_file 1559 line 277.
        // Actually, let's check line 277 again: agreement PropertyAgreement @relation(fields: [agreementId], references: [id])
        // It doesn't have onDelete: Cascade. So we delete payments manually if needed or if DB allows.

        await prisma.propertyAgreementPayment.deleteMany({
            where: { agreementId: id }
        });

        await prisma.propertyAgreement.delete({
            where: { id }
        });

        revalidatePath(`/property/${propertyId}`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting agreement:", error);
        return { success: false };
    }
}

export async function addAgreementPayment(data: {
    agreementId: number;
    label: string;
    amount: number;
    paidDate: Date;
    userId: string;
    propertyId: string;
}) {
    try {
        await prisma.propertyAgreementPayment.create({
            data: {
                agreementId: data.agreementId,
                label: data.label,
                amount: data.amount,
                paidDate: data.paidDate,
                createdBy: data.userId
            }
        });

        revalidatePath(`/property/${data.propertyId}`);
        return { success: true };
    } catch (error) {
        console.error("Error adding payment:", error);
        return { success: false };
    }
}

export async function deleteAgreementPayment(id: number, propertyId: string) {
    try {
        await prisma.propertyAgreementPayment.delete({
            where: { id }
        });

        revalidatePath(`/property/${propertyId}`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting payment:", error);
        return { success: false };
    }
}
