/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  MapPin, 
  Filter,
  Users,
  Calendar,
  Loader2,
  DollarSign,
  CheckCircle2,
  Star
} from 'lucide-react';
import { toast } from 'sonner';
import { TravelPlan, User } from '@/types';

const travelTypes = ['All', 'Solo', 'Family', 'Friends', 'Couple'];
const interests = ['All', 'Beach', 'Hiking', 'Photography', 'Food Tours', 'Culture', 'Adventure'];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedInterest, setSelectedInterest] = useState('All');
  const [travelPlans, setTravelPlans] = useState<TravelPlan[]>([]);
  const [featuredUsers, setFeaturedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 9;

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch travel plans
  const fetchTravelPlans = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      // Add search term if exists
      if (debouncedSearch.trim()) {
        params.append('searchTerm', debouncedSearch.trim());
      }

      // Add filters
      if (selectedType !== 'All') {
        params.append('travelType', selectedType);
      }

      if (selectedInterest !== 'All') {
        params.append('interests', selectedInterest);
      }
      // 
      const res = await fetch(`${BASE_URL}/api/v1/travel?${params.toString()}`, {
        method:"GET",
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to fetch travel plans');

      const result = await res.json();
      setTravelPlans(result.data || []);
      setTotal(result.meta?.total || 0);
      setTotalPages(Math.ceil((result.meta?.total || 0) / limit));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load travel plans');
    } finally {
      setLoading(false);
    }
  };

  // Fetch featured users
  const fetchFeaturedUsers = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/user?limit=4&verified=true`, {
         method:"GET",
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to fetch users');

      const result = await res.json();
      setFeaturedUsers(result.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTravelPlans();
  }, [page, debouncedSearch, selectedType, selectedInterest]);

  useEffect(() => {
    fetchFeaturedUsers();
  }, []);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedType('All');
    setSelectedInterest('All');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Explore Travelers</h1>
          <p className="text-muted-foreground">Find your perfect travel companion for your next adventure</p>
        </div>

        {/* Search & Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="search">Destination</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by destination or country..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="travelType">Travel Type</Label>
                <Select value={selectedType} onValueChange={(value) => {
                  setSelectedType(value);
                  setPage(1);
                }}>
                  <SelectTrigger id="travelType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {travelTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="interest">Interest</Label>
                <Select value={selectedInterest} onValueChange={(value) => {
                  setSelectedInterest(value);
                  setPage(1);
                }}>
                  <SelectTrigger id="interest">
                    <SelectValue placeholder="Select interest" />
                  </SelectTrigger>
                  <SelectContent>
                    {interests.map((interest) => (
                      <SelectItem key={interest} value={interest}>{interest}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <p className="text-muted-foreground">
              Found <span className="font-semibold text-foreground">{total}</span> travel plans
            </p>
          )}
        </div>

        {/* Travel Plans Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : travelPlans.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {travelPlans.map((plan) => (
                <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                        {plan.status.toLowerCase()}
                      </Badge>
                      <Badge variant="outline">{plan.travelType}</Badge>
                    </div>
                    <CardTitle className="text-xl">{plan.destination}</CardTitle>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {plan.country}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Host Info */}
                    {plan.user && (
                      <Link href={`/profile/${plan.user.id}`} className="flex items-center gap-3 group">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={plan.user.image} alt={plan.user.userName} />
                          <AvatarFallback>{plan.user.userName?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                            {plan.user.userName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {plan.user.email}
                          </p>
                        </div>
                      </Link>
                    )}

                    {/* Plan Details */}
                    <p className="text-sm text-muted-foreground line-clamp-2">{plan.description}</p>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="text-xs">
                          {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-xs">${plan.budgetMin} - ${plan.budgetMax}</span>
                      </div>
                    </div>

                    {/* Interests */}
                    <div className="flex flex-wrap gap-2">
                      {plan.interests?.slice(0, 3).map((interest, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{interest}</Badge>
                      ))}
                      {plan.interests?.length > 3 && (
                        <Badge variant="secondary" className="text-xs">+{plan.interests.length - 3}</Badge>
                      )}
                    </div>

                    <Button asChild className="w-full" variant="outline">
                      <Link href={`/travel-plans/${plan.id}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button 
                  variant="outline" 
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Travel Plans Found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or search for different destinations
              </p>
              <Button onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Featured Travelers Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Featured Travelers</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredUsers.map((user) => (
              <Link key={user.id} href={`/profile/${user.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="text-center">
                    <Avatar className="w-20 h-20 mx-auto mb-3">
                      <AvatarImage src={user.profile?.avatarUrl} alt={user?.profile?.fullName} />
                      <AvatarFallback>{user?.profile?.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-base">{user?.profile?.fullName}</CardTitle>
                    {user?.profile?.rating && user?.profile?.rating > 0 && (
                      <div className="flex items-center justify-center gap-1 text-sm">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{user?.profile?.rating}</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="text-center">
                    {user?.profile?.currentLocation && (
                      <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mb-2">
                        <MapPin className="h-3 w-3" />
                        {user?.profile?.currentLocation}
                      </p>
                    )}
                    {user?.profile?.verified && (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}