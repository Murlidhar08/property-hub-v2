import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import UserForm from "../components/user-form";

export default function UserAddPage() {
    return (
        <div className="flex-1 min-h-screen bg-background/50 p-4 sm:p-8 lg:p-12 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border/50 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="space-y-3">
                        <Link href="/admin">
                            <Button variant="ghost" size="sm" className="rounded-full px-4 border border-border/50 bg-muted/20 hover:bg-muted font-black uppercase tracking-widest text-[10px] items-center gap-2 mb-4">
                                <ArrowLeft size={14} />
                                Back to Admin
                            </Button>
                        </Link>
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
                                <UserPlus size={32} />
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground uppercase">
                                    Add New User
                                </h1>
                                <p className="text-muted-foreground font-medium flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Create a new system user with specialized roles
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <UserForm />
            </div>
        </div>
    );
}
