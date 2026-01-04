/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye, Trash2, Search, Map, Calendar, DollarSign, Users, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { TravelPlan, User } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';

interface ApiResponse {
  success: boolean;
  message: string;
  meta: {
    limit: number;
    page: number;
    total: number;
  };
  data: TravelPlan[];
}

interface JoinedUser extends User {
  id: number;
  joinedAt?: string;
}

interface FetchOptions extends RequestInit {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | "PATCH";
}

interface FetchParams {
  page: number;
  limit: number;
  searchTerm?: string;
  filters?: Record<string, any>;
}

// API Helpers
const fetchAPI = async <T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
  const res = await fetch(`${API_URL}${endpoint}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    ...options,
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Request failed');
  }
  
  return res.json();
};

const buildQueryString = (params: FetchParams): string => {
  const query = new URLSearchParams();
  
  query.append('page', params.page.toString());
  query.append('limit', params.limit.toString());
  
  if (params.searchTerm) {
    query.append('searchTerm', params.searchTerm);
  }
  
  if (params.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== 'all') {
        query.append(key, String(value));
      }
    });
  }
  
  return query.toString();
};

export default function ManageTravelsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  
  const [selectedPlan, setSelectedPlan] = useState<TravelPlan | null>(null);
  const [joinedUsers, setJoinedUsers] = useState<JoinedUser[]>([]);
  const [showUsersDialog, setShowUsersDialog] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/login?redirect=/dashboard/travels');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchTravels();
    }
  }, [user, page, searchTerm, filterStatus]);

  const fetchTravels = async (): Promise<void> => {
    try {
      setLoading(true);
      
      const params: FetchParams = {
        page,
        limit: 20,
        searchTerm: searchTerm || undefined,
        filters: {
          status: filterStatus !== 'all' ? filterStatus.toUpperCase() : undefined,
        }
      };
      
      const queryString = buildQueryString(params);
      const response = await fetchAPI<ApiResponse>(`/api/v1/travel?${queryString}`);
      
      setPlans(response.data || []);
      const total = response.meta?.total || 0;
      setTotalItems(total);
      setTotalPages(Math.ceil(total / 20));
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchJoinedUsers = async (travelId: number): Promise<void> => {
    try {
      const response = await fetchAPI<{ data: JoinedUser[] }>(`/api/v1/travel/admin/joined-users?id=${travelId}`);
      setJoinedUsers(response.data || []);
      setShowUsersDialog(true);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const deletePlan = async (planId: number): Promise<void> => {
    try {
      await fetchAPI(`/api/v1/travel/${planId}`, { method: 'DELETE' });
      toast.success('Travel plan deleted');
      fetchTravels();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const updateStatus = async (planId: number, status: TravelPlan['status']): Promise<void> => {
    try {
      await fetchAPI(`/api/v1/travel/${planId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setPlans(plans.map(p => p.id === planId ? { ...p, status } : p));
      toast.success('Status updated');
    } catch (error) {
      toast.error((error as Error).message);
      fetchTravels();
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1); // Reset to first page on search
  };

  const handleFilterChange = (value: string) => {
    setFilterStatus(value);
    setPage(1); // Reset to first page on filter change
  };

  if (isLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user || user.role !== 'ADMIN') return null;

  const stats = {
    total: totalItems || plans.length,
    active: plans.filter((p: TravelPlan) => p.status === 'ACTIVE').length,
    completed: plans.filter((p: TravelPlan) => p.status === 'COMPLETED').length,
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Manage Travel Plans</h1>
            <p className="text-muted-foreground">Monitor and manage all travel plans</p>
          </div>
          <Button onClick={fetchTravels} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
              <Map className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Page</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{page} / {totalPages}</div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Travel Plans</CardTitle>
            <CardDescription>Search and filter travel plans</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search destination, country, or host..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterStatus} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Destination</TableHead>
                    <TableHead>Host</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        {loading ? 'Loading...' : 'No travel plans found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    plans.map((plan: TravelPlan) => (
                      <TableRow key={plan.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{plan.destination}</p>
                            <p className="text-xs text-muted-foreground">{plan.country}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={plan.user?.image || undefined} />
                              <AvatarFallback>
                                {plan.user?.userName?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{plan.user?.userName || 'Unknown'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{new Date(plan.startDate).toLocaleDateString()}</p>
                            <p className="text-xs text-muted-foreground">
                              to {new Date(plan.endDate).toLocaleDateString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          ${plan.budgetMin} - ${plan.budgetMax}
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={plan.status} 
                            onValueChange={(val) => updateStatus(plan.id, val as TravelPlan['status'])}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ACTIVE">Active</SelectItem>
                              <SelectItem value="INACTIVE">Inactive</SelectItem>
                              <SelectItem value="COMPLETED">Completed</SelectItem>
                              <SelectItem value="CANCELLED">Cancelled</SelectItem>
                              <SelectItem value="BLOCKED">Blocked</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              title="View joined users"
                              onClick={() => {
                                setSelectedPlan(plan);
                                fetchJoinedUsers(plan.id);
                              }}
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" asChild title="View details">
                              <Link href={`/travel-plans/${plan.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" title="Delete plan">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Delete Travel Plan</DialogTitle>
                                  <DialogDescription>
                                    Delete {plan.destination}, {plan.country}? This cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline">Cancel</Button>
                                  <Button 
                                    variant="destructive" 
                                    onClick={() => deletePlan(plan.id)}
                                  >
                                    Delete
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages} ({totalItems} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1 || loading}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Joined Users Dialog */}
        <Dialog open={showUsersDialog} onOpenChange={setShowUsersDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Joined Users - {selectedPlan?.destination}</DialogTitle>
              <DialogDescription>Users who joined this travel plan</DialogDescription>
            </DialogHeader>
            <div className="max-h-[400px] overflow-y-auto">
              {joinedUsers.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No users joined yet</p>
              ) : (
                <div className="space-y-4">
                  {joinedUsers.map((user: JoinedUser) => (
                    <div key={user.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.image || undefined} />
                        <AvatarFallback>{user.userName?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{user.userName}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <Badge>
                        {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'N/A'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}