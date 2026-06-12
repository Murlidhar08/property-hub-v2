import { getPropertyByUserId } from "@/actions/property.actions";
import { getRequirementsByUserId } from "@/actions/requirement.actions";
import { getUserById } from "@/actions/user.actions";
import PropertyList from "@/components/property/property-list";
import RequirementList from "@/components/requirement/requirement-list";
import AppTabs from "@/components/tab/app-tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import {
    AtSign,
    Briefcase,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    Fingerprint,
    Hash,
    History,
    Key,
    MapPin,
    UserCheck,
    UserCircle,
    User as UserIcon
} from "lucide-react";
import { notFound } from "next/navigation";
import { InfoItem } from "./components/info-item";
import { UserHeaderMenu } from "./components/user-header-menu";

export default async function UserDetailsPage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;
    const user = await getUserById(userId);

    if (!user) notFound();

    // Roles
    const roles = [];
    if (user.role === "admin") roles.push("Admin");
    user.userRoleMappings?.forEach((m) => {
        roles.push(m.roleType.charAt(0).toUpperCase() + m.roleType.slice(1));
    });
    if (roles.length === 0) roles.push("User");

    // List of requirements for this user
    const requirements = await getRequirementsByUserId(userId);

    // List of property for this user
    const property = await getPropertyByUserId(userId);

    const getRoleBadgeColor = (role: string) => {
        switch (role.toLowerCase()) {
            case "admin": return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
            case "agent": return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
            case "client": return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20";
            case "owner": return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20";
            default: return "bg-muted text-muted-foreground border-border";
        }
    };

    const provider = user.accounts?.[0]?.providerId || "Credentials";

    const tabs = [
        {
            id: "general",
            label: "GENERAL",
            icon: <UserIcon size={18} />,
            content: (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Basic Information */}
                    <Card className="p-8 rounded-[2rem] border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20" />
                        <h3 className="text-sm font-black text-foreground/80 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                            <UserIcon size={16} className="text-primary" />
                            Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            <InfoItem icon={<Hash size={18} />} label="User ID" value={user.id} />
                            <InfoItem icon={<UserIcon size={18} />} label="Name" value={user.name} />
                        </div>
                    </Card>

                    {/* Account Information */}
                    <Card className="p-8 rounded-[2rem] border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500/20" />
                        <h3 className="text-sm font-black text-foreground/80 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                            <Key size={16} className="text-indigo-500" />
                            Account Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            <InfoItem icon={<AtSign size={18} />} label="User Name" value={user.username || "N/A"} />
                            <InfoItem icon={<Fingerprint size={18} />} label="Provider Type" value={provider} />
                            <InfoItem icon={<CheckCircle2 size={18} />} label="Account Verified" value={user.emailVerified ? "Yes" : "No"} />
                            <InfoItem icon={<UserCheck size={18} />} label="User Status" value={user.status} highlight />
                            <InfoItem icon={<Key size={18} />} label="Roles" value={
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {roles.map((role) => (
                                        <Badge key={role} className={cn("border px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider", getRoleBadgeColor(role))}>
                                            {role}
                                        </Badge>
                                    ))}
                                </div>
                            } />
                            <InfoItem icon={<History size={18} />} label="Attempt Count" value="0" />
                        </div>
                    </Card>

                    {/* Additional Information */}
                    <Card className="p-8 rounded-[2rem] border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500/20" />
                        <h3 className="text-sm font-black text-foreground/80 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                            <Briefcase size={16} className="text-amber-500" />
                            Additional Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <InfoItem icon={<Briefcase size={18} />} label="Occupation" value={user.occupation || "Unknown"} />
                            <InfoItem icon={<MapPin size={18} />} label="Address" value={user.address || "Unknown"} />
                        </div>
                    </Card>

                    {/* Metadata */}
                    <Card className="p-8 rounded-[2rem] border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500/20" />
                        <h3 className="text-sm font-black text-foreground/80 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                            <Clock size={16} className="text-emerald-500" />
                            Metadata
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                            <InfoItem icon={<Calendar size={18} />} label="Created" value={`${formatDistanceToNow(new Date(user.createdAt))} ago`} />
                            <InfoItem icon={<UserCircle size={18} />} label="Created By" value="System" />
                            <InfoItem icon={<Calendar size={18} />} label="Created At" value={format(new Date(user.createdAt), "yyyy-MM-dd HH:mm:ss")} />
                            <InfoItem icon={<UserCircle size={18} />} label="Updated By" value="System" />
                            <InfoItem icon={<Calendar size={18} />} label="Updated At" value={format(new Date(user.updatedAt), "yyyy-MM-dd HH:mm:ss")} />
                        </div>
                    </Card>
                </div>
            )
        },
        {
            id: "documents",
            label: "DOCUMENT",
            icon: <FileText size={18} />,
            content: (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in zoom-in duration-500">
                    <div className="p-6 bg-muted rounded-full">
                        <FileText size={48} className="text-muted-foreground/40" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-foreground">No Documents Found</h3>
                        <p className="text-muted-foreground font-medium">User has not uploaded any identification documents yet.</p>
                    </div>
                </div>
            )
        },
        {
            id: "requirements",
            label: "REQUIREMENTS",
            icon: <FileText size={18} />,
            content: (
                <RequirementList requirements={requirements} />
            )
        },
        {
            id: "properties",
            label: "PROPERTIES",
            icon: <FileText size={18} />,
            content: (
                <PropertyList property={property} />
            )
        },
    ];

    return (
        <div className="min-h-full w-full bg-background p-4 sm:p-8 lg:p-12 space-y-10 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-4 border-b border-border/50">
                <div className="flex items-center gap-6">
                    <UserHeaderMenu userId={userId} />
                    <div className="relative group">
                        <div className="absolute -inset-1.5 bg-linear-to-tr from-primary to-indigo-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-500" />
                        <Avatar className="h-24 w-24 sm:h-28 sm:w-28 rounded-[2.5rem] border-4 border-background shadow-2xl relative">
                            <AvatarImage src={user.image || ""} className="object-cover" />
                            <AvatarFallback className="bg-primary/5 text-primary text-3xl font-black">
                                {user.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-foreground">{user.name}</h1>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-muted-foreground font-bold text-sm">
                            <span className="flex items-center gap-1.5 text-primary/80">
                                <AtSign size={14} />
                                {user.username || `${user.name.toLowerCase().replace(' ', '_')}`}
                            </span>
                            <span className="hidden sm:inline-block h-1.5 w-1.5 rounded-full bg-border" />
                            <span className="flex items-center gap-1.5">
                                <MapPin size={14} />
                                {user.address || "Unknown Location"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center flex-wrap gap-2">
                    {roles.map((role) => (
                        <Badge key={role} className={cn("border px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xs transition-all duration-300 hover:scale-105", getRoleBadgeColor(role))}>
                            {role}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Content Tabs */}
            <AppTabs
                defaultTab="general"
                tabs={tabs}
            />
        </div>
    );
}