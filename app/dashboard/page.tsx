import type { ReactElement } from "react";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { createInsforgeServer } from "@/lib/insforge-server";

export default async function DashboardPage(): Promise<ReactElement> {
  const insforge = await createInsforgeServer();
  const {
    data: { user },
  } = await insforge.auth.getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      <Navbar showCta={false} showLogout />
      <main className="min-h-screen bg-background">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-6 py-8 lg:px-12">
          <StatsBar />
          <AnalyticsCharts activity={<RecentActivity />} />
        </div>
      </main>
    </>
  );
}
