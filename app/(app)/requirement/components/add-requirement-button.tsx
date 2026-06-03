"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function AddRequirementButton() {
    const router = useRouter();
    return (
        <motion.button
            onClick={() => router.push("/requirement/add" as any)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-10 right-10 w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 z-50 group"
        >
            <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
        </motion.button>
    );
}
