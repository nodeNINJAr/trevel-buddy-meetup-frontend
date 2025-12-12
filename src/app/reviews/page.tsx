/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Star } from "lucide-react";

type Review = {
  id: number;
  comment: string;
  rating: number;
  toUserId: number;
  travelPlanId: number;
  createdAt: string;
  updatedAt: string;
};

export default function ReviewsPage() {
  const searchParams = useSearchParams();
  const toUserId = searchParams.get("userId");
  const travelPlanId = searchParams.get("tripId");

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(0);

  // Fetch reviews
  useEffect(() => {
    if (!toUserId || !travelPlanId) return;

    const fetchReviews = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/reviews?toUserId=${toUserId}&travelPlanId=${travelPlanId}`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch reviews");
        setReviews(data.data || []);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to fetch reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [toUserId, travelPlanId]);

  // Create review
  const handleCreateReview = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/reviews?toUserId=${toUserId}&travelPlanId=${travelPlanId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ comment: newComment, rating: newRating }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create review");
      toast.success("Review created!");
      setReviews(prev => [...prev, data.data]);
      setShowDialog(false);
      setNewComment("");
      setNewRating(0);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create review");
    }
  };

  // Update review
  const handleUpdateReview = async (reviewId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ comment: newComment, rating: newRating }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update review");
      toast.success("Review updated!");
      setReviews(prev => prev.map(r => (r.id === reviewId ? data.data : r)));
      setShowDialog(false);
      setEditingReview(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update review");
    }
  };

  // Delete review
  const handleDeleteReview = async (reviewId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/reviews/${reviewId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete review");
      toast.success("Review deleted!");
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to delete review");
    }
  };

  if (!toUserId || !travelPlanId) {
    return <p className="text-center py-12 text-red-500">Invalid URL parameters</p>;
  }

  if (loading) return <p className="text-center py-12">Loading reviews...</p>;

  const renderStars = (rating: number, editable = false) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 cursor-pointer ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
        onClick={() => editable && setNewRating(i + 1)}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Reviews</h1>
          <Button
            onClick={() => {
              setShowDialog(true);
              setEditingReview(null);
              setNewComment("");
              setNewRating(0);
            }}
          >
            Add Review
          </Button>
        </div>

        {reviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No reviews yet</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map(r => (
                    <TableRow key={r.id}>
                      <TableCell>{r.id}</TableCell>
                      <TableCell>{r.comment}</TableCell>
                      <TableCell className="flex">{renderStars(r.rating)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setEditingReview(r);
                              setNewComment(r.comment);
                              setNewRating(r.rating);
                              setShowDialog(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteReview(r.id)}>
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Create / Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingReview ? "Edit Review" : "Add Review"}</DialogTitle>
              <DialogDescription>
                {editingReview ? "Update the review comment and rating" : "Create a new review"}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 mt-4">
              <textarea
                className="border rounded p-2 w-full"
                placeholder="Comment"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
              />
              <div className="flex items-center gap-1">{renderStars(newRating, true)}</div>
              <Button
                onClick={() => {
                  if (editingReview) handleUpdateReview(editingReview.id);
                  else handleCreateReview();
                }}
              >
                {editingReview ? "Update" : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
