import { getUserDetails } from "@/actions/user.actions";
import { UserDetailView } from "@/components/user/user-detail-view";
import { notFound } from "next/navigation";

interface OwnerPageProps {
  params: Promise<{ ownerId: string }>;
}

export default async function OwnerDetailPage({ params }: OwnerPageProps) {
  const { ownerId } = await params;
  const user = await getUserDetails(ownerId);

  if (!user) {
    notFound();
  }

  return <UserDetailView user={user} role="owner" />;
}
