/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Star, StarOff, Trash2, Edit3, MessageSquarePlus, Calendar, UserCheck, UserPlus, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type Review = {
  id: number;
  comment: string;
  rating: number;
  toUserId: number;
  fromUserId: number;
  travelPlanId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  fromUser?: {
    id: number;
    userName: string;
    email: string;
     profile?: {
        fullName: string;
        
    }
  };
  toUser?: {
    id: number;
    userName: string;
    email: string;
    profile?: {
        fullName: string;

    }
  };
};

type TravelPlanData = {
  reviews: Review[];
  userId: number;
  user: {
    id: number;
    userName: string;
  };
};

export default function ClientReviews() {
  const [travelPlanId, setTravelPlanId] = useState<string | null>(null);
  const [toUserId, setToUserId] = useState<string | null>(null);
  // const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const { user: authUser, isLoading: sessionLoading } = useAuth();
  const currentUserId = authUser?.id || null;
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [reviewsAboutMe, setReviewsAboutMe] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Get base URL safely
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return (window as any).NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || '';
    }
    return process.env.NEXT_PUBLIC_BASE_URL || '';
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tripId = params.get("tripId");
      const userId = params.get("userId");
      setTravelPlanId(tripId);
      setToUserId(userId);
    }
  }, []);
  useEffect(() => {
    if (!travelPlanId) return;

    const fetchTravelPlanData = async () => {
      try {
        setLoading(true);
        setError(null);

        const baseUrl = getBaseUrl();
        if (!baseUrl) {
          throw new Error("Base URL is not configured");
        }

        const res = await fetch(
          `${baseUrl}/api/v1/travel/${travelPlanId}`,
          { credentials: "include" }
        );

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to fetch travel plan");
        }

        const data = await res.json();
        const travelPlan: TravelPlanData = data.data;
        // const userId = travelPlan.userId;
        // setCurrentUserId(userId);
        const r = await fetch(
          `${baseUrl}/api/v1/reviews/my`,
          { credentials: "include" }
        );

        if (!r.ok) {
          const errorData = await r.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to fetch my reviews");
        }

        const reviewsData = await r.json();
        const reviews = reviewsData.data || [];
        const myReviewsList = reviews.filter((r: Review) => r.fromUserId === currentUserId);
        const aboutMeList = reviews.filter((r: Review) => r.toUserId === currentUserId);
        setMyReviews(myReviewsList);
        setReviewsAboutMe(aboutMeList);
        console.log(reviews, myReviewsList, aboutMeList, currentUserId, travelPlan.userId);
      } catch (err: any) {
        console.error("Error fetching travel plan:", err);
        setError(err.message || "Failed to fetch reviews");
        toast.error(err.message || "Failed to fetch reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchTravelPlanData();
  }, [travelPlanId, currentUserId]);

  const handleCreateReview = async () => {
    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }
    if (newRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      const baseUrl = getBaseUrl();
      if (!baseUrl) {
        throw new Error("Base URL is not configured");
      }

      const res = await fetch(
        `${baseUrl}/api/v1/reviews?toUserId=${toUserId}&travelPlanId=${travelPlanId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ comment: newComment, rating: newRating }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create review");
      }

      const data = await res.json();
      toast.success("Review created successfully!");
      setMyReviews(prev => [...prev, data.data]);
      setShowDialog(false);
      setNewComment("");
      setNewRating(0);
      setHoveredRating(0);
    } catch (err: any) {
      console.error("Error creating review:", err);
      toast.error(err.message || "Failed to create review");
    }
  };

  const handleUpdateReview = async (reviewId: number) => {
    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }
    if (newRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      const baseUrl = getBaseUrl();
      if (!baseUrl) {
        throw new Error("Base URL is not configured");
      }

      const res = await fetch(`${baseUrl}/api/v1/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ comment: newComment, rating: newRating }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update review");
      }

      const data = await res.json();
      toast.success("Review updated successfully!");
      setMyReviews(prev => prev.map(r => (r.id === reviewId ? data.data : r)));
      setShowDialog(false);
      setEditingReview(null);
      setNewComment("");
      setNewRating(0);
      setHoveredRating(0);
    } catch (err: any) {
      console.error("Error updating review:", err);
      toast.error(err.message || "Failed to update review");
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      const baseUrl = getBaseUrl();
      if (!baseUrl) {
        throw new Error("Base URL is not configured");
      }

      const res = await fetch(`${baseUrl}/api/v1/reviews/${reviewId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete review");
      }

      toast.success("Review deleted successfully!");
      setMyReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (err: any) {
      console.error("Error deleting review:", err);
      toast.error(err.message || "Failed to delete review");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch (err) {
      console.error("Error formatting date:", err);
      return "Invalid date";
    }
  };

  const renderStars = (rating: number, editable = false, size = "md") => {
    const sizeClass = size === "lg" ? "h-8 w-8" : size === "md" ? "h-5 w-5" : "h-4 w-4";
    const displayRating = editable && hoveredRating > 0 ? hoveredRating : rating;

    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`transition-all duration-200 ${editable ? "cursor-pointer transform hover:scale-110" : ""}`}
            onClick={() => editable && setNewRating(i + 1)}
            onMouseEnter={() => editable && setHoveredRating(i + 1)}
            onMouseLeave={() => editable && setHoveredRating(0)}
          >
            {i < displayRating ? (
              <Star className={`${sizeClass} fill-yellow-400 text-yellow-400 transition-all`} />
            ) : (
              <StarOff className={`${sizeClass} text-gray-300 transition-all`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderReviewCard = (review: Review, isMyReview: boolean) => (
    <Card
      key={review.id}
      className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur transform hover:scale-[1.01]"
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <div className={`rounded-full ${isMyReview ? 'bg-linear-to-br from-blue-100 to-cyan-100' : 'bg-gradient-to-br from-indigo-100 to-purple-100'} p-2`}>
                {isMyReview ? (
                  <UserPlus className="h-5 w-5 text-blue-600" />
                ) : (
                  <UserCheck className="h-5 w-5 text-indigo-600" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {isMyReview ? (
                    <>Review for <span className="text-indigo-600">{review.toUser?.profile?.fullName || `User #${review.toUserId}`}</span></>
                  ) : (
                    <>Review from <span className="text-purple-600">{review.fromUser?.profile?.fullName || `User #${review.fromUserId}`}</span></>
                  )}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(review.createdAt)}
                  {review.status === "PENDING" && (
                    <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {renderStars(review.rating)}
              <span className="text-sm font-medium text-gray-700 ml-2">
                {review.rating}.0
              </span>
            </div>
          </div>
          {isMyReview && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditingReview(review);
                  setNewComment(review.comment);
                  setNewRating(review.rating);
                  setShowDialog(true);
                }}
                className="hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteReview(review.id)}
                className="hover:bg-red-50 hover:text-red-600 transition-all duration-200"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className={`${isMyReview ? 'bg-linear-to-br from-blue-50 to-cyan-50/30' : 'bg-linear-to-br from-gray-50 to-indigo-50/30'} rounded-lg p-4 border border-gray-100`}>
          <p className="text-gray-700 leading-relaxed">{review.comment}</p>
        </div>
      </CardContent>
    </Card>
  );

  const avgMyRating = myReviews.length > 0
    ? (myReviews.reduce((acc, r) => acc + r.rating, 0) / myReviews.length).toFixed(1)
    : "0.0";

  const avgAboutMeRating = reviewsAboutMe.length > 0
    ? (reviewsAboutMe.reduce((acc, r) => acc + r.rating, 0) / reviewsAboutMe.length).toFixed(1)
    : "0.0";

  if (error && !loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-semibold text-lg">Error Loading Reviews</p>
            <p className="text-muted-foreground mt-2">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!travelPlanId) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <p className="text-red-600 font-semibold text-lg">Invalid URL parameters</p>
            <p className="text-muted-foreground mt-2">Please check your link and try again</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="mb-6 hover:bg-white/60 transition-all duration-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Participants
        </Button>

        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Reviews & Ratings
              </h1>
              <p className="text-muted-foreground">
                Share your experience and read what others have to say
              </p>
            </div>
            <Button
              onClick={() => {
                setShowDialog(true);
                setEditingReview(null);
                setNewComment("");
                setNewRating(0);
                setHoveredRating(0);
              }}
              className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              size="lg"
            >
              <MessageSquarePlus className="mr-2 h-5 w-5" />
              Write a Review
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-none shadow-xl bg-linear-to-br from-white to-blue-50/30 backdrop-blur">
            <CardContent className="py-6">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <UserPlus className="h-6 w-6 text-blue-600" />
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    My Reviews
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-4xl font-bold text-blue-600">{avgMyRating}</span>
                  <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {myReviews.length} review{myReviews.length !== 1 ? 's' : ''} given
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-linear-to-br from-white to-purple-50/30 backdrop-blur">
            <CardContent className="py-6">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <UserCheck className="h-6 w-6 text-purple-600" />
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Reviews About Me
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-4xl font-bold text-purple-600">{avgAboutMeRating}</span>
                  <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {reviewsAboutMe.length} review{reviewsAboutMe.length !== 1 ? 's' : ''} received
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="my-reviews" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="my-reviews" className="gap-2">
              <UserPlus className="h-4 w-4" />
              My Reviews ({myReviews.length})
            </TabsTrigger>
            <TabsTrigger value="about-me" className="gap-2">
              <UserCheck className="h-4 w-4" />
              About Me ({reviewsAboutMe.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-reviews" className="space-y-4">
            {myReviews.length === 0 ? (
              <Card className="border-none shadow-xl bg-white/70 backdrop-blur">
                <CardContent className="py-16 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="rounded-full bg-blue-100 p-6">
                      <UserPlus className="h-12 w-12 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews written yet</h3>
                      <p className="text-muted-foreground mb-6">
                        Share your experience with other travelers!
                      </p>
                      <Button
                        onClick={() => {
                          setShowDialog(true);
                          setEditingReview(null);
                          setNewComment("");
                          setNewRating(0);
                          setHoveredRating(0);
                        }}
                        className="bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                      >
                        <MessageSquarePlus className="mr-2 h-4 w-4" />
                        Write First Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              myReviews.map((review) => renderReviewCard(review, true))
            )}
          </TabsContent>

          <TabsContent value="about-me" className="space-y-4">
            {reviewsAboutMe.length === 0 ? (
              <Card className="border-none shadow-xl bg-white/70 backdrop-blur">
                <CardContent className="py-16 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="rounded-full bg-purple-100 p-6">
                      <UserCheck className="h-12 w-12 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews received yet</h3>
                      <p className="text-muted-foreground">
                        Reviews from other travelers will appear here
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              reviewsAboutMe.map((review) => renderReviewCard(review, false))
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-[550px] bg-linear-to-br from-white to-indigo-50/30">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {editingReview ? "Edit Your Review" : "Write a Review"}
              </DialogTitle>
              <DialogDescription className="text-base">
                {editingReview ? "Update your thoughts and rating" : "Share your experience with others"}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-6 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Your Rating</label>
                <div className="flex items-center gap-2 p-4 bg-white rounded-lg border border-gray-200">
                  {renderStars(newRating, true, "lg")}
                  {newRating > 0 && (
                    <span className="ml-3 text-lg font-semibold text-indigo-600">
                      {newRating}.0
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Your Review</label>
                <textarea
                  className="border-2 border-gray-200 rounded-lg p-4 w-full min-h-[150px] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 resize-none"
                  placeholder="Share your experience... What did you like? What could be improved?"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => {
                    if (editingReview) handleUpdateReview(editingReview.id);
                    else handleCreateReview();
                  }}
                  className="flex-1 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  size="lg"
                >
                  {editingReview ? "Update Review" : "Submit Review"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDialog(false);
                    setEditingReview(null);
                    setNewComment("");
                    setNewRating(0);
                    setHoveredRating(0);
                  }}
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
