"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Star,
  CheckCircle2,
  Edit,
  Mail,
  Users,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Review, TravelPlan, UserProfile } from "@/types";


// ---------- Zod Schema ----------
const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().max(300).optional(),
  currentLocation: z.string().optional(),
  travelInterests: z.string().optional(),
  visitedCountries: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// ---------- Component ----------
export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: sessionLoading } = useAuth();
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [travelPlans, setTravelPlans] = useState<TravelPlan[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const isOwnProfile = user?.id === params.id;
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  // ---------- Fetch Profile Data ----------
  useEffect(() => {
    if (sessionLoading) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);

        // Fetch user profile (cookies automatically sent)
        const profileRes = await fetch(`${BASE_URL}/api/v1/user/${params.id}`, {
          credentials: "include",
        });

        if (profileRes.ok) {
          const profileData: UserProfile = await profileRes.json();
          setProfileUser(profileData);

          if (isOwnProfile) {
            reset({
              name: profileData.name || "",
              bio: profileData.bio || "",
              currentLocation: profileData.currentLocation || "",
              travelInterests: profileData.travelInterests?.join(", ") || "",
              visitedCountries: profileData.visitedCountries?.join(", ") || "",
            });
          }
        }

        // Fetch travel plans
        const plansRes = await fetch(`${BASE_URL}/api/v1/travel/${params.id}`, {
          credentials: "include",
        });
        if (plansRes.ok) {
          setTravelPlans(await plansRes.json());
        }

        // Fetch reviews
        const reviewsRes = await fetch(`/api/reviews/user/${params.id}`, {
          credentials: "include",
        });
        if (reviewsRes.ok) {
          setReviews(await reviewsRes.json());
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [params.id, isOwnProfile, sessionLoading, reset]);

  // ---------- Save Profile ----------
  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const updateData = {
        ...data,
        travelInterests: data.travelInterests
          ?.split(",")
          .map((i) => i.trim())
          .filter(Boolean),
        visitedCountries: data.visitedCountries
          ?.split(",")
          .map((c) => c.trim())
          .filter(Boolean),
      };

      const res = await fetch("/api/user-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // send cookies
        body: JSON.stringify(updateData),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const updatedProfile: UserProfile = await res.json();
      setProfileUser(updatedProfile);
      toast.success("Profile updated successfully!");
      setIsEditOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    }
  };

  // ---------- Redirect if not authenticated ----------
  useEffect(() => {
    if (!sessionLoading && !user) router.push("/login");
  }, [user, sessionLoading, router]);

  if (sessionLoading || loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">User not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="w-32 h-32">
                <AvatarImage src={profileUser.image} alt={profileUser.name} />
                <AvatarFallback className="text-4xl">{profileUser.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-bold">{profileUser.name}</h1>
                      {profileUser.currentLocation && (
                        <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{profileUser.currentLocation}</span>
                        </div>
                      )}
                    </div>

                    {isOwnProfile && (
                      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" /> Edit Profile
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Profile</DialogTitle>
                            <DialogDescription>Update your profile information</DialogDescription>
                          </DialogHeader>

                          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Full Name</Label>
                              <Input id="name" {...register("name")} />
                              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="currentLocation">Current Location</Label>
                              <Input id="currentLocation" {...register("currentLocation")} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="bio">Bio</Label>
                              <Textarea id="bio" rows={4} {...register("bio")} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="travelInterests">Travel Interests</Label>
                              <Input id="travelInterests" placeholder="e.g. Hiking, Photography" {...register("travelInterests")} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="visitedCountries">Visited Countries</Label>
                              <Input id="visitedCountries" placeholder="e.g. Japan, France" {...register("visitedCountries")} />
                            </div>
                            <Button type="submit" className="w-full">
                              Save Changes
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold">{averageRating}</span>
                      <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
                    </div>
                    {profileUser.verified && (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Verified Traveler
                      </Badge>
                    )}
                  </div>
                </div>

                {profileUser.bio && <p className="text-muted-foreground">{profileUser.bio}</p>}

                {!isOwnProfile && (
                  <div className="flex gap-3">
                    <Button onClick={() => router.push(`/messages?userId=${params.id}`)}>
                      <Mail className="h-4 w-4 mr-2" /> Send Message
                    </Button>
                    <Button variant="outline">
                      <Users className="h-4 w-4 mr-2" /> Connect
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rest of Travel Plans, Reviews, Interests, Countries sections remain the same */}
      </div>
    </div>
  );
}
