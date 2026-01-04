"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  Users, 
  TrendingUp,
  Plane,
  Star,
  Plus,
  Edit,
  Map,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminStats {
  totalUsers: number;
  verifiedUsers: number;
  activePlans: number;
  growthRate: string;
  platformRating: number;
  engagementRate: string;
}

interface UserStats {
  totalPlans: number;
  activePlans: number;
  avgRating: number;
  countryCount: number;
  totalReviews:number;
}
// 
interface Upcoming {
      destination:string;
      plansCount:number;
      country:string;
      id:number;
      interests:string[];
      startDate: string;
      endDate:string;

}
export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [upcomingPlans, setUpcomingPlans] = useState<Upcoming[]>([]);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/dashboard');
    }
  }, [user, authLoading, router]);

  // Fetch Admin Stats
  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/v1/admin/stats/users`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch admin stats');
      const result = await res.json();
      setAdminStats(result.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load admin statistics');
    } finally {
      setLoading(false);
    }
  };

  // Fetch User Stats
  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/v1/stats/user`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch user stats');
      const data = await res.json();
      setUserStats(data?.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load your statistics');
    } finally {
      setLoading(false);
    }
  };

  // Fetch User's Upcoming Plans
  const fetchUpcomingPlans = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/admin/stats/popular-destinations`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch travel plans');
      const result = await res.json();
      setUpcomingPlans(result.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'ADMIN') {
        fetchAdminStats();
      } else {
        fetchUserStats();
        fetchUpcomingPlans();
      }
    }
  }, [authLoading, user]);

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null;
  }

  // Admin View
  if (user.role === 'ADMIN' && adminStats) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-muted/30">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage users, travel plans, and platform activity</p>
            </div>

            {/* Admin Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminStats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">Registered users</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
                  <Plane className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminStats.activePlans}</div>
                  <p className="text-xs text-muted-foreground">Current travel plans</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminStats.verifiedUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    {adminStats.totalUsers > 0 
                      ? `${Math.round((adminStats.verifiedUsers / adminStats.totalUsers) * 100)}% verification rate`
                      : 'No users yet'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminStats.growthRate}</div>
                  <p className="text-xs text-muted-foreground">Platform growth</p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Stats */}
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Platform Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminStats.platformRating.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground">Average user rating</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adminStats.engagementRate}</div>
                  <p className="text-xs text-muted-foreground">Active users</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Access Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Link href="/dashboard/users">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <Users className="h-10 w-10 text-primary mb-2" />
                    <CardTitle>Manage Users</CardTitle>
                    <CardDescription>View and manage all registered users</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/dashboard/travels">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <Map className="h-10 w-10 text-primary mb-2" />
                    <CardTitle>Manage Travels</CardTitle>
                    <CardDescription>Monitor all travel plans</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/dashboard/reviews">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <Star className="h-10 w-10 text-primary mb-2" />
                    <CardTitle>Manage Reviews</CardTitle>
                    <CardDescription>Moderate user reviews</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // User View
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
            <p className="text-muted-foreground">Track your travel plans and connections</p>
          </div>

          {/* User Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
                <Plane className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {userStats ? (
                  <>
                    <div className="text-2xl font-bold">{userStats.activePlans}</div>
                    <p className="text-xs text-muted-foreground">Currently planning</p>
                  </>
                ) : (
                  <Loader2 className="h-5 w-5 animate-spin" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {userStats ? (
                  <>
                    <div className="text-2xl font-bold">{userStats.totalPlans}</div>
                    <p className="text-xs text-muted-foreground">All time</p>
                  </>
                ) : (
                  <Loader2 className="h-5 w-5 animate-spin" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {userStats ? (
                  <>
                    <div className="text-2xl font-bold">{userStats.avgRating.toFixed(1)}</div>
                    <p className="text-xs text-muted-foreground">{userStats?.totalReviews} reviews</p>
                  </>
                ) : (
                  <Loader2 className="h-5 w-5 animate-spin" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Countries</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {userStats ? (
                  <>
                    <div className="text-2xl font-bold">{userStats.countryCount}</div>
                    <p className="text-xs text-muted-foreground">Visited</p>
                  </>
                ) : (
                  <Loader2 className="h-5 w-5 animate-spin" />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button asChild>
                  <Link href="/travel-plans/add">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Travel Plan
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/explore">
                    <Users className="mr-2 h-4 w-4" />
                    Find Travel Buddies
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/profile/${user.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Travel Plans */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Upcoming Travel Plans</CardTitle>
                  <CardDescription>Your active travel plans</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/travel-plans">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingPlans.length > 0 ? (
                <div className="space-y-4">
                  {upcomingPlans.map((plan) => (
                    <div key={plan.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{plan.destination}, {plan.country}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(plan.startDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {plan.interests?.slice(0, 3).map((interest, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{interest}</Badge>
                            ))}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/travel-plans/${plan.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No active travel plans</p>
                  <Button asChild>
                    <Link href="/travel-plans/add">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Plan
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}