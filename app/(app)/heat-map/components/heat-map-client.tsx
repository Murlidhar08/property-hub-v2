"use client";

import { Button } from "@/components/ui/button";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuGroup,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
   ChevronDown,
   Layers
} from "lucide-react";
import { useState } from "react";
import { GoogleHeatMap } from "./google-heat-map";

interface HeatMapClientProps {
   properties: any[];
   googleMapsApiKey: string;
   googleMapsId: string;
}

/**
 * HeatMapClient Component
 * 
 * Provides an immersive, full-screen map experience for visualizing market density.
 * Features optimized floating overlays with glassmorphism effects.
 */
export default function HeatMapClient({ properties, googleMapsApiKey, googleMapsId }: HeatMapClientProps) {
   const [activeLayer, setActiveLayer] = useState("Price Density");

   const analysisLayers = [
      { id: 'price', label: 'Price Density', description: 'Concentration of property values' },
   ];

   return (
      <div className="relative w-full h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] bg-gray-900 overflow-hidden">

         {/* UI Overlays */}
         <div className="absolute inset-0 pointer-events-none z-20 p-4 flex flex-col justify-between">

            {/* Top Toolbar */}
            <div className="pointer-events-auto flex items-center gap-3">
               <DropdownMenu>
                  <DropdownMenuTrigger>
                     <Button
                        variant="secondary"
                        className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-gray-100 dark:border-white/10 shadow-2xl rounded-2xl h-10 px-4 font-black text-[10px] uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400 transition-all hover:scale-105 active:scale-95"
                     >
                        <Layers size={16} className="mr-3" />
                        {activeLayer}
                        <ChevronDown size={14} className="ml-3 opacity-40" />
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-72 p-2 rounded-3xl border-gray-100 dark:border-white/10 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                     <DropdownMenuGroup>
                        <DropdownMenuSeparator className="bg-gray-100 dark:bg-white/5 mx-2" />
                        {analysisLayers.map((layer) => (
                           <DropdownMenuItem
                              key={layer.id}
                              onClick={() => setActiveLayer(layer.label)}
                              className={`p-4 rounded-2xl cursor-pointer transition-all mb-1 ${activeLayer === layer.label
                                 ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                                 : 'hover:bg-gray-50 dark:hover:bg-white/5'
                                 }`}
                           >
                              <div className="flex flex-col gap-1">
                                 <div className="flex items-center justify-between font-black text-[10px] uppercase tracking-widest">
                                    {layer.label}
                                    {activeLayer === layer.label && <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
                                 </div>
                                 <p className={`text-[8px] font-bold leading-tight ${activeLayer === layer.label ? 'opacity-80' : 'opacity-40'}`}>
                                    {layer.description}
                                 </p>
                              </div>
                           </DropdownMenuItem>
                        ))}
                     </DropdownMenuGroup>
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>

            {/* Bottom Metrics Indicator */}
            <div className="pointer-events-auto w-fit bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg px-6 py-4 rounded-[1.5rem] border border-gray-100 dark:border-white/5 shadow-xl">
               <div className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400 flex items-center gap-2">
                  {properties.length} Properties
               </div>
            </div>
         </div>

         {/* Map Layer */}
         <div className="absolute inset-0 z-10 bg-gray-100 dark:bg-slate-900 overflow-hidden">
            <GoogleHeatMap
               properties={properties}
               apiKey={googleMapsApiKey}
               mapId={googleMapsId}
            />
         </div>
      </div>
   );
}
