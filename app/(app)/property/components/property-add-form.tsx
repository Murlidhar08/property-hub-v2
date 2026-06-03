"use client";

import { createProperty } from "@/actions/property.actions";
import { FooterButtons } from "@/components/footer-buttons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DurationType, MeasurementType, PropertyStatus, PropertyType } from "@/lib/generated/prisma/browser";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Briefcase, ChevronDown, IndianRupee, Layers, MapPin, Plus, ShieldCheck, Trash2, User, Image, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { PropertyImageUploadZone } from "./property-image-upload-zone";
import { PropertyDocumentUploadZone } from "./property-document-upload-zone";
import { finalizePropertyDocuments } from "@/actions/file.actions";
import { PropertyDocumentType } from "@/lib/generated/prisma/browser";

const documentSchema = z.object({
    id: z.string().optional(),
    fileName: z.string(),
    relativePath: z.string(),
    extension: z.string(),
    documentType: z.nativeEnum(PropertyDocumentType),
    orderId: z.number(),
    isPrivate: z.boolean().default(false),
});

const propertySchema = z.object({
    title: z.string().min(3, "Title is required"),
    propertyType: z.nativeEnum(PropertyType),
    address: z.string().min(5, "Address is required"),
    statusDetails: z.array(z.object({
        status: z.nativeEnum(PropertyStatus),
        price: z.string().optional(),
        durationTypeId: z.nativeEnum(DurationType).optional().nullable()
    })).min(1, "At least one status is required"),
    measurementValue: z.string(),
    measurementType: z.nativeEnum(MeasurementType),
    isUnknownMeasurement: z.boolean(),
    isPriceUnknown: z.boolean(),
    isTotalPrice: z.boolean(),
    owners: z.array(z.string()),
    agents: z.array(z.string()),
    hasOwner: z.boolean(),
    hasAgent: z.boolean(),
    description: z.string(),
    hasLocation: z.boolean(),
    mapDetails: z.object({
        lat: z.number(),
        lng: z.number(),
        zoom: z.number()
    }).nullable(),
    images: z.array(documentSchema).default([]),
    documents: z.array(documentSchema).default([]),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

interface PropertyAddFormProps {
    allAgents: { id: string, name: string }[];
    allOwners: { id: string, name: string }[];
    googleMapsApiKey: string;
}

function GoogleMapWrapper({
    apiKey,
    center,
    zoom,
    onLocationChange
}: {
    apiKey: string;
    center: { lat: number; lng: number };
    zoom: number;
    onLocationChange: (coords: { lat: number; lng: number, zoom: number }) => void
}) {
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);

    useEffect(() => {
        if (!apiKey) return;

        const loadGoogleMaps = () => {
            if (window.google) {
                initMap();
                return;
            }

            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMap`;
            script.async = true;
            script.defer = true;
            window.initGoogleMap = initMap;
            document.head.appendChild(script);
        };

        const initMap = () => {
            if (!mapRef.current) return;

            const map = new window.google.maps.Map(mapRef.current, {
                center,
                zoom,
                mapTypeId: 'hybrid',
                disableDefaultUI: false,
                zoomControl: true,
            });

            googleMapRef.current = map;

            const marker = new window.google.maps.Marker({
                position: center,
                map,
                draggable: true,
            });

            markerRef.current = marker;

            map.addListener("click", (e: any) => {
                const newCoords = { lat: e.latLng.lat(), lng: e.latLng.lng(), zoom: map.getZoom() };
                marker.setPosition(newCoords);
                onLocationChange(newCoords);
            });

            marker.addListener("dragend", (e: any) => {
                const newCoords = { lat: e.latLng.lat(), lng: e.latLng.lng(), zoom: map.getZoom() };
                onLocationChange(newCoords);
            });
        };

        loadGoogleMaps();

        return () => {
            // Cleanup script if needed, but usually once loaded it's fine
        };
    }, [apiKey]);

    return <div ref={mapRef} className="w-full h-full" />;
}

declare global {
    interface Window {
        google: any;
        initGoogleMap: () => void;
    }
}

export function PropertyAddForm({ allAgents, allOwners, googleMapsApiKey }: PropertyAddFormProps) {
    const router = useRouter();
    const { register, control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<any>({
        resolver: zodResolver(propertySchema),
        defaultValues: {
            title: "",
            propertyType: "agricultural",
            address: "",
            statusDetails: [{ status: "sell" }],
            isUnknownMeasurement: false,
            isPriceUnknown: false,
            isTotalPrice: false,
            measurementValue: "",
            measurementType: "acer",
            owners: [],
            agents: [],
            hasOwner: false,
            hasAgent: false,
            description: "",
            hasLocation: false,
            mapDetails: { lat: 22.244, lng: 68.9654, zoom: 12 },
            images: [],
            documents: [],
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "statusDetails"
    });

    const isUnknownMeasurement = watch("isUnknownMeasurement");
    const isPriceUnknown = watch("isPriceUnknown");
    const hasOwner = watch("hasOwner");
    const hasAgent = watch("hasAgent");
    const hasLocation = watch("hasLocation");
    const mapDetails = watch("mapDetails");
    const currentStatuses = watch("statusDetails") || [];
    const selectedStatusIds = useMemo(() => currentStatuses.map((s: any) => s.status), [currentStatuses]);

    const toggleStatus = (status: PropertyStatus) => {
        const index = currentStatuses.findIndex((s: any) => s.status === status);
        if (index > -1) {
            if (currentStatuses.length > 1) {
                remove(index);
            } else {
                toast.error("At least one status is required");
            }
        } else {
            append({ status, price: "" });
        }
    };

    const onSubmit: SubmitHandler<any> = async (values) => {
        try {
            // Prepare data for server action
            const submitData = {
                ...values,
                mapDetails: values.hasLocation ? values.mapDetails : null
            };
            const property = await createProperty(submitData);

            // ⚡ Finalize documents (move from temp and create DB records)
            const allDocs = [
                ...values.images,
                ...values.documents
            ];

            if (allDocs.length > 0) {
                await finalizePropertyDocuments(property.id, allDocs);
            }

            toast.success("Property added successfully!");
            router.push("/property");
        } catch (error) {
            console.error(error);
            toast.error("Failed to add property");
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
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <div className="relative">
                                <Input {...register("title")} placeholder="Enter value" className="pl-10 rounded-xl h-12" />
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            </div>
                            {errors.title?.message && <p className="text-xs text-destructive">{String(errors.title.message)}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select onValueChange={(val) => setValue("propertyType", val as PropertyType)} defaultValue="agricultural">
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
                        <div className="space-y-2 md:col-span-1">
                            <Label>Address</Label>
                            <div className="relative">
                                <Input {...register("address")} placeholder="Enter value" className="pl-10 rounded-xl h-12" />
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            </div>
                            {errors.address?.message && <p className="text-xs text-destructive">{String(errors.address.message)}</p>}
                        </div>
                        <div className="space-y-2 md:col-span-1">
                            <Label>Status</Label>
                            <DropdownMenu>
                                <DropdownMenuTrigger render={
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between h-12 rounded-xl border-border hover:bg-muted/50"
                                    >
                                        <div className="flex flex-wrap gap-1 items-center overflow-hidden">
                                            {selectedStatusIds.length > 0 ? (
                                                selectedStatusIds.map((status: PropertyStatus) => (
                                                    <span key={status} className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full capitalize">
                                                        {status}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-muted-foreground">Select status</span>
                                            )}
                                        </div>
                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                } />
                                <DropdownMenuContent className="w-full min-w-50 rounded-xl" align="start">
                                    {Object.values(PropertyStatus).map((status) => (
                                        <DropdownMenuCheckboxItem
                                            key={status}
                                            checked={selectedStatusIds.includes(status)}
                                            onCheckedChange={() => toggleStatus(status)}
                                            onSelect={(e) => e.preventDefault()}
                                            className="capitalize cursor-pointer"
                                        >
                                            {status}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Measurement */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="p-6 rounded-[2rem] border-border bg-card shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-black flex items-center gap-2">
                            <Layers className="text-primary" size={20} />
                            Measurement
                        </h3>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="isUnknownMeasurement" onCheckedChange={(val) => setValue("isUnknownMeasurement", !!val)} />
                            <Label htmlFor="isUnknownMeasurement">Unknown Measurement</Label>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Measurement</Label>
                            <div className="relative">
                                <Input
                                    {...register("measurementValue")}
                                    type="number"
                                    disabled={isUnknownMeasurement}
                                    placeholder="Enter value"
                                    className="pl-10 rounded-xl h-12"
                                />
                                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                disabled={isUnknownMeasurement}
                                onValueChange={(val) => setValue("measurementType", val as MeasurementType)}
                                defaultValue="acer"
                            >
                                <SelectTrigger className="rounded-xl h-12 w-full">
                                    <SelectValue placeholder="Select type">
                                        {watch("measurementType") ? (
                                            watch("measurementType").charAt(0).toUpperCase() + watch("measurementType").slice(1)
                                        ) : "Select type"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(MeasurementType).map((type) => (
                                        <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Price */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="p-6 rounded-[2rem] border-border bg-card shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <h3 className="text-lg font-black flex items-center gap-2">
                            <IndianRupee className="text-primary" size={20} />
                            Price
                        </h3>
                        <div className="flex gap-6">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="isPriceUnknown" onCheckedChange={(val) => setValue("isPriceUnknown", !!val)} />
                                <Label htmlFor="isPriceUnknown">Price Unknown</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="isTotalPrice" disabled={isPriceUnknown} onCheckedChange={(val) => setValue("isTotalPrice", !!val)} />
                                <Label htmlFor="isTotalPrice">Is Total Price</Label>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {fields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-3xl bg-muted/30 relative group">
                                <div className="space-y-2 text-wrap">
                                    <Label className="capitalize">{(field as any).status}</Label>
                                    <div className="relative">
                                        <Input
                                            {...register(`statusDetails.${index}.price` as const)}
                                            type="number"
                                            disabled={isPriceUnknown}
                                            placeholder="Enter value"
                                            className="pl-10 rounded-xl h-12"
                                        />
                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                    </div>
                                </div>
                                {(field as any).status === "rent" && (
                                    <div className="space-y-2">
                                        <Label>Duration</Label>
                                        <Select
                                            onValueChange={(val) => setValue(`statusDetails.${index}.durationTypeId`, val as DurationType)}
                                            defaultValue="month"
                                        >
                                            <SelectTrigger className="rounded-xl h-12 w-full">
                                                <SelectValue placeholder="Select duration" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(DurationType).map((type) => (
                                                    <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                {fields.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute -right-2 -top-2 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => remove(index)}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            </motion.div>

            {/* Ownership */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card className="p-6 rounded-[2rem] border-border bg-card shadow-sm">
                    <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                        <User className="text-primary" size={20} />
                        Ownership
                    </h3>
                    <div className="space-y-8">
                        {/* Owners Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                            <div className="flex items-center space-x-2 pb-3">
                                <Checkbox id="hasOwner" onCheckedChange={(val) => setValue("hasOwner", !!val)} />
                                <Label htmlFor="hasOwner">Has Owner</Label>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1 space-y-2">
                                    <Label>Owners</Label>
                                    <Select
                                        disabled={!hasOwner}
                                        onValueChange={(val: string | null) => {
                                            if (!val) return;
                                            const current = watch("owners") || [];
                                            if (!current.includes(val)) setValue("owners", [...current, val]);
                                        }}
                                    >
                                        <SelectTrigger className="rounded-xl h-12 w-full">
                                            <SelectValue placeholder="Select owners">
                                                Select owners
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allOwners.map(o => (
                                                <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="button" size="icon" className="h-12 w-12 rounded-xl mt-auto" disabled={!hasOwner}>
                                    <Plus size={20} />
                                </Button>
                            </div>
                        </div>

                        {/* Agents Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                            <div className="flex items-center space-x-2 pb-3">
                                <Checkbox id="hasAgent" onCheckedChange={(val) => setValue("hasAgent", !!val)} />
                                <Label htmlFor="hasAgent">Has Agent</Label>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1 space-y-2">
                                    <Label>Agents</Label>
                                    <Select
                                        disabled={!hasAgent}
                                        onValueChange={(val: string | null) => {
                                            if (!val) return;
                                            const current = watch("agents") || [];
                                            if (!current.includes(val)) setValue("agents", [...current, val]);
                                        }}
                                    >
                                        <SelectTrigger className="rounded-xl h-12 w-full">
                                            <SelectValue placeholder="Select agents">
                                                Select agents
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allAgents.map(a => (
                                                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="button" size="icon" className="h-12 w-12 rounded-xl mt-auto" disabled={!hasAgent}>
                                    <Plus size={20} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Description */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Card className="p-6 rounded-[2rem] border-border bg-card shadow-sm">
                    <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                        <Briefcase className="text-primary" size={20} />
                        Description
                    </h3>
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-border p-4 bg-muted/20 min-h-75 flex flex-col">
                            {/* Toolbar placeholder */}
                            <div className="flex flex-wrap gap-1 mb-4 p-1.5 bg-card rounded-xl border border-border">
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 font-black text-xs">B</Button>
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 italic text-xs">I</Button>
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 underline text-xs font-serif">U</Button>
                                <div className="w-px bg-border mx-1 my-1.5" />
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
                                    <div className="w-3 h-0.5 bg-foreground mb-0.5" />
                                    <div className="w-3 h-0.5 bg-foreground mb-0.5" />
                                    <div className="w-3 h-0.5 bg-foreground" />
                                </Button>
                            </div>
                            <textarea
                                {...register("description")}
                                placeholder="Description..."
                                className="w-full h-full flex-1 bg-transparent border-none outline-hidden resize-none text-sm leading-relaxed scrollbar-hide"
                            />
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Media & Documents */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
                <div className="grid grid-cols-1 gap-8">
                    {/* Images / Video Section */}
                    <Card className="p-8 rounded-[2.5rem] border-border bg-card shadow-sm overflow-hidden relative">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-primary/10 p-2.5 rounded-2xl">
                                <Image size={22} className="text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-foreground tracking-tight">Images / Video</h3>
                                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Property visual media assets</p>
                            </div>
                        </div>
                        <PropertyImageUploadZone
                            onFilesChange={(files: any[]) => {
                                const mapped = files.map((f: any, idx: number) => ({
                                    ...f,
                                    documentType: PropertyDocumentType.preview,
                                    orderId: idx,
                                    isPrivate: !!f.isPrivate
                                }));
                                setValue("images", mapped);
                            }}
                        />
                    </Card>

                    {/* Documents Section */}
                    <Card className="p-8 rounded-[2.5rem] border-border bg-card shadow-sm overflow-hidden relative">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-primary/10 p-2.5 rounded-2xl">
                                <FileText size={22} className="text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-foreground tracking-tight">Documents</h3>
                                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Legal and supportive paperwork</p>
                            </div>
                        </div>
                        <PropertyDocumentUploadZone
                            onFilesChange={(files: any[]) => {
                                const mapped = files.map((f: any, idx: number) => ({
                                    ...f,
                                    documentType: "document" as PropertyDocumentType,
                                    orderId: idx,
                                    isPrivate: !!f.isPrivate
                                }));
                                setValue("documents", mapped);
                            }}
                        />
                    </Card>
                </div>
            </motion.div>

            {/* Location */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <Card className="p-6 rounded-[2rem] border-border bg-card shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-black flex items-center gap-2">
                            <MapPin className="text-primary" size={20} />
                            Location
                        </h3>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="hasLocation"
                                checked={hasLocation}
                                onCheckedChange={(val) => setValue("hasLocation", !!val)}
                            />
                            <Label htmlFor="hasLocation">Has Location</Label>
                        </div>
                    </div>

                    {hasLocation && (
                        <div className="space-y-4">
                            <div className="w-full h-100 rounded-3xl overflow-hidden border border-border relative bg-muted animate-pulse flex items-center justify-center">
                                <GoogleMapWrapper
                                    apiKey={googleMapsApiKey}
                                    center={mapDetails || { lat: 23.0225, lng: 72.5714 }}
                                    zoom={mapDetails?.zoom || 12}
                                    onLocationChange={(coords) => setValue("mapDetails", coords)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-muted/30 border border-border">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Latitude</Label>
                                    <div className="font-mono text-sm">{mapDetails?.lat.toFixed(6)}</div>
                                </div>
                                <div className="p-4 rounded-2xl bg-muted/30 border border-border">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Longitude</Label>
                                    <div className="font-mono text-sm">{mapDetails?.lng.toFixed(6)}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>
            </motion.div>

            {/* Sticky Actions */}
            <FooterButtons>
                <Button variant="outline" type="button" className="rounded-full px-8 h-12 font-bold" onClick={() => router.back()}>
                    Cancel
                </Button>
                <Button type="submit" className="rounded-full px-12 h-12 font-black shadow-lg shadow-primary/20" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Save Property"}
                </Button>
            </FooterButtons>
        </form>
    );
}
