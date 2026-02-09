import { Suspense, lazy, type ReactNode } from "react";
import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/app/AppLayout";
import { PageSkeleton } from "@/components/PageSkeleton";

const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const LinkDetailsPage = lazy(() => import("@/pages/LinkDetailsPage"));
const AnalyticsPage = lazy(() => import("@/pages/AnalyticsPage"));
const ExplorePage = lazy(() => import("@/pages/ExplorePage"));

function withSuspense(node: ReactNode): ReactNode {
  return <Suspense fallback={<PageSkeleton />}>{node}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: withSuspense(<DashboardPage />) },
      { path: "links/:shortCode", element: withSuspense(<LinkDetailsPage />) },
      {
        path: "links/:shortCode/analytics",
        element: withSuspense(<AnalyticsPage />)
      },
      { path: "explore", element: withSuspense(<ExplorePage />) }
    ]
  }
]);
