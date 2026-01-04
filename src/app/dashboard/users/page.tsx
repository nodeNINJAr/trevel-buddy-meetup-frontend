"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, UserCheck, UserX, Star, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { User } from "@/types";




export default function ManageUsersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

  // Redirect non-admins
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "ADMIN")) {
      router.push("/login?redirect=/dashboard/users");
    }
  }, [user, isLoading, router]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      // Add search term if exists
      if (debouncedSearch.trim()) {
        params.append("searchTerm", debouncedSearch.trim());
      }

      // Add filter status if not "all"
      if (filterStatus !== "all") {
        params.append("verified", filterStatus === "verified" ? "true" : "false");
      }

      const res = await fetch(`${BASE_URL}/api/v1/user?${params.toString()}`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      setUsers(data.data || []);
      setTotalPages(data.meta?.totalPages || Math.ceil((data.meta?.total || 0) / limit));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Refetch on filters or page change
  useEffect(() => {
    if (!isLoading && user?.role === "ADMIN") {
      fetchUsers();
    }
  }, [isLoading, user, page, debouncedSearch, filterStatus, limit]);

  // Actions
  const handleVerifyUser = async (userId: number) => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/user/verified/${userId}`, { 
        method: "PATCH", 
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to verify user");
      toast.success("User verified successfully");
      fetchUsers();
    } catch(err) {
      toast.error("Verification failed user profile not set");
    }
  };

  const handleUnverifyUser = async (userId: number) => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/user/verified/${userId}`, { 
        method: "PATCH", 
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to unverify user");
      toast.success("User unverified successfully");
      fetchUsers();
    } catch {
      toast.error("Unverification failed");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/user/${userId}`, { 
        method: "DELETE", 
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to delete user");
      toast.success("User deleted successfully");
      fetchUsers();
    } catch {
      toast.error("Deletion failed");
    }
  };

  if (isLoading || loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p>Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!user || user.role !== "ADMIN") return null;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Manage Users</h1>
            <p className="text-muted-foreground">View and manage all registered users</p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Search and filter users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={filterStatus} onValueChange={(value) => {
                  setFilterStatus(value);
                  setPage(1); // Reset to first page on filter change
                }}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="verified">Verified Only</SelectItem>
                    <SelectItem value="unverified">Unverified Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Users Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((u:User) => (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={u?.profile?.avatarUrl} />
                                <AvatarFallback>{u?.profile?.fullName?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{u?.profile?.fullName}</p>
                                <p className="text-xs text-muted-foreground">{u?.profile?.visitedCountries?.length || 0} countries visited</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>{u?.profile?.currentLocation || "—"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{u?.profile?.rating || 0}</span>
                              <span className="text-xs text-muted-foreground">({u?.profile?.reviewCount || 0})</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {u?.profile?.verified ? (
                              <Badge variant="default" className="gap-1">
                                <UserCheck className="h-3 w-3" /> Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1">
                                <UserX className="h-3 w-3" /> Unverified
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="flex gap-2">
                            <Button variant="ghost" size="icon" asChild title="View Profile">
                              <Link href={`/profile/${u.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            {u?.profile?.verified ? (
                              <Button variant="ghost" size="icon" title="Remove Verification" onClick={() => handleUnverifyUser(u.id)}>
                                <UserX className="h-4 w-4 text-orange-500" />
                              </Button>
                            ) : (
                              <Button variant="ghost" size="icon" title="Verify User" onClick={() => handleVerifyUser(u.id)}>
                                <UserCheck className="h-4 w-4 text-green-500" />
                              </Button>
                            )}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" title="Delete User">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Delete User</DialogTitle>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline">Cancel</Button>
                                  <Button variant="destructive" onClick={() => handleDeleteUser(u.id)}>
                                    Delete
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <Button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                <Button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}