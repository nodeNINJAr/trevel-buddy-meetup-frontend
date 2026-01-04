/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Check,
  X,
  CheckCircle2,
  Clock,
  UserX,
  Mail,
  Eye,
  Star,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface User {
  id: number;
  userName: string;
  email: string;
  image?: string;
  profile?: {
    fullName?: string;
    avatarUrl?: string;
    bio?: string;
    verified?: boolean;
    rating?: number;
    reviewCount?: number;
    travelInterests?: string[];
    country?: string;
    city?: string;
  };
}

interface TravelFriendship {
  id: number;
  tripId: number;
  userId: number;
  friendId: number;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
  createdAt: string;
  updatedAt: string;
  friend?: User;
}

export default function ParticipantsPage() {
  const params = useParams();
  const router = useRouter();
  const { user: authUser } = useAuth();

  const [participants, setParticipants] = useState<TravelFriendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<TravelFriendship | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<TravelFriendship | null>(null);
  const [planOwner, setPlanOwner] = useState(false);

  // Fetch participants
  useEffect(() => {
    if (!params.id || !authUser?.id) return;

    const fetchParticipants = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/travel/joined-users/${params.id}`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch participants');

        setParticipants(data.data || []);
        // Check if current user is owner
        const isOwner = data.data.some((p: TravelFriendship) => p.userId === authUser.id);
        setPlanOwner(isOwner);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || 'Failed to fetch participants');
        router.push('/travel-plans');
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [params.id, authUser, router]);

  // Handle status change (for dropdown)
  const handleStatusChange = async (friendshipId: number, newStatus: 'PENDING' | 'ACCEPTED' | 'BLOCKED') => {
    setActionLoading(friendshipId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/travel/change-status/${friendshipId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update status');

      setParticipants(prev =>
        prev.map(p => p.id === friendshipId ? { ...p, status: newStatus } : p)
      );
      toast.success(`Request ${newStatus.toLowerCase()} successfully!`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to update status');
    } finally {
      setActionLoading(null);
      setShowRejectDialog(false);
      setSelectedRequest(null);
    }
  };

  const openRejectDialog = (request: TravelFriendship) => {
    setSelectedRequest(request);
    setShowRejectDialog(true);
  };

  const openMessageDialog = (request: TravelFriendship) => {
    setSelectedMessage(request);
    setShowMessageDialog(true);
  };

  if (loading) return <p className="text-center py-12">
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </p>;

  const pendingRequests = participants.filter(p => p.status === 'PENDING');
  const acceptedRequests = participants.filter(p => p.status === 'ACCEPTED');
  const rejectedRequests = participants.filter(p => p.status === 'BLOCKED');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'ACCEPTED':
        return <Badge variant="default" className="bg-green-50 text-green-700 border-green-200"><Check className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'BLOCKED':
        return <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/travel-plans/${params.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plan Details
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Manage Participants</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{pendingRequests.length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Accepted</p>
                  <p className="text-2xl font-bold">{acceptedRequests.length}</p>
                </div>
                <Check className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold">{rejectedRequests.length}</p>
                </div>
                <UserX className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Participants Table */}
        {participants.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No participants yet</h3>
              <p className="text-muted-foreground">
                When people request to join your trip, they'll appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Participant</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Requested At</TableHead>
                    <TableHead>Status</TableHead>
                    {planOwner && <TableHead>Action</TableHead>}
                    <TableHead>Reviews</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((request) => {
                    if (!request.friendId) return null;
                    return (
                      <TableRow key={request.id}>
                        <TableCell>
                          <Link href={`/profile/${request.friendId}`} className="flex items-center gap-3 group">
                            <div>
                              <p className="font-medium group-hover:text-primary transition-colors flex items-center gap-1 justify-center">
                                {request.friend?.userName}<Eye className="h-4 w-4 text-amber-500" />
                              </p>
                              {request.friend?.profile?.verified && (
                                <Badge variant="secondary" className="text-xs mt-0.5">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </Link>
                        </TableCell>

                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openMessageDialog(request)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>

                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </TableCell>

                        <TableCell>
                          {getStatusBadge(request.status)}
                        </TableCell>

                        {planOwner && (
                          <TableCell className="text-right">
                            {request.status !== 'BLOCKED' ? (
                              <Select
                                value={request.status}
                                onValueChange={(value: 'PENDING' | 'ACCEPTED' | 'BLOCKED') => {
                                  if (value === 'BLOCKED') {
                                    openRejectDialog(request);
                                  } else {
                                    handleStatusChange(request.tripId, value);
                                  }
                                }}
                                disabled={actionLoading === request.tripId}
                              >
                                <SelectTrigger className="w-[130px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PENDING">
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-yellow-500" />
                                      Pending
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="ACCEPTED">
                                    <div className="flex items-center gap-2">
                                      <Check className="h-4 w-4 text-green-500" />
                                      Accept
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="BLOCKED">
                                    <div className="flex items-center gap-2">
                                      <X className="h-4 w-4 text-red-500" />
                                      Block
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge variant="destructive">Blocked</Badge>
                            )}
                          </TableCell>
                        )}

                        <TableCell className="text-left">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/reviews?userId=${request.friendId}&tripId=${params.id}`)}
                          >
                            <Star className="h-4 w-4" />
                              See Ratings
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Message Dialog */}
        <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join Request Message</DialogTitle>
              <DialogDescription>
                From {selectedMessage?.friend?.profile?.fullName || selectedMessage?.friend?.userName}
              </DialogDescription>
            </DialogHeader>
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-sm wrap-break-word">{selectedMessage?.message}</p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Sent on {selectedMessage && new Date(selectedMessage.createdAt).toLocaleDateString()} at{' '}
              {selectedMessage && new Date(selectedMessage.createdAt).toLocaleTimeString()}
            </div>
          </DialogContent>
        </Dialog>

        {/* Reject Confirmation Dialog */}
        <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Block Join Request?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to reject{' '}
                <span className="font-semibold">
                  {selectedRequest?.friend?.profile?.fullName || selectedRequest?.friend?.userName}
                </span>
                's request to join your trip? You can change this status later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => selectedRequest && handleStatusChange(selectedRequest.tripId, 'BLOCKED')}
                className="bg-destructive hover:bg-destructive/90"
              >
                Block Request
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
