import { container } from "@/src/di";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const getDashboardStatsUseCase = container().getDashboardStatsUseCase();
  const { listingsWithReviews, overallStats } = await getDashboardStatsUseCase.execute();

  return (
    <DashboardClient 
      initialListings={listingsWithReviews}
      initialStats={overallStats}
    />
  );
}
