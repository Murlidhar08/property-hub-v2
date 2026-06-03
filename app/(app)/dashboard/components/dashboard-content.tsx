"use client";

import { useUserConfig } from "@/components/providers/user-config-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { t } from "@/lib/languages/i18n";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bookmark,
  Building2,
  CheckCircle2,
  Plus,
  Users,
  Zap
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";

interface DashboardContentProps {
  initialData: {
    stats: {
      totalProperties: number;
      activeRequirements: number;
      totalUsers: number;
      totalAgreements: number;
      propertyDistribution: Array<{ type: string; count: number }>;
      requirementDistribution: Array<{ type: string; count: number }>;
    };
    activities: Array<{
      id: string;
      type: "property" | "requirement";
      title: string;
      subtitle: string;
      time: Date;
      link: string;
    }>;
  };
  userName: string;
}

const COLORS = [
  "#6366f1", // primary/indigo
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#ef4444", // red
  "#8b5cf6", // violet
];

export function DashboardContent({ initialData, userName }: DashboardContentProps) {
  const { language } = useUserConfig();
  const router = useRouter();

  const portfolioData = initialData.stats.propertyDistribution.map(d => ({
    name: d.type.charAt(0).toUpperCase() + d.type.slice(1),
    value: d.count
  }));

  const marketData = initialData.stats.requirementDistribution.map(d => ({
    name: d.type.charAt(0).toUpperCase() + d.type.slice(1),
    value: d.count
  }));

  const stats = [
    {
      title: t("dashboard.stats.properties", language),
      value: initialData.stats.totalProperties,
      icon: <Building2 className="text-primary" size={24} />,
      bg: "bg-primary/5",
      border: "border-primary/10",
      link: "/property"
    },
    {
      title: t("dashboard.stats.active_requirements", language),
      value: initialData.stats.activeRequirements,
      icon: <Bookmark className="text-amber-500" size={24} />,
      bg: "bg-amber-500/5",
      border: "border-amber-500/10",
      link: "/requirement"
    },
    {
      title: t("dashboard.stats.total_users", language),
      value: initialData.stats.totalUsers,
      icon: <Users className="text-indigo-500" size={24} />,
      bg: "bg-indigo-500/5",
      border: "border-indigo-500/10",
      link: "/admin"
    },
    {
      title: t("dashboard.stats.agreements", language),
      value: initialData.stats.totalAgreements,
      icon: <CheckCircle2 className="text-emerald-500" size={24} />,
      bg: "bg-emerald-500/5",
      border: "border-emerald-500/10",
      link: "/property"
    },
  ];

  const formatRelativeTime = (date: Date) => {
    const diff = new Date().getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Premium Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl sm:text-4xl font-black tracking-tight text-foreground flex items-center gap-3"
          >
            Welcome, <span className="text-primary">{userName}</span> <Zap className="fill-primary text-primary" size={28} />
          </motion.h1>
          <p className="text-muted-foreground font-medium mt-2 text-lg">
            Monitor and manage your property portfolio with ease.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={() => router.push("/property/add" as any)}
            className="flex-1 sm:flex-none rounded-2xl h-12 px-8 font-black shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105 active:scale-95 gap-2"
          >
            <Plus size={20} />
            Add Property
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -5 }}
            className="cursor-pointer"
            onClick={() => router.push(stat.link as any)}
          >
            <Card className={`p-6 rounded-[2.5rem] border-2 ${stat.border} ${stat.bg} shadow-sm hover:shadow-2xl hover:shadow-black/5 transition-all duration-300 relative overflow-hidden group`}>
              <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-300 transform group-hover:scale-125 group-hover:-rotate-12">
                {stat.icon}
                <div className="w-32 h-32" />
              </div>
              <div className="flex justify-between items-start relative z-10">
                <div className="p-4 rounded-2xl bg-background shadow-sm ring-1 ring-border/50 group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 bg-background/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-border/50">
                  Real-time
                </div>
              </div>
              <div className="mt-6 relative z-10">
                <p className="text-xs font-bold text-muted-foreground/70 uppercase tracking-[0.2em] mb-1">{stat.title}</p>
                <h3 className="text-4xl font-black tracking-tighter group-active:scale-95 transition-transform">{stat.value}</h3>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Analytics & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Estate Allocation Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="p-8 rounded-[3rem] border-border bg-card shadow-sm h-full relative overflow-hidden group">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-4 relative z-10">
              <div>
                <h3 className="text-2xl font-black tracking-tight">Estate Allocation</h3>
                <p className="text-sm text-muted-foreground font-medium">Comparison of supply vs demand across sectors</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-90 relative z-10">
              <div className="flex flex-col items-center">
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-2">Portfolio (Supply)</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolioData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {portfolioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                      itemStyle={{ fontWeight: '800', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col items-center">
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-amber-500 mb-2">Market (Demand)</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={marketData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {marketData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                      itemStyle={{ fontWeight: '800', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 mt-4 relative z-10">
              {portfolioData.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{d.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-8 rounded-[3rem] border-border bg-card shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black tracking-tight">Recent Activity</h3>
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Zap size={18} className="text-primary fill-primary" />
              </div>
            </div>

            <div className="space-y-8 flex-1 relative">
              {initialData.activities.length > 0 ? (
                initialData.activities.map((activity, idx) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    className="group cursor-pointer relative pl-12"
                    onClick={() => router.push(activity.link as any)}
                  >
                    {idx !== initialData.activities.length - 1 && (
                      <div className="absolute left-4.75 top-10 bottom-0 w-0.5 bg-linear-to-b from-border to-transparent" />
                    )}

                    <div className={`absolute left-0 top-0 h-10 w-10 rounded-3xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${activity.type === 'property'
                      ? 'bg-blue-600 text-white shadow-blue-600/20'
                      : 'bg-amber-600 text-white shadow-amber-600/20'
                      }`}>
                      {activity.type === 'property' ? <Building2 size={18} /> : <Bookmark size={18} />}
                    </div>

                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-sm font-black tracking-tight group-hover:text-primary transition-colors leading-tight">
                          {activity.title}
                        </h4>
                        <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap bg-muted px-2 py-1 rounded-lg">
                          {formatRelativeTime(activity.time)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium mt-1 truncate group-hover:translate-x-1 transition-transform">{activity.subtitle}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
                  <div className="h-16 w-16 rounded-[2rem] bg-muted/30 flex items-center justify-center text-muted-foreground/30">
                    <Zap size={32} />
                  </div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest opacity-50">Empty Stream</p>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={() => router.push("/property" as any)}
              className="w-full mt-10 rounded-2xl h-12 font-black border-border shadow-sm group hover:bg-muted/50 transition-all gap-2"
            >
              View Full Logs
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </Card>
        </motion.div>
      </div>

      {/* Simplified Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ y: -5 }}
          className="group cursor-pointer relative"
          onClick={() => router.push("/property" as any)}
        >
          <div className="bg-primary/5 border-2 border-primary/20 p-8 rounded-[3rem] flex flex-col justify-between h-40 transition-colors hover:bg-primary/10">
            <h4 className="text-primary text-xl font-black tracking-tight">Active Portfolio</h4>
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              View Listings <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="group cursor-pointer"
          onClick={() => router.push("/requirement" as any)}
        >
          <div className="bg-amber-500/5 border-2 border-amber-500/20 p-8 rounded-[3rem] flex flex-col justify-between h-40 transition-colors hover:bg-amber-500/10">
            <h4 className="text-amber-600 text-xl font-black tracking-tight">Market Leads</h4>
            <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
              View Demands <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="group cursor-pointer"
          onClick={() => router.push("/tool" as any)}
        >
          <div className="bg-indigo-500/5 border-2 border-indigo-500/20 p-8 rounded-[3rem] flex flex-col justify-between h-40 transition-colors hover:bg-indigo-500/10">
            <h4 className="text-indigo-600 text-xl font-black tracking-tight">System Tools</h4>
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
              Launch Utility <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
