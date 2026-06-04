"use client";

import { motion } from "framer-motion";
import {
  Building2,
  Clock,
  Filter,
  Home,
  IndianRupee,
  Layers,
  Layout,
  MapPin,
  Search,
  Trees
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RequirementHeaderMenu } from "./requirement-header-menu";
import { AddRequirementButton } from "./add-requirement-button";
import { PropertyType } from "@/lib/generated/prisma/enums";
import { typeIcons } from "@/components/property/property-icons";

interface RequirementListProps {
  initialRequirements: any[];
}

export function RequirementList({ initialRequirements }: RequirementListProps) {
  const [search, setSearch] = useState("");

  const filteredRequirements = initialRequirements.filter(req =>
    req.title.toLowerCase().includes(search.toLowerCase()) ||
    req.location.toLowerCase().includes(search.toLowerCase()) ||
    req.creator?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0
    }).format(value);
  };

  const getPriceRange = (min: any, max: any) => {
    if (!min && !max) return "At Any Price";
    if (min && max) return `₹ ${formatCurrency(Number(min))} - ${formatCurrency(Number(max))}`;
    if (min) return `From ₹ ${formatCurrency(Number(min))}`;
    if (max) return `Up to ₹ ${formatCurrency(Number(max))}`;
    return "At Any Price";
  };

  const getMeasurementRange = (min: any, max: any, type: any) => {
    if (!min && !max) return "Unknown";
    const typeLabel = type ? ` / ${type}` : "";
    if (min && max) return `${Number(min)} - ${Number(max)}${typeLabel}`;
    if (min) return `${Number(min)}+${typeLabel}`;
    if (max) return `Up to ${Number(max)}${typeLabel}`;
    return "Unknown";
  };

  return (
    <>
      {/* Search Header */}
      <div className="bg-card rounded-[2.5rem] p-4 shadow-sm mb-10 flex flex-col md:flex-row items-center justify-between gap-6 border border-border">
        <div className="flex items-center gap-4 w-full md:max-w-2xl px-2">
          <div className="relative w-full group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
            <Input
              placeholder="Search requirements by title, location or creator..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-muted/30 border-border rounded-2xl h-14 pr-6 pl-14 focus-visible:ring-primary/10 focus-visible:border-primary transition-all font-bold text-sm placeholder:text-muted-foreground"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-muted/50 rounded-2xl border border-border shrink-0 mr-2">
          <Filter size={18} className="text-muted-foreground" />
          <div className="h-4 w-px bg-border mx-1" />
          <span className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.2em]">Found</span>
          <span className="text-primary font-black text-xl">{filteredRequirements.length}</span>
        </div>
      </div>

      {/* Requirements List */}
      <div className="grid grid-cols-1 gap-6 pb-24">
        {filteredRequirements.length === 0 ? (
          <div className="text-center py-20 font-bold text-muted-foreground uppercase tracking-[0.2em] text-xs bg-card rounded-[2.5rem] border border-border">
            No requirements found in the database.
          </div>
        ) : filteredRequirements.map((req, idx) => (
          <motion.div
            key={req.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group"
          >
            <div className="relative bg-card rounded-[2rem] p-4 border border-border shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all duration-300 overflow-hidden flex flex-col md:flex-row items-center gap-6">
              {/* Descriptive section as a single Link */}
              <Link href={`/requirement/${req.id}` as any} className="flex-1 flex flex-col md:flex-row items-center gap-6 min-w-0">
                {/* Compact Icon */}
                <div className="w-16 h-16 shrink-0 bg-muted rounded-2xl flex items-center justify-center border border-border shadow-inner group-hover:scale-105 transition-transform duration-500 relative overflow-hidden">
                  <div className="relative z-10 transition-transform duration-500 group-hover:rotate-12">
                    {typeIcons[req.propertyType] || <Layout className="text-primary" size={28} />}
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 w-full min-w-0">
                  <div className="flex items-center gap-3 mb-2.5">
                    <h3 className="text-lg font-black text-foreground tracking-tight group-hover:text-primary transition-colors uppercase truncate">
                      {req.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div className="flex items-center text-[11px] font-bold text-muted-foreground">
                      <MapPin size={12} className="mr-1.5 text-primary/60" /> {req.location}
                    </div>
                    <div className="flex items-center text-[11px] font-bold text-muted-foreground">
                      <Layers size={12} className="mr-1.5 text-amber-500/60" /> {getMeasurementRange(req.minMeasurement, req.maxMeasurement, req.measurementType)}
                    </div>
                    <div className="flex items-center text-[11px] font-bold text-muted-foreground">
                      <IndianRupee size={12} className="mr-1.5 text-emerald-500/60" /> {getPriceRange(req.minPrice, req.maxPrice)}
                    </div>
                    <div className="flex items-center text-[9px] font-black text-muted-foreground opacity-40 uppercase tracking-widest">
                      <Clock size={10} className="mr-1.5" />
                      {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </Link>

              {/* Right side actions */}
              <div className="flex items-center gap-4 shrink-0 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-border">
                <div className="hidden lg:block bg-muted px-3 py-1.5 rounded-full border border-border">
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                    {req.propertyType}
                  </span>
                </div>

                <Link href={`/requirement/${req.id}#property` as any} className="flex-1 md:flex-none">
                  <Button variant="outline" className="w-full md:px-6 rounded-xl font-black text-[10px] uppercase tracking-widest h-11 border-border hover:bg-foreground hover:text-background transition-all shadow-sm">
                    Find Matches
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Floating Action Button */}
      <AddRequirementButton />
    </>
  );
}
