"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TravelPlan } from '@/types';
import { Button } from '@/components/ui/button';
import { Users, ArrowLeft } from 'lucide-react';

interface Props {
  initialPlan: TravelPlan;
}

export default function TravelPlanDetailsClient({ initialPlan }: Props) {
  const [plan] = useState(initialPlan);
  const router = useRouter();

  const handleViewParticipants = () => {
    router.push(`/travel-plans/${plan.id}/participants`);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/travel-plans">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plans
          </Link>
        </Button>

        <div className="p-5 border rounded-lg bg-white shadow-sm">
          <h1 className="text-3xl font-bold mb-4">{plan.destination}</h1>
          <p><strong>Country:</strong> {plan.country}</p>
          <p><strong>Description:</strong> {plan.description}</p>
          <p><strong>Type:</strong> {plan.travelType}</p>
          <p><strong>Status:</strong> {plan.status}</p>
          <p><strong>Start Date:</strong> {new Date(plan.startDate).toLocaleDateString('en-US')}</p>
          <p><strong>End Date:</strong> {new Date(plan.endDate).toLocaleDateString('en-US')}</p>

          <Button
            variant="outline"
            className="mt-4"
            onClick={handleViewParticipants}
          >
            <Users className="h-4 w-4 mr-2" />
            View Participants
          </Button>
        </div>
      </div>
    </div>
  );
}
