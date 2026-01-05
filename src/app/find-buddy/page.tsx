"use client";

import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Search, MapPin, Star, MessageSquare, Users, Heart } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface BuddyProfile {
  id: number;
  userName: string;
  profile?: {
    fullName: string;
    bio: string;
    image: string;
    currentLocation: string;
    travelInterests: string[];
    rating: number;
    reviewCount: number;
  };
}

interface ApiResponse {
  data: BuddyProfile[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

interface GetAllUsersParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  searchTerm?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

function buildQuery(params: GetAllUsersParams) {
  const query = new URLSearchParams();
  query.set("page", String(params.page));
  query.set("limit", String(params.limit));
  query.set("sortBy", params.sortBy);
  query.set("sortOrder", params.sortOrder);
  if (params.searchTerm) query.set("searchTerm", params.searchTerm);
  return query.toString();
}

async function getAllBuddies(params: GetAllUsersParams): Promise<ApiResponse> {
  const query = buildQuery(params);
  const res = await fetch(`${BASE_URL}/api/v1/user/buddy?${query}`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch buddies");
  return res.json();
}

export default function FindTravelBuddyPage() {
  const { user: authUser, isLoading: sessionLoading } = useAuth();

  const [buddies, setBuddies] = useState<BuddyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 8,
    total: 0,
  });

  const fetchBuddies = async () => {
    try {
      setLoading(true);
      const response = await getAllBuddies({
        page: pagination.page,
        limit: pagination.limit,
        sortBy: "createdAt",
        sortOrder: "desc",
        searchTerm: searchQuery || undefined,
      });
      setBuddies(response.data);
      setPagination((prev) => ({ ...prev, total: response.meta.total }));
    } catch (err: any) {
      setError(err.message || "Failed to fetch travel buddies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuddies();
  }, [pagination.page, searchQuery]);

  const toggleFavorite = (buddyId: number) => {
    if (!authUser) {
      alert("Please log in to add favorites.");
      return;
    }
    setFavorites((prev) =>
      prev.includes(buddyId) ? prev.filter((id) => id !== buddyId) : [...prev, buddyId]
    );
  };

  const handleAction = (actionType: "message" | "connect", buddyId: number) => {
    if (!authUser) {
      alert("Please log in to perform this action.");
      return;
    }
    console.log(`${actionType} buddy with ID: ${buddyId}`);
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Find Your Travel Buddy</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with like-minded travelers and explore the world together.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 flex items-center gap-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by name, location..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">Loading travel buddies...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : buddies.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No travel buddies found. Try adjusting your search.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {buddies.map((buddy) => (
                <Card key={buddy.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage
                        src={buddy.profile?.image || "/default-avatar.jpg"}
                        alt={buddy.userName}
                      />
                      <AvatarFallback>{buddy.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle>{buddy.userName}</CardTitle>
                      <CardDescription className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        {buddy.profile?.currentLocation || "Unknown"}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {buddy.profile?.travelInterests?.map((interest, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {buddy.profile?.bio || "No bio yet."}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {buddy.profile?.rating || 0}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({buddy.profile?.reviewCount || 0} reviews)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(buddy.id)}
                        className={favorites.includes(buddy.id) ? "text-red-500" : ""}
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            favorites.includes(buddy.id) ? "fill-red-500 text-red-500" : ""
                          }`}
                        />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={() => handleAction("message", buddy.id)}
                      >
                        <MessageSquare className="h-4 w-4" />
                        Message
                      </Button>
                      <Button
                        className="flex-1 gap-2"
                        onClick={() => handleAction("connect", buddy.id)}
                      >
                        <Users className="h-4 w-4" />
                        Connect
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination.total > pagination.limit && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 py-2 text-sm">
                  Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                </span>
                <Button
                  variant="outline"
                  disabled={
                    pagination.page >= Math.ceil(pagination.total / pagination.limit)
                  }
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
