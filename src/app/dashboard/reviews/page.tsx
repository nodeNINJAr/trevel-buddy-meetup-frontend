/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, AlertCircle, CheckCircle, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Review, ReviewStatus } from '@/types';

interface ReviewStats {
  totalReviews: number;
  approvedReviews: number;
  pendingReviews: number;
  avgRating: number;
}

export default function ReviewsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    approvedReviews: 0,
    pendingReviews: 0,
    avgRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  // Redirect non-admins
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/login?redirect=/dashboard/reviews');
    }
  }, [user, isLoading, router]);

  // Fetch stats
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await fetch(`${BASE_URL}/api/v1/admin/stats/reviews`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data?.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load review statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/v1/reviews`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      setReviews(data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && user?.role === "ADMIN") {
      fetchStats();
      fetchReviews();
    }
  }, [isLoading, user]);

  if (isLoading || loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!user || user.role !== 'ADMIN') return null;

  // API actions
  const handleUpdateStatus = async (reviewId: number, status: ReviewStatus.APPROVED | ReviewStatus.PENDING) => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/reviews/${reviewId}/status?status=${status}`, {
        method: 'PUT',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to update status');
      toast.success(`Review ${status === ReviewStatus.APPROVED ? 'approved' : 'set to pending'}`);
      fetchReviews();
      fetchStats(); // Refresh stats after update
    } catch (err) {
      console.error(err);
      toast.error('Failed to update review status');
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/reviews/${reviewId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete review');
      toast.success('Review deleted successfully');
      fetchReviews();
      fetchStats(); // Refresh stats after delete
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete review');
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Review Management</h1>
            <p className="text-muted-foreground">Monitor and moderate user reviews</p>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.totalReviews}</div>
                    <p className="text-xs text-muted-foreground">All time</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.approvedReviews}</div>
                    <p className="text-xs text-muted-foreground">Published reviews</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.pendingReviews}</div>
                    <p className="text-xs text-muted-foreground">Awaiting moderation</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                <ThumbsUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</div>
                    <p className="text-xs text-muted-foreground">Out of 5 stars</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Reviews List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
              <CardDescription>Latest user reviews and ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No reviews found</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={review?.fromUser?.profile?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review?.fromUser?.profile?.fullName}`} />
                            <AvatarFallback>{review?.fromUser?.profile?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{review.fromUser?.profile?.fullName || 'Anonymous'}</p>
                            <p className="text-sm text-muted-foreground">
                              reviewed {review?.toUser?.profile?.fullName || 'Unknown User'}
                            </p>
                          </div>
                        </div>
                        <Badge className="capitalize" variant={review.status === ReviewStatus.APPROVED ? 'default' : 'outline'}>
                          {review.status.toLowerCase()}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      
                      <p className="text-sm mb-3">{review?.comment || 'No comment provided'}</p>
                      
                      <div className="flex gap-2">
                        {review.status === ReviewStatus.PENDING ? (
                          <>
                            <Button size="sm" onClick={() => handleUpdateStatus(review.id, ReviewStatus.APPROVED)}>
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteReview(review.id)}>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(review.id, ReviewStatus.PENDING)}>
                              Set Pending
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteReview(review.id)}>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}