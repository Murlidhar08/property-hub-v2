import { getProperties } from "@/actions/property.actions";
import { AddPropertyButton } from "@/app/(app)/property/components/add-property-button";
import { PropertiesGrid } from "@/app/(app)/property/components/properties-grid";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MoreVertical,
  Search,
} from "lucide-react";

export default async function PropertiesPage() {
  const properties = await getProperties();

  return (
    <>
      <AppHeader title={"Property"} />

      <div className="h-full bg-background p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {/* Search Header */}
        <div className="bg-card rounded-2xl p-4 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-4 border border-border">
          <div className="flex items-center gap-4 w-full md:max-w-xl">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <MoreVertical size={20} />
            </Button>
            <div className="relative w-full group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
              <Input
                placeholder="Search e.g. type:plot"
                className="w-full bg-background border-border rounded-full h-12 pr-12 pl-6 focus-visible:ring-primary/20 focus-visible:border-primary transition-all font-medium"
              />
            </div>
          </div>
          <div className="text-muted-foreground font-bold text-lg">
            Found <span className="text-foreground">{properties.length}</span> properties
          </div>
        </div>

        {/* Property Grid (Client side for animations) */}
        <PropertiesGrid properties={properties as any} />

        {/* Floating Action Button (Client side) */}
        <AddPropertyButton />
      </div>
    </>
  );
}
