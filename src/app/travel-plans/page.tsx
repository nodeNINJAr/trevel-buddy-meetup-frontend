/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, DollarSign, Users, Trash2, Edit, MapPin } from 'lucide-react';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TravelPlan } from '@/types';

export default function TravelPlansPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [isPlansLoading, setIsPlansLoading] = useState(true);

  // FETCH USER TRAVEL PLANS
  const fetchTravelPlans = async () => {
    if (!user) return;

    try {
      setIsPlansLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/travel/mine`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to load travel plans");
        return;
      }

      setPlans(data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Unable to fetch travel plans");
    } finally {
      setIsPlansLoading(false);
    }
  };

  // Load on mount
  useEffect(() => {
    if (!isLoading && user) {
      fetchTravelPlans();
    }
  }, [user, isLoading]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/travel-plans');
    }
  }, [user, isLoading, router]);

  // DELETE PLAN
  const handleDelete = async (planId: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/travel/${planId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to delete plan");
        return;
      }

      toast.success("Travel plan deleted");
      fetchTravelPlans(); // refresh list
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  // LOADING STATE
  if (isLoading || isPlansLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>Loading travel plans...</p>
      </div>
    );
  }

  if (!user) return null;
  
  // UI — TRAVEL PLANS GRID
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Travel Plans</h1>
            <p className="text-muted-foreground">Manage your upcoming adventures</p>
          </div>

          <Button asChild>
            <Link href="/travel-plans/add">
              <Plus className="h-4 w-4 mr-2" />
              Add New Plan
            </Link>
          </Button>
        </div>

        {/* No Plans */}
        {plans.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Travel Plans Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start planning your next adventure and find travel companions
              </p>
              <Button asChild>
                <Link href="/travel-plans/add">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Plan
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Plans Grid */}
        {plans.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan: TravelPlan) => (
              <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={plan.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {plan.status || "ACTIVE"}
                    </Badge>

                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/travel-plans/${plan.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>

                      {/* Delete Button */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Travel Plan?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your travel plan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(plan?.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <CardTitle className="text-xl">{plan.destination}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {plan.country}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {plan.description}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(plan.startDate).toLocaleDateString()} -
                        {new Date(plan.endDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span>
                        {plan.budgetMin} - {plan.budgetMax} USD
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{plan.travelType}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {plan.interests?.slice(0, 3).map((interest: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>

                  <Button asChild className="w-full" variant="outline">
                    <Link href={`/travel-plans/${plan.id}`}>
                      View Details
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
