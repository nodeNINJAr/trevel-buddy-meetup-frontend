/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
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
  UserPlus
} from 'lucide-react';
import { mockTravelPlans } from '@/lib/mockData';
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

export default function TravelPlanDetailsPage() {
  const params = useParams();
  const { user } = useAuth();
  const [requestMessage, setRequestMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Find the travel plan
  const plan = mockTravelPlans.find(p => p.id === params.id);

  const handleJoinRequest = () => {
    if (!requestMessage.trim()) {
      toast.error('Please write a message');
      return;
    }
    
    toast.success('Join request sent successfully!');
    setIsDialogOpen(false);
    setRequestMessage('');
  };

  if (!plan) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Travel plan not found</p>
            <Button asChild className="mt-4">
              <Link href="/travel-plans">Back to Plans</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwnPlan = user?.id === plan.userId;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/travel-plans">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plans
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
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
                {/* Key Details */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Dates</p>
                      <p className="font-medium text-sm">
                        {new Date(plan.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(plan.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
                      <p className="font-medium text-sm">{plan.participants?.length || 0} joined</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">About This Trip</h3>
                  <p className="text-muted-foreground leading-relaxed">{plan.description}</p>
                </div>

                {/* Interests */}
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

            {/* What to Expect Card */}
            <Card>
              <CardHeader>
                <CardTitle>What to Expect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Shared Experiences</p>
                    <p className="text-sm text-muted-foreground">Explore destinations together and create lasting memories</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Cost Sharing</p>
                    <p className="text-sm text-muted-foreground">Split accommodation and transportation costs</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Safety in Numbers</p>
                    <p className="text-sm text-muted-foreground">Travel with trusted companions for added security</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Host Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hosted by</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/profile/${plan.user?.id}`} className="block">
                  <div className="flex items-center gap-4 mb-4 group">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={plan.user?.profileImage} alt={plan.user?.fullName} />
                      <AvatarFallback>{plan.user?.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">{plan.user?.fullName}</h3>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{plan.user?.rating}</span>
                        <span className="text-muted-foreground">({plan.user?.reviewCount} reviews)</span>
                      </div>
                      {plan.user?.verified && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{plan.user?.currentLocation}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{plan.user?.bio}</p>

                {!isOwnPlan && user ? (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Request to Join
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Request to Join Trip</DialogTitle>
                        <DialogDescription>
                          Send a message to {plan.user?.fullName} explaining why you'd be a great travel companion
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <Textarea
                          placeholder="Hi! I'm interested in joining your trip to {plan.destination}. I love..."
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
              </CardContent>
            </Card>

            {/* Safety Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Safety Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Meet in public places first</p>
                <p>• Share your itinerary with friends/family</p>
                <p>• Verify the traveler's profile and reviews</p>
                <p>• Trust your instincts</p>
                <p>• Keep emergency contacts handy</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}