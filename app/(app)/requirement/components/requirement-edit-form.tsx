"use client";

import { updateRequirement } from "@/actions/requirement.actions";
import { getUsersByRole } from "@/actions/user.actions";
import { FooterButtons } from "@/components/footer-buttons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MeasurementType, PropertyStatus, PropertyType } from "@/lib/generated/prisma/browser";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
    Briefcase,
    FileText,
    IndianRupee,
    MapPin,
    ShieldCheck,
    User
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const requirementSchema = z.object({
    title: z.string().min(3, "Title is required"),
    propertyType: z.nativeEnum(PropertyType),
    location: z.string().min(3, "Location is required"),
    propertyForType: z.nativeEnum(PropertyStatus),
    measurementType: z.nativeEnum(MeasurementType).optional().nullable(),
    minMeasurement: z.string().optional(),
    maxMeasurement: z.string().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    clientId: z.string().optional().nullable(),
    agentId: z.string().optional().nullable(),
    description: z.string().optional()
});

type RequirementFormValues = z.infer<typeof requirementSchema>;

interface RequirementEditFormProps {
    initialData: any;
}

export default function RequirementEditForm({ initialData }: RequirementEditFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [agents, setAgents] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RequirementFormValues>({
        resolver: zodResolver(requirementSchema),
        defaultValues: {
            title: initialData.title || "",
            propertyType: initialData.propertyType as PropertyType,
            location: initialData.location || "",
            propertyForType: initialData.propertyForType as PropertyStatus,
            measurementType: initialData.measurementType as MeasurementType,
            minMeasurement: initialData.minMeasurement?.toString() || "",
            maxMeasurement: initialData.maxMeasurement?.toString() || "",
            minPrice: initialData.minPrice?.toString() || "",
            maxPrice: initialData.maxPrice?.toString() || "",
            clientId: initialData.clientId || null,
            agentId: initialData.agentId || null,
            description: initialData.description || ""
        }
    });

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const agentsData = await getUsersByRole("agent");
                setAgents(agentsData);
                const clientsData = await getUsersByRole("client");
                setClients(clientsData);
            } catch (error) {
                console.error("Error loading users", error);
            }
        };
        loadUsers();
    }, []);

    const onSubmit: SubmitHandler<RequirementFormValues> = async (values) => {
        setLoading(true);
        try {
            await updateRequirement(initialData.id, values);
            toast.success("Requirement updated successfully");
            router.push(`/requirement/${initialData.id}` as any);
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update requirement");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-24">
            {/* Basic Information */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="p-6 rounded-[2rem] border-border bg-card shadow-sm">
                    <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                        <ShieldCheck className="text-primary" size={20} />
                        Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <Label>Requirement Title (Short Summary)</Label>
                            <div className="relative">
                                <Input {...register("title")} placeholder="e.g. Need 2BHK flat near Station" className="pl-10 rounded-xl h-12" />
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            </div>
                            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Property Type</Label>
                            <Select onValueChange={(val) => setValue("propertyType", val as PropertyType)} defaultValue={initialData.propertyType}>
                                <SelectTrigger className="rounded-xl h-12 w-full">
                                    <SelectValue placeholder="Select type">
                                        {watch("propertyType") ? (
                                            watch("propertyType").charAt(0).toUpperCase() + watch("propertyType").slice(1)
                                        ) : "Select type"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(PropertyType).map((type) => (
                                        <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Requirement For</Label>
                            <Select onValueChange={(val) => setValue("propertyForType", val as PropertyStatus)} defaultValue={initialData.propertyForType}>
                                <SelectTrigger className="rounded-xl h-12 w-full">
                                    <SelectValue placeholder="Rent or Buy?">
                                        {watch("propertyForType") ? (
                                            watch("propertyForType").charAt(0).toUpperCase() + watch("propertyForType").slice(1)
                                        ) : "Rent or Buy?"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={PropertyStatus.buy}>Buy</SelectItem>
                                    <SelectItem value={PropertyStatus.rent}>Rent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label>Preferred Location / Area</Label>
                            <div className="relative">
                                <Input {...register("location")} placeholder="Enter area or city" className="pl-10 rounded-xl h-12" />
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            </div>
                            {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Budget & Area */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="p-6 rounded-[2rem] border-border bg-card shadow-sm">
                    <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                        <IndianRupee className="text-primary" size={20} />
                        Budget & Area
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Min Price (₹)</Label>
                            <div className="relative">
                                <Input {...register("minPrice")} type="number" placeholder="0" className="pl-10 rounded-xl h-12" />
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Max Price (₹)</Label>
                            <div className="relative">
                                <Input {...register("maxPrice")} type="number" placeholder="Any" className="pl-10 rounded-xl h-12" />
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Measurement Type</Label>
                            <Select onValueChange={(val) => setValue("measurementType", val as MeasurementType)} defaultValue={initialData.measurementType}>
                                <SelectTrigger className="rounded-xl h-12 w-full">
                                    <SelectValue placeholder="Unit">
                                        {watch("measurementType") || "Unit"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(MeasurementType).map((type) => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-4">
                            <div className="space-y-2 flex-1">
                                <Label>Min Area</Label>
                                <Input {...register("minMeasurement")} type="number" placeholder="0" className="rounded-xl h-12" />
                            </div>
                            <div className="space-y-2 flex-1">
                                <Label>Max Area</Label>
                                <Input {...register("maxMeasurement")} type="number" placeholder="Any" className="rounded-xl h-12" />
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* People Involved */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="p-6 rounded-[2rem] border-border bg-card shadow-sm">
                    <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                        <User className="text-primary" size={20} />
                        People Involved
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Client (Who wants this?)</Label>
                            <Select onValueChange={(val) => setValue("clientId", val as string)} defaultValue={initialData.clientId}>
                                <SelectTrigger className="rounded-xl h-12 w-full">
                                    <SelectValue placeholder="Select Client">
                                        {clients.find(u => u.id === watch("clientId"))?.name || "Select Client"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {clients.map((user) => (
                                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Associated Agent</Label>
                            <Select onValueChange={(val) => setValue("agentId", val as string)} defaultValue={initialData.agentId}>
                                <SelectTrigger className="rounded-xl h-12 w-full">
                                    <SelectValue placeholder="Select Agent">
                                        {agents.find(u => u.id === watch("agentId"))?.name || "Select Agent"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {agents.map((user) => (
                                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Additional Details */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card className="p-6 rounded-[2rem] border-border bg-card shadow-sm">
                    <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                        <FileText className="text-primary" size={20} />
                        Additional Details
                    </h3>
                    <div className="space-y-2">
                        <Label>Detailed Description</Label>
                        <Textarea
                            {...register("description")}
                            placeholder="Write more about what the client is looking for... (e.g. amenities, floor preference, etc.)"
                            className="rounded-2xl min-h-37.5 p-4 bg-muted/30 border-none focus-visible:ring-primary/10"
                        />
                    </div>
                </Card>
            </motion.div>

            {/* Form Actions */}
            <FooterButtons>
                <Button variant="outline" type="button" className="rounded-full px-8 h-12 font-bold" onClick={() => router.back()}>
                    Cancel
                </Button>
                <Button type="submit" className="rounded-full px-12 h-12 font-black shadow-lg shadow-primary/20" disabled={loading}>
                    {loading ? "Updating..." : "Update Requirement"}
                </Button>
            </FooterButtons>
        </form>
    );
}
