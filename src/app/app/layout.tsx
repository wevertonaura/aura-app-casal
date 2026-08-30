import { requireCoupleUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileTabBar } from "@/components/layout/MobileTabBar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireCoupleUser();
  const couple = await db.couple.findUniqueOrThrow({
    where: { id: user.coupleId! },
    include: { users: true },
  });

  const members = couple.users.map((u) => ({
    name: u.name,
    monthlyIncome: Number(u.monthlyIncome),
    avatarUrl: u.avatarUrl,
  }));
  const coupleIncome = members.reduce((sum, m) => sum + m.monthlyIncome, 0);

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar userName={user.name} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar members={members} coupleIncome={coupleIncome} />
        <main className="flex-1 px-4 pb-20 pt-6 sm:px-6 lg:pb-6">{children}</main>
      </div>
      <MobileTabBar />
    </div>
  );
}
