"use client"

import AppTabs from "@/components/tab/app-tabs";
import { Calculator, Users } from "lucide-react";
import PartnershipCalculator from "./components/partership-calculator";
import ProfitCalculator from "./components/profilt-calculator";

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
    <div className="min-h-full w-full p-4 sm:p-10 space-y-10 max-w-7xl mx-auto">
      <AppTabs
        defaultTab="profit"
        tabs={tabs}
      />
    </div>
  );
}
