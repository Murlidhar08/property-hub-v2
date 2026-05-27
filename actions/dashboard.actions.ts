"use server";

import { getUserSession } from "@/lib/auth/auth";
import { RequirementStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma/prisma";


export async function getFirstName() {
  const session = await getUserSession();

  return session?.user.name.split(" ")[0];
}


export async function getDashboardStats() {
  const session = await getUserSession();
  if (!session) throw new Error("Unauthorized");

  const [
    totalProperties,
    activeRequirements,
    totalUsers,
    totalAgreements,
    propertyDistribution,
    requirementDistribution,
    recentProperties,
    recentRequirements
  ] = await Promise.all([
    prisma.property.count(),
    prisma.requirement.count({ where: { status: RequirementStatus.active } }),
    prisma.user.count({ where: { status: "approved" } }),
    prisma.propertyAgreement.count({ where: { status: "active" } }),
    prisma.property.groupBy({
      by: ['propertyType'],
      _count: {
        _all: true
      }
    }),
    prisma.requirement.groupBy({
      by: ['propertyType'],
      _count: {
        _all: true
      }
    }),
    prisma.property.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        address: true,
        createdAt: true,
        propertyType: true
      }
    }),
    prisma.requirement.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        location: true,
        createdAt: true,
        propertyType: true
      }
    })
  ]);

  // Grouping activities
  const activities = [
    ...recentProperties.map((p: any) => ({
      id: `p-${p.id}`,
      type: "property" as const,
      title: `New Property: ${p.title}`,
      subtitle: p.address,
      time: p.createdAt,
      link: `/property/${p.id}`
    })),
    ...recentRequirements.map((r: any) => ({
      id: `r-${r.id}`,
      type: "requirement" as const,
      title: `New Requirement: ${r.title}`,
      subtitle: r.location,
      time: r.createdAt,
      link: `/requirement/${r.id}`
    }))
  ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5);

  return {
    stats: {
      totalProperties,
      activeRequirements,
      totalUsers,
      totalAgreements,
      propertyDistribution: propertyDistribution.map((d: any) => ({
        type: d.propertyType,
        count: d._count._all
      })),
      requirementDistribution: requirementDistribution.map((d: any) => ({
        type: d.propertyType,
        count: d._count._all
      }))
    },
    activities
  };
}
