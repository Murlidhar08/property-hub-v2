import { PropertyType } from "@/lib/generated/prisma/browser";
import { Building2, Home, Layers, Layout, Trees } from "lucide-react";

export const typeIcons: Record<string, any> = {
    [PropertyType.hotel]: <Building2 className="text-rose-500" size={48} />,
    [PropertyType.agricultural]: <Trees className="text-emerald-500" size={48} />,
    [PropertyType.nonagricultural]: <Layers className="text-amber-500" size={48} />,
    [PropertyType.tenament]: <Home className="text-sky-500" size={48} />,
    [PropertyType.flat]: <Building2 className="text-indigo-500" size={48} />,
    [PropertyType.plot]: <Layout className="text-orange-500" size={48} />,
};