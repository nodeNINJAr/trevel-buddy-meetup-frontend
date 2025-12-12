/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// ----- Options -----
const travelTypes = ["Solo", "Family", "Friends", "Couple"];
const interestOptions = [
  "Beach",
  "Hiking",
  "Photography",
  "Food Tours",
  "Culture",
  "Nightlife",
  "Museums",
  "Adventure",
  "Wellness",
  "Shopping",
  "History",
  "Architecture",
  "Nature",
  "Wildlife",
  "Sports",
];

type TravelPlanFormValues = {
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
  budgetMin?: number;
  budgetMax?: number;
  travelType: string;
  interests: string[];
  description: string;
};

export default function AddTravelPlanPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TravelPlanFormValues>({
    defaultValues: {
      destination: "",
      country: "",
      startDate: "",
      endDate: "",
      budgetMin: undefined,
      budgetMax: undefined,
      travelType: "",
      interests: [],
      description: "",
    },
  });

  const selectedInterests = watch("interests");

  const toggleInterest = (interest: string) => {
    const current = selectedInterests || [];
    if (current.includes(interest)) {
      setValue("interests", current.filter((i) => i !== interest));
    } else {
      setValue("interests", [...current, interest]);
    }
  };

  const onSubmit = async (data: TravelPlanFormValues) => {
    setIsLoading(true);

    const payload = {
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
    };

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/travel/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to create travel plan");

      toast.success("Travel plan created successfully!");
      router.push("/travel-plans");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Please log in to create a travel plan
            </p>
            <Button asChild>
              <Link href="/login">Log In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Create Travel Plan</h1>
          <p className="text-muted-foreground">
            Share your travel plans and find companions
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Trip Details</CardTitle>
              <CardDescription>
                Tell us about your upcoming adventure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Destination & Country */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Destination City *</Label>
                  <Input
                    placeholder="e.g., Bali"
                    {...register("destination", { required: "Destination is required" })}
                  />
                  {errors.destination && (
                    <p className="text-red-500 text-sm">{errors.destination.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Country *</Label>
                  <Input
                    placeholder="e.g., Indonesia"
                    {...register("country", { required: "Country is required" })}
                  />
                  {errors.country && (
                    <p className="text-red-500 text-sm">{errors.country.message}</p>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    {...register("startDate", { required: "Start date is required" })}
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-sm">{errors.startDate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Input
                    type="date"
                    {...register("endDate", { required: "End date is required" })}
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-sm">{errors.endDate.message}</p>
                  )}
                </div>
              </div>

              {/* Budget */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Budget (USD)</Label>
                  <Input type="number" {...register("budgetMin")} />
                </div>

                <div className="space-y-2">
                  <Label>Max Budget (USD)</Label>
                  <Input type="number" {...register("budgetMax")} />
                </div>
              </div>

              {/* Travel Type */}
              <div className="space-y-2">
                <Label>Travel Type *</Label>
                <Controller
                  control={control}
                  name="travelType"
                  rules={{ required: "Travel type is required" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select travel type" />
                      </SelectTrigger>
                      <SelectContent>
                        {travelTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.travelType && (
                  <p className="text-red-500 text-sm">{errors.travelType.message}</p>
                )}
              </div>

              {/* Interests */}
              <div className="space-y-2">
                <Label>Travel Interests *</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Select activities you're interested in
                </p>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map((interest) => (
                    <Badge
                      key={interest}
                      variant={selectedInterests.includes(interest) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                      {selectedInterests.includes(interest) && (
                        <X className="ml-1 h-3 w-3" />
                      )}
                    </Badge>
                  ))}
                </div>
                {errors.interests && (
                  <p className="text-red-500 text-sm">{errors.interests.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea
                  rows={5}
                  {...register("description", { required: "Description is required" })}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description.message}</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Travel Plan
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/travel-plans">Cancel</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
