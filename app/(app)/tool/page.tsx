"use client"

import AppTabs from "@/components/tab/app-tabs";
import { Calculator, Users } from "lucide-react";
import PartnershipCalculator from "./components/partership-calculator";
import ProfitCalculator from "./components/profilt-calculator";
import { AppHeader } from "@/components/app-header";

export default function ToolsPage() {
  const tabs = [
    {
      id: "profit",
      label: "PROFIT CALCULATOR",
      icon: <Calculator size={18} />,
      content: <ProfitCalculator />
    },
    {
      id: "partner",
      label: "PARTNERSHIP",
      icon: <Users size={18} />,
      content: <PartnershipCalculator />
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-34">
      <AppHeader title={"Tools"} />

      <div className="mx-auto max-w-4xl mt-6 space-y-8 px-6">
        <AppTabs
          defaultTab="profit"
          tabs={tabs}
        />
      </div>
    </div>
  );
}
