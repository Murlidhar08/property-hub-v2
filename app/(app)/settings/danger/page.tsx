"use client";

import { BackHeader } from "@/components/back-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth/auth-client";
import { tran } from "@/lib/languages/i18n";
import { DangerModalBody } from "./components/danger-body";

export default function DangerPage() {
    const { isPending } = useSession();

    if (isPending) {
        return <DangerSkeleton />;
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <BackHeader
                title={tran("danger.title")}
                backUrl="/settings"
            />

            <DangerModalBody />
        </div>
    );
}

function DangerSkeleton() {
    return (
        <div className="min-h-screen bg-background">
            <BackHeader title={tran("danger.title")} />
            <div className="mx-auto max-w-lg p-6 mt-6 space-y-8">
                <div className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-[2.5rem]" />
                </div>
            </div>
        </div>
    );
}
