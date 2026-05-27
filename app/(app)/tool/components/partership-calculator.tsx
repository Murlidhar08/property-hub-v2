"use client"

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { rupeeToWords } from "@/utility/amount-fn";
import { formatIndianNumber } from "@/utility/formatters";
import { AnimatePresence, motion } from "framer-motion";
import { toPng } from 'html-to-image';
import {
    Calculator,
    ChevronRight,
    Download,
    PieChart as PieChartIcon,
    Plus,
    RotateCcw,
    Trash2,
    TrendingDown,
    TrendingUp,
    Users
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip
} from 'recharts';
import { toast } from "sonner";

interface Partner {
    id: string;
    name: string;
    amount: string;
}

export default function PartnershipCalculator() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [dealInputs, setDealInputs] = useState({
        totalBuyingPrice: "",
        totalSellingPrice: ""
    });

    const [partners, setPartners] = useState<Partner[]>([
        { id: '1', name: 'Partner 1', amount: '' }
    ]);

    const captureImage = async () => {
        if (!containerRef.current) return;
        
        setIsExporting(true);
        const toastId = toast.loading("Generating your deal summary...");

        try {
            const node = containerRef.current;
            const dataUrl = await toPng(node, {
                cacheBust: true,
                backgroundColor: '#0a0c10',
                width: node.scrollWidth,
                height: node.scrollHeight,
                style: {
                    padding: '40px',
                    borderRadius: '0px',
                    margin: '0',
                }
            });

            const link = document.createElement('a');
            link.download = `property-partnership-${new Date().toISOString().split('T')[0]}.png`;
            link.href = dataUrl;
            link.click();
            
            toast.success("Deal summary exported successfully!", { id: toastId });
        } catch (err) {
            console.error(err);
            toast.error("Failed to export deal summary. Please try again.", { id: toastId });
        } finally {
            setIsExporting(false);
        }
    };

    const addPartner = () => {
        setPartners([...partners, { id: Math.random().toString(36).substr(2, 9), name: `Partner ${partners.length + 1}`, amount: '' }]);
    };

    const removePartner = (id: string) => {
        if (partners.length > 1) {
            setPartners(partners.filter(p => p.id !== id));
        }
    };

    const updatePartner = (id: string, field: keyof Partner, value: string) => {
        setPartners(partners.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const resetForm = () => {
        setDealInputs({ totalBuyingPrice: "", totalSellingPrice: "" });
        setPartners([{ id: '1', name: 'Partner 1', amount: '' }]);
    };

    const stats = useMemo(() => {
        const buy = parseFloat(dealInputs.totalBuyingPrice) || 0;
        const sell = parseFloat(dealInputs.totalSellingPrice) || 0;
        const totalProfit = sell - buy;
        const dealROI = buy > 0 ? (totalProfit / buy) * 100 : 0;

        let totalContributed = 0;
        const partnerDetails = partners.map(p => {
            const amount = parseFloat(p.amount) || 0;
            totalContributed += amount;
            const sharePercentage = buy > 0 ? (amount / buy) * 100 : 0;
            const profitShare = (sharePercentage / 100) * totalProfit;
            const totalReturn = amount + profitShare;

            return {
                ...p,
                amountNum: amount,
                sharePercentage: sharePercentage.toFixed(2),
                profitShare,
                totalReturn
            };
        });

        const fundingProgress = buy > 0 ? (totalContributed / buy) * 100 : 0;

        const colors = ['#A855F7', '#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];
        const chartData = partnerDetails.map((p, i) => ({
            name: p.name || `Partner ${i + 1}`,
            value: parseFloat(p.sharePercentage),
            color: colors[i % colors.length]
        }));

        const remainingAmount = buy - totalContributed;
        if (remainingAmount > 0) {
            const remainingShare = (remainingAmount / buy) * 100;
            chartData.push({
                name: 'Unfunded',
                value: remainingShare,
                color: 'rgba(255,255,255,0.05)'
            });
        }

        return {
            totalProfit,
            dealROI,
            totalContributed,
            partnerDetails,
            chartData,
            remainingAmount,
            fundingProgress
        };
    }, [dealInputs, partners]);

    return (
        <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Input Section */}
            <div className="lg:col-span-7 space-y-6">
                <Card className="p-6 sm:p-8 rounded-[2.5rem] border-gray-100 bg-white dark:bg-card shadow-sm space-y-8 relative overflow-hidden">
                    <div className="flex justify-between items-start relative z-10">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3 uppercase">
                            <Calculator className="text-indigo-500" size={20} />
                            Deal Parameters
                        </h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={resetForm}
                            className="rounded-full hover:bg-red-50 hover:text-red-500 text-gray-400 transition-colors"
                        >
                            <RotateCcw size={18} />
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                        {[
                            { id: 'totalBuyingPrice', label: 'Total Buying Price', color: 'text-indigo-500' },
                            { id: 'totalSellingPrice', label: 'Total Selling Price', color: 'text-purple-500' }
                        ].map((field) => (
                            <div key={field.id} className="space-y-3">
                                <div className="flex justify-between items-end px-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                        {field.label}
                                    </label>
                                    <span className={`text-[10px] font-bold ${field.color}/60 italic truncate max-w-[120px]`}>
                                        {rupeeToWords(parseFloat(dealInputs[field.id as keyof typeof dealInputs]) || 0)}
                                    </span>
                                </div>
                                <div className="relative group">
                                    <div className={`absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-300 group-focus-within:${field.color} transition-colors`}>₹</div>
                                    <Input
                                        placeholder="0"
                                        value={dealInputs[field.id as keyof typeof dealInputs]}
                                        onChange={(e) => setDealInputs(p => ({ ...p, [field.id]: e.target.value.replace(/[^0-9.]/g, "") }))}
                                        className={`pl-14 h-16 bg-gray-50/50 dark:bg-muted/30 border-gray-100 dark:border-border/50 rounded-2xl focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:ring-${field.color.split('-')[1]}-100 font-bold text-xl`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-6 sm:p-8 rounded-[2.5rem] border-gray-100 bg-white dark:bg-card shadow-sm space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3 uppercase">
                                <Users className="text-purple-500" size={20} />
                                Partnership Tracking
                            </h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Allocation of capital</p>
                        </div>
                        <Button
                            onClick={addPartner}
                            variant="outline"
                            className="rounded-xl font-black text-[10px] uppercase tracking-widest border-indigo-100 text-indigo-500 hover:bg-indigo-50 h-10 px-4"
                        >
                            <Plus size={16} className="mr-2" /> Add Partner
                        </Button>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                            <span>Funding Progress</span>
                            <span className={stats.fundingProgress > 100 ? 'text-red-500' : 'text-indigo-500'}>
                                {stats.fundingProgress.toFixed(1)}% / 100%
                            </span>
                        </div>
                        <div className="h-3 bg-gray-100 dark:bg-muted rounded-full overflow-hidden flex">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(stats.fundingProgress, 100)}%` }}
                                className={`h-full ${stats.fundingProgress > 100 ? 'bg-red-500' : 'bg-indigo-500'} rounded-full`}
                            />
                        </div>

                        {stats.remainingAmount > 0 && (
                            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                                <TrendingUp size={16} />
                                Unallocated: ₹ {formatIndianNumber(stats.remainingAmount)}
                            </div>
                        )}

                        {stats.remainingAmount < 0 && (
                            <div className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-500/10 text-red-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                                <TrendingDown size={16} />
                                Exceeded Budget: ₹ {formatIndianNumber(Math.abs(stats.remainingAmount))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        <AnimatePresence initial={false}>
                            {partners.map((partner) => (
                                <motion.div
                                    key={partner.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="p-5 rounded-[2rem] border border-gray-50 dark:border-border/50 bg-gray-50/30 dark:bg-muted/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 group hover:bg-white transition-all shadow-sm shadow-transparent hover:shadow-gray-100"
                                >
                                    <div className="flex-1">
                                        <Input
                                            placeholder="Partner Name"
                                            value={partner.name}
                                            onChange={(e) => updatePartner(partner.id, 'name', e.target.value)}
                                            className="h-8 bg-transparent border-none focus-visible:ring-0 font-black text-gray-700 dark:text-white p-0 placeholder:text-gray-300 text-lg"
                                        />
                                        <div className="text-[9px] font-black uppercase tracking-widest text-gray-300 flex items-center gap-2 mt-1">
                                            Capital Contribution
                                        </div>
                                    </div>
                                    <div className="flex-[1.5] relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-300 group-focus-within:text-purple-500 transition-colors">₹</div>
                                        <Input
                                            placeholder="0"
                                            value={partner.amount}
                                            onChange={(e) => updatePartner(partner.id, 'amount', e.target.value.replace(/[^0-9.]/g, ""))}
                                            className="pl-10 h-12 bg-white dark:bg-card border-gray-100 dark:border-border rounded-xl focus-visible:ring-purple-100 font-bold"
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removePartner(partner.id)}
                                        className="rounded-full text-gray-200 hover:text-red-500 hover:bg-red-50 transition-colors"
                                        disabled={partners.length === 1}
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </Card>
            </div>

            {/* Results Section */}
            <div className="lg:col-span-5 space-y-6">
                <Card className="p-8 rounded-[2.5rem] border-none bg-slate-950 text-white shadow-2xl h-full flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

                    <div className="flex justify-between items-center mb-8 relative z-10">
                        <h2 className="text-xl font-black text-white/90 tracking-tight uppercase flex items-center gap-3">
                            <PieChartIcon className="text-purple-400" size={20} />
                            Investment ROI
                        </h2>
                        <Button
                            size="icon"
                            onClick={captureImage}
                            disabled={isExporting}
                            className={`text-white hover:bg-white/5 rounded-full transition-all ${isExporting ? 'animate-pulse scale-90' : ''}`}
                        >
                            <Download size={18} />
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                        <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">Project Profit</p>
                            <p className="text-2xl font-black text-emerald-400">₹ {formatIndianNumber(stats.totalProfit)}</p>
                        </div>
                        <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">Deal ROI</p>
                            <p className="text-2xl font-black text-indigo-400">{stats.dealROI.toFixed(1)}%</p>
                        </div>
                    </div>

                    <div className="flex-1 min-h-[260px] relative z-10">
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={stats.chartData}
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    animationBegin={0}
                                    animationDuration={1500}
                                    stroke="none"
                                >
                                    {stats.chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff', fontWeight: 'bold' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '20px', fontSize: '10px', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.1em' }} />
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="absolute top-[42%] left-[50%] -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Investors</p>
                            <p className="text-3xl font-black text-white leading-none mt-1">{partners.length}</p>
                        </div>
                    </div>

                    <div className="space-y-4 mt-8 overflow-y-auto pr-2 custom-scrollbar relative z-10">
                        {stats.partnerDetails.map((partner, idx) => (
                            <div key={partner.id} className="p-6 rounded-[2rem] border border-white/5 bg-white/5 group hover:bg-white/10 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{partner.name || `Partner ${idx + 1}`}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="h-2 w-2 rounded-full bg-indigo-500" />
                                            <p className="text-sm font-black text-white/90">{partner.sharePercentage}% Equity</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400/60 flex items-center justify-end gap-1">
                                            <TrendingUp size={10} /> Profit
                                        </p>
                                        <p className="text-lg font-black text-emerald-400 leading-none mt-1">+₹ {formatIndianNumber(partner.profitShare)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                                            <ChevronRight size={14} />
                                        </div>
                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Maturity Return</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-black text-white">₹ {formatIndianNumber(partner.totalReturn)}</p>
                                        <p className="text-[8px] font-bold text-white/10 truncate max-w-[150px] italic">
                                            {rupeeToWords(partner.totalReturn)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
