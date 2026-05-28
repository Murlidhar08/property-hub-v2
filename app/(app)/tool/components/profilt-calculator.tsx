"use client"

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { rupeeToWords } from "@/utility/amount-fn";
import { formatIndianNumber } from "@/utility/formatters";
import { toPng } from 'html-to-image';
import {
    BadgeDollarSign,
    Calculator,
    ChevronRight,
    Download,
    IndianRupee,
    Percent,
    RotateCcw,
    TrendingUp,
    UserCheck
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export default function ProfitCalculator() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [profitInputs, setProfitInputs] = useState({
        totalBuyingPrice: "",
        investedByYou: "",
        totalSellingPrice: ""
    });

    const captureProfitImage = async () => {
        if (!containerRef.current) return;

        setIsExporting(true);
        const toastId = toast.loading("Generating your profit summary...");

        try {
            const node = containerRef.current;
            const dataUrl = await toPng(node, {
                cacheBust: true,
                backgroundColor: '#ffffff',
                width: node.scrollWidth,
                height: node.scrollHeight,
                style: {
                    padding: '40px',
                    borderRadius: '0px',
                    margin: '0',
                }
            });

            const link = document.createElement('a');
            link.download = `profit-analysis-${new Date().toISOString().split('T')[0]}.png`;
            link.href = dataUrl;
            link.click();

            toast.success("Profit analysis exported successfully!", { id: toastId });
        } catch (err) {
            console.error(err);
            toast.error("Failed to export. Please try again.", { id: toastId });
        } finally {
            setIsExporting(false);
        }
    };

    const resetInputs = () => {
        setProfitInputs({ totalBuyingPrice: "", investedByYou: "", totalSellingPrice: "" });
    };

    const profitStats = useMemo(() => {
        const buy = parseFloat(profitInputs.totalBuyingPrice) || 0;
        const invest = parseFloat(profitInputs.investedByYou) || 0;
        const sell = parseFloat(profitInputs.totalSellingPrice) || 0;

        const totalProfit = sell - buy;
        const investmentPercentage = buy ? (invest / buy) * 100 : 0;
        const profitPercentage = buy ? (totalProfit / buy) * 100 : 0;
        const yourShareInSale = (investmentPercentage / 100) * sell;
        const netProfit = yourShareInSale - invest;

        return {
            investmentPercentage: investmentPercentage.toFixed(2),
            profitPercentage: profitPercentage.toFixed(2),
            totalProfit,
            yourShareInSale,
            netProfit,
        };
    }, [profitInputs]);

    return (
        <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Input Section */}
            <Card className="lg:col-span-6 p-6 sm:p-8 rounded-[2.5rem] border-gray-100 bg-white dark:bg-card shadow-sm space-y-8 h-full">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black text-gray-900 dark:text-foreground tracking-tight flex items-center gap-3 uppercase">
                        <Calculator className="text-purple-500" size={20} />
                        Investment Details
                    </h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={resetInputs}
                        className="rounded-full hover:bg-red-50 hover:text-red-500 text-gray-400 transition-colors"
                    >
                        <RotateCcw size={18} />
                    </Button>
                </div>
                <div className="space-y-6">
                    {[
                        { id: 'totalBuyingPrice', label: 'Total Buying Price' },
                        { id: 'investedByYou', label: 'Invested By You' },
                        { id: 'totalSellingPrice', label: 'Total Selling Price' }
                    ].map((field) => (
                        <div key={field.id} className="space-y-2.5">
                            <div className="flex justify-between items-end ml-1">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                    {field.label}
                                </label>
                                <span className="text-[10px] font-bold text-purple-500/60 lowercase italic">
                                    {rupeeToWords(parseFloat(profitInputs[field.id as keyof typeof profitInputs]) || 0)}
                                </span>
                            </div>
                            <div className="relative group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-400 text-lg group-focus-within:text-purple-500 transition-colors">₹</div>
                                <Input
                                    placeholder="0"
                                    value={profitInputs[field.id as keyof typeof profitInputs]}
                                    onChange={(e) => setProfitInputs(p => ({ ...p, [field.id]: e.target.value.replace(/[^0-9.]/g, "") }))}
                                    className="pl-14 h-16 bg-gray-50/50 dark:bg-muted/30 border-gray-100 dark:border-border/50 rounded-2xl focus-visible:ring-purple-100 font-bold text-xl transition-all hover:bg-white dark:hover:bg-muted/50"
                                    type="text"
                                    inputMode="decimal"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Result Section */}
            <Card className="lg:col-span-6 p-6 sm:p-8 rounded-[2.5rem] border-none bg-[#0a0c10] text-white shadow-2xl space-y-8 h-full">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black text-white/90 tracking-tight uppercase">Profit Summary</h2>
                    <Button
                        size="icon"
                        onClick={captureProfitImage}
                        disabled={isExporting}
                        className={`text-white hover:bg-white/5 rounded-full transition-all ${isExporting ? 'animate-pulse scale-90' : ''}`}
                    >
                        <Download size={18} />
                    </Button>
                </div>

                {/* Top Badges */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 group hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-2 mb-2 text-white/30">
                            <UserCheck size={14} className="text-purple-400" />
                            <p className="text-[9px] font-black uppercase tracking-[0.2em]">Investment Share</p>
                        </div>
                        <div className="text-3xl font-black text-purple-400">{profitStats.investmentPercentage}%</div>
                    </div>
                    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 group hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-2 mb-2 text-white/30">
                            <Percent size={14} className="text-emerald-400" />
                            <p className="text-[9px] font-black uppercase tracking-[0.2em]">Profit Yield (ROI)</p>
                        </div>
                        <div className={`text-3xl font-black ${parseFloat(profitStats.profitPercentage) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{profitStats.profitPercentage}%</div>
                    </div>
                </div>

                {/* List Details */}
                <div className="space-y-4">
                    {[
                        { label: 'Total Profit', value: profitStats.totalProfit, color: 'text-purple-400', icon: TrendingUp },
                        { label: 'Your Share (Total Return)', value: profitStats.yourShareInSale, color: 'text-indigo-400', icon: BadgeDollarSign },
                        { label: 'Net Profit (Earnings)', value: profitStats.netProfit, color: 'text-emerald-400', icon: IndianRupee, large: true }
                    ].map((item, idx) => (
                        <div key={idx} className={`p-6 rounded-[2rem] border border-white/5 flex items-center justify-between transition-all hover:translate-x-1 ${item.large ? 'bg-linear-to-r from-emerald-500/20 to-transparent shadow-lg shadow-emerald-500/5' : 'bg-white/5'}`}>
                            <div className="flex items-center gap-5">
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center bg-white/5 ${item.color}`}>
                                    <item.icon size={22} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-0.5">{item.label}</p>
                                    <p className={`${item.large ? 'text-3xl' : 'text-xl'} font-black text-white`}>₹ {formatIndianNumber(item.value)}</p>
                                    <p className="text-[8px] font-bold text-white/20 whitespace-nowrap mt-1 italic tracking-widest uppercase">
                                        {rupeeToWords(item.value)}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-white/20" />
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
