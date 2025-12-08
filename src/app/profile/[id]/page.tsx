"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, CheckCircle2, Edit, Mail, Users, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Review, TravelPlan, User } from "@/types";

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
  const { user: authUser, isLoading: sessionLoading } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [travelPlans, setTravelPlans] = useState<TravelPlan[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const isOwnProfile = authUser?.id === params.id;
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  // ---------- Fetch Profile ----------
  useEffect(() => {
    if (sessionLoading) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const userId = isOwnProfile ? authUser?.id : params.id;
        if (!userId) return;

        // Fetch profile data
        const profileRes = await fetch(`${BASE_URL}/api/v1/user/${userId}`, { credentials: "include" });
        if (!profileRes.ok) throw new Error("Failed to fetch profile");
        const profileData = await profileRes.json();
        setProfileUser(profileData.data);

        // Initialize form for editing
        if (isOwnProfile && profileData.data?.profile) {
          reset({
            name: profileData.data.profile.fullName || "",
            bio: profileData.data.profile.bio || "",
            currentLocation: profileData.data.profile.currentLocation || "",
            travelInterests: profileData.data.profile.travelInterests?.join(", ") || "",
            visitedCountries: profileData.data.profile.visitedCountries?.join(", ") || "",
          });
        }

        // Fetch travel plans
        const plansRes = await fetch(`${BASE_URL}/api/v1/travel/${userId}`, { credentials: "include" });
        if (plansRes.ok) setTravelPlans(await plansRes.json());

        // Fetch reviews
        const reviewsRes = await fetch(`${BASE_URL}/api/v1/reviews/user/${userId}`, { credentials: "include" });
        if (reviewsRes.ok) setReviews(await reviewsRes.json());
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [params.id, sessionLoading, isOwnProfile, authUser, reset, BASE_URL]);

  // ---------- Save Profile ----------
  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const updateData = {
        name: data.name,
        bio: data.bio,
        currentLocation: data.currentLocation,
        travelInterests: data.travelInterests?.split(",").map(i => i.trim()).filter(Boolean),
        visitedCountries: data.visitedCountries?.split(",").map(c => c.trim()).filter(Boolean),
      };

      const res = await fetch(`${BASE_URL}/api/v1/user/profile/${authUser?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updateData),
      });

      if (!res.ok) throw new Error("Failed to update profile");
      const updatedProfile = await res.json();
      setProfileUser(updatedProfile.data);
      toast.success("Profile updated successfully!");
      setIsEditOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    }
  };

  // ---------- Redirect if not authenticated ----------
  useEffect(() => {
    if (!sessionLoading && !authUser) router.push("/login");
  }, [authUser, sessionLoading, router]);

  if (sessionLoading || loading) return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (!profileUser) return (
    <div className="container mx-auto px-4 py-12">
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">User not found</p>
        </CardContent>
      </Card>
    </div>
  );

  const averageRating = reviews.length
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
                <AvatarImage src={profileUser.image || profileUser.profile?.avatarUrl} alt={profileUser.userName} />
                <AvatarFallback className="text-4xl">{profileUser.userName?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">{profileUser?.profile?.fullName}</h1>
                    {profileUser?.profile?.currentLocation && (
                      <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{profileUser.profile.currentLocation}</span>
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
                            <Input id="travelInterests" placeholder="Hiking, Beach Trips" {...register("travelInterests")} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="visitedCountries">Visited Countries</Label>
                            <Input id="visitedCountries" placeholder="Bangladesh, India" {...register("visitedCountries")} />
                          </div>
                          <Button type="submit" className="w-full">Save Changes</Button>
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
                  {profileUser?.profile?.verified && (
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle2 className="h-4 w-4" /> Verified Traveler
                    </Badge>
                  )}
                </div>

                {profileUser?.profile?.bio && <p className="text-muted-foreground">{profileUser.profile.bio}</p>}

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

        {/* Travel Plans */}
        {travelPlans.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {travelPlans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <CardTitle>{plan.destination}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {plan.country}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Travel Interests */}
        {profileUser?.profile?.travelInterests && profileUser?.profile?.travelInterests?.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Travel Interests</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {profileUser.profile.travelInterests.map((interest, idx) => (
                <Badge key={idx} variant="secondary">{interest}</Badge>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Visited Countries */}
        {profileUser?.profile?.visitedCountries && profileUser?.profile?.visitedCountries?.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Visited Countries</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {profileUser.profile.visitedCountries.map((country, idx) => (
                <Badge key={idx} variant="secondary">{country}</Badge>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{review.comment}</span>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{review.rating}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
