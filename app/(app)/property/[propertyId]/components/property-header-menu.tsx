"use client";

import { deleteProperty } from "@/actions/property.actions";
import { BackHeader } from "@/components/back-header";
import { useConfirm } from "@/components/providers/confirm-provider";
import { Pencil, Printer, RefreshCw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface PropertyHeaderMenuProps {
    propertyId: string;
}

export function PropertyHeaderMenu({ propertyId }: PropertyHeaderMenuProps) {
    const router = useRouter();
    const confirm = useConfirm()

    const handleDelete = async () => {
        const ok = await confirm({
            title: "Delete Property",
            description: "Are you sure you want to delete this property? This action cannot be undone.",
            confirmText: "Delete",
            destructive: true
        })

        if (!ok) return

        try {
            await deleteProperty(propertyId);
            toast.success("Property deleted successfully");
            router.push("/property");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete property");
        }
    };

    return (
        <>
            <BackHeader
                title={"Property Details"}
                menuItems={[
                    {
                        label: "Refresh",
                        onClick: () => window.location.reload(),
                        icon: <RefreshCw size={18} className="text-blue-500" />
                    },
                    {
                        label: "Print",
                        onClick: () => window.print(),
                        icon: <Printer size={18} className="text-blue-500" />
                    },
                    {
                        label: "Edit",
                        onClick: () => router.push(`/property/${propertyId}/edit` as any),
                        icon: <Pencil size={18} className="text-blue-600" />
                    },
                    {
                        label: "Delete",
                        onClick: handleDelete,
                        icon: <Trash2 size={18} />,
                        destructive: true
                    },
                ]}
            />
        </>
    );
}
