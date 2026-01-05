"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, Check, Clock, X, Eye, Star, MapPin, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

type ParticipationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

type TravelParticipation = {
  id: number;
  travelPlan: {
    id: number;
    destination: string;
    country: string;
    startDate: string;
    endDate: string;
    status: string;
  };
  status: ParticipationStatus;
  createdAt: string;
  updatedAt: string;
  message?: string;
};

type Stats = {
  total: number;
  accepted: number;
  pending: number;
  rejected: number;
};

export default function TravelParticipationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [participations, setParticipations] = useState<TravelParticipation[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, accepted: 0, pending: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const fetchParticipations = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/participations/my`, {
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch participations");
      }

      const data = await res.json();
      setParticipations(data.data);

      // Calculate stats
      const total = data.data.length;
      const accepted = data.data.filter((p: TravelParticipation) => p.status === 'ACCEPTED').length;
      const pending = data.data.filter((p: TravelParticipation) => p.status === 'PENDING').length;
      const rejected = data.data.filter((p: TravelParticipation) => p.status === 'REJECTED').length;

      setStats({ total, accepted, pending, rejected });
    } catch (err: any) {
      console.error("Error fetching participations:", err);
      toast.error(err.message || "Failed to load your travel participations");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (participationId: number, newStatus: ParticipationStatus) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/participations/${participationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update status");
      }

      toast.success(`Participation request ${newStatus.toLowerCase()} successfully!`);
      fetchParticipations(); // Refresh data
    } catch (err: any) {
      console.error("Error updating status:", err);
      toast.error(err.message || "Failed to update participation status");
    }
  };

  useEffect(() => {
    if (user) {
      fetchParticipations();
    }
  }, [user]);

  const filteredParticipations = participations.filter(participation => {
    if (activeTab === 'all') return true;
    return participation.status.toLowerCase() === activeTab;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Please log in to view your travel participations</p>
            <Button asChild>
              <Link href="/login">Log In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading your travel participations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Travel Participations</h1>
          <p className="text-muted-foreground">Manage your travel requests and view your participation history</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-none shadow-md bg-white">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-blue-500 mr-2" />
                  <span className="text-sm font-medium text-muted-foreground">Total</span>
                </div>
                <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
                <p className="text-sm text-muted-foreground mt-1">participations</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Check className="h-6 w-6 text-green-500 mr-2" />
                  <span className="text-sm font-medium text-muted-foreground">Accepted</span>
                </div>
                <div className="text-3xl font-bold text-green-600">{stats.accepted}</div>
                <p className="text-sm text-muted-foreground mt-1">requests</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-6 w-6 text-yellow-500 mr-2" />
                  <span className="text-sm font-medium text-muted-foreground">Pending</span>
                </div>
                <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
                <p className="text-sm text-muted-foreground mt-1">requests</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <X className="h-6 w-6 text-red-500 mr-2" />
                  <span className="text-sm font-medium text-muted-foreground">Rejected</span>
                </div>
                <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
                <p className="text-sm text-muted-foreground mt-1">requests</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Participation Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>My Participation Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                <TabsTrigger value="accepted">Accepted ({stats.accepted})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
              </TabsList>
            </Tabs>

            {filteredParticipations.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p>No participation requests found</p>
                {activeTab === 'all' && (
                  <p className="mt-2">You haven't participated in any trips yet</p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Destination</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParticipations.map((participation) => (
                      <TableRow key={participation.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {participation.travelPlan.destination}
                          </div>
                        </TableCell>
                        <TableCell>{participation.travelPlan.country}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {new Date(participation.travelPlan.startDate).toLocaleDateString()} -
                              {new Date(participation.travelPlan.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              participation.status === 'ACCEPTED' ? 'default' :
                              participation.status === 'PENDING' ? 'secondary' : 'destructive'
                            }
                            className="capitalize"
                          >
                            {participation.status.toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link href={`/travel-plans/${participation.travelPlan.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </Button>

                          {participation.status === 'ACCEPTED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <Link href={`/reviews?tripId=${participation.travelPlan.id}&userId=${participation.travelPlan.userId}`}>
                                <Star className="h-4 w-4 mr-2" />
                                Review
                              </Link>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
