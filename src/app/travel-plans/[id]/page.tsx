/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Star,
  CheckCircle2,
  ArrowLeft,
  UserPlus,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { TravelPlan, User } from '@/types';


// 
export default function TravelPlanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user: authUser } = useAuth(); // Keep useAuth
  const [user, setUser] = useState<User | null>(null); // Full profile from API
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestMessage, setRequestMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch logged-in user profile using userId from useAuth
  useEffect(() => {
    if (!authUser?.id) return;
    const fetchUserProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/user/${authUser.id}`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
        setUser(data.data); // store full user profile
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || 'Failed to fetch profile');
      }
    };
    fetchUserProfile();
  }, [authUser]);

  // Fetch travel plan
  useEffect(() => {
    if (!params.id) return;
    const fetchPlan = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/travel/${params.id}`, {
          credentials: 'include',
        });
        const data = await res.json();
        console.log(data);
        if (!res.ok) throw new Error(data.message || 'Failed to fetch plan');
        setPlan(data.data);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || 'Something went wrong');
        router.push('/travel-plans');
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [params.id, router]);

  const handleJoinRequest = async () => {
    if (!requestMessage.trim()) {
      toast.error('Please write a message');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/travel/join/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: requestMessage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send request');
      toast.success('Join request sent successfully!');
      setIsDialogOpen(false);
      setRequestMessage('');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Something went wrong');
    }
  };

  if (loading) return <p className="text-center py-12">Loading...</p>;
  if (!plan) return null;

  const isOwnPlan = authUser?.id === plan.userId;
  const countFriendships = plan.friendships.filter(f => f.status === 'ACCEPTED').length;


  // 
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/travel-plans">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plans
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={plan.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {plan.status}
                  </Badge>
                  <Badge variant="outline">{plan.travelType}</Badge>
                </div>
                <CardTitle className="text-3xl">{plan.destination}</CardTitle>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{plan.country}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Dates</p>
                      <p className="font-medium text-sm">
                        {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="font-medium text-sm">${plan.budgetMin} - ${plan.budgetMax}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Participants</p>
                      <p className="font-medium text-sm">{countFriendships} joined</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-lg mb-3">About This Trip</h3>
                  <p className="text-muted-foreground leading-relaxed">{plan.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Activities & Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {plan.interests.map((interest, i) => (
                      <Badge key={i} variant="secondary">{interest}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hosted by</CardTitle>
               
              </CardHeader>
              <CardContent>
                <Link href={`/profile/${plan.user?.id}`} className="block">
                  <div className="flex items-center gap-4 mb-4 group">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={plan.user?.profile?.avatarUrl || plan.user?.image} alt={plan.user?.profile?.fullName || plan.user?.userName} />
                      <AvatarFallback>{plan.user?.profile?.fullName?.charAt(0) || plan.user?.userName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">{plan.user?.profile?.fullName || plan.user?.userName}</h3>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{plan.user?.profile?.rating || 0}</span>
                        <span className="text-muted-foreground">({plan.user?.profile?.reviewCount || 0} reviews)</span>
                      </div>
                      {plan.user?.profile?.verified ? (
                        <Badge variant="secondary" className="text-xs mt-1">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs mt-1">
                          <X className="h-3 w-3 mr-1" />
                          Not Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>
                    {
                      isOwnPlan && ( <>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push(`/travel-plans/${params.id}/participants`)}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        View Participants
                      </Button>
                     </>)
                    }

                 <div className='mt-4'>
                   {!isOwnPlan && user ? (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full mt-4">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Request to Join
                        </Button>
                      </DialogTrigger>

                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Request to Join Trip</DialogTitle>
                          <DialogDescription>
                            Send a message to {plan.user?.profile?.fullName || plan.user?.userName} explaining why you'd be a great travel companion
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <Textarea
                            placeholder={`Hi! I'm ${user?.profile?.fullName}. I would love to join your trip to ${plan.destination}. My interests: ${user?.profile?.travelInterests?.join(', ')}`}
                            value={requestMessage}
                            onChange={(e) => setRequestMessage(e.target.value)}
                            rows={5}
                          />
                          <Button onClick={handleJoinRequest} className="w-full">
                            Send Request
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : !user ? (
                    <Button asChild className="w-full">
                      <Link href="/login">Login to Join</Link>
                    </Button>
                  ) : (
                    <Button disabled className="w-full">Your Plan</Button>
                  )}
                  </div>   
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
