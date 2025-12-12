/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  TrendingUp,
  Users,
  Map,
  Globe,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from "lucide-react";

export default function AnalyticsPage() {
    const API_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // stats data
  const [stats, setStats] = useState<any>(null);
  const [popularDestinations, setPopularDestinations] = useState([]);

  // loading states
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingDestinations, setLoadingDestinations] = useState(true);

  const loading = loadingStats || loadingDestinations;

  // redirect if unauthenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?redirect=/dashboard/analytics");
    }
  }, [isLoading, user, router]);

  // fetch main stats
  useEffect(() => {
    if (user) {
      const endpoint =
        user.role === "ADMIN"
          ? `${API_URL}/api/v1/admin/stats/users`
          : `${API_URL}/api/v1/stats/user`;

      const fetchStats = async () => {
        try {
          const res = await fetch(endpoint, {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });

          const json = await res.json();
          setStats(json.data);
        } catch (err) {
          console.error("Error fetching stats:", err);
        } finally {
          setLoadingStats(false);
        }
      };

      fetchStats();
    }
  }, [user]);

  // fetch popular destinations (admin only)
  useEffect(() => {
    if (user?.role === "ADMIN") {
      const fetchPopularDestinations = async () => {
        try {
          const res = await fetch(
            `${API_URL}/api/v1/admin/stats/popular-destinations`,
            {
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            }
          );

          const json = await res.json();
          setPopularDestinations(json.data || []);
        } catch (err) {
          console.error("Error fetching destinations:", err);
        } finally {
          setLoadingDestinations(false);
        }
      };

      fetchPopularDestinations();
    } else {
      setLoadingDestinations(false);
    }
  }, [user]);

  // loading UI
  if (isLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Analytics & Insights</h1>
            <p className="text-muted-foreground">
              Track platform performance and growth metrics
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

            {/* Total Users */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalUsers ?? 0}
                </div>
                <p className="text-xs text-success flex items-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3" />
                  <span>{stats?.growthRate ?? "0%"}</span>
                </p>
              </CardContent>
            </Card>

            {/* Active Plans */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Plans
                </CardTitle>
                <Map className="h-4 w-4 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.activePlans ?? 0}
                </div>
                <p className="text-xs text-success flex items-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3" />
                  <span>+8% from last month</span>
                </p>
              </CardContent>
            </Card>

            {/* Platform Rating */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Platform Rating
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.platformRating ?? 0}/5.0
                </div>
                <p className="text-xs text-success flex items-center gap-1 mt-1">
                  <ArrowUp className="h-3 w-3" />
                  <span>+0.3 from last month</span>
                </p>
              </CardContent>
            </Card>

            {/* Engagement */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Engagement Rate
                </CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.engagementRate ?? "0%"}
                </div>

                {Number((stats?.engagementRate || "0").replace("%", "")) >=
                70 ? (
                  <p className="text-xs text-success flex items-center gap-1 mt-1">
                    <ArrowUp className="h-3 w-3" />
                    <span>Stable engagement</span>
                  </p>
                ) : (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <ArrowDown className="h-3 w-3" />
                    <span>Engagement dropped</span>
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>Monthly new user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Chart placeholder - Integration ready
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Travel Plans Created</CardTitle>
                <CardDescription>Monthly travel plan creation rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Chart placeholder - Integration ready
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Popular Destinations */}
          {user.role === "ADMIN" && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Popular Destinations</CardTitle>
                <CardDescription>
                  Top travel destinations this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loadingDestinations ? (
                    <p className="text-muted-foreground">
                      Loading destinations...
                    </p>
                  ) : popularDestinations.length === 0 ? (
                    <p className="text-muted-foreground">
                      No popular destinations found
                    </p>
                  ) : (
                    popularDestinations.map((item: any, index: number) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="font-medium">{index + 1}</div>
                          <div>
                            <p className="font-medium">
                              {item.destination}, {item.country}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {item.plansCount} travel plans
                            </p>
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          {(
                            (item.plansCount /
                              popularDestinations[0]?.plansCount) *
                            100
                          ).toFixed(0)}
                          %
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
