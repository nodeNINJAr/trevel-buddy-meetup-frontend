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
import { MapPin, Star, CheckCircle2, Edit, Mail, Users, Loader2, Calendar, Globe, Heart, User } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { Review, TravelPlan, User as UserType } from "@/types";
import Link from "next/link";

// ---------- Zod Schema ----------
const profileSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  currentLocation: z.string().optional(),
  travelInterests: z.string().optional(),
  visitedCountries: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// ---------- Component ----------
export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: authUser, isLoading: sessionLoading } = useAuth();
  const [profileUser, setProfileUser] = useState<UserType | null>(null);
  const [travelPlans, setTravelPlans] = useState<TravelPlan[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const isOwnProfile = authUser?.id === Number(params.id);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProfileFormValues>({
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
            fullName: profileData.data.profile.fullName || "",
            bio: profileData.data.profile.bio || "",
            currentLocation: profileData.data.profile.currentLocation || "",
            travelInterests: profileData.data.profile.travelInterests?.join(", ") || "",
            visitedCountries: profileData.data.profile.visitedCountries?.join(", ") || "",
            dateOfBirth: profileData.data.profile.dateOfBirth
              ? new Date(profileData.data.profile.dateOfBirth).toISOString().split('T')[0]
              : "",
            gender: profileData.data.profile.gender || "",
          });
        }

        // Fetch travel plans
        const plansRes = await fetch(`${BASE_URL}/api/v1/travel/mine`, { credentials: "include" });
        if (plansRes.ok) {
          const plansData = await plansRes.json();
          setTravelPlans(plansData.data || []);
        }

        // Fetch reviews
        const reviewsRes = await fetch(`${BASE_URL}/api/v1/reviews/my/${userId}`, { credentials: "include" });
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData.data || []);
        }
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
        profile: { 
          fullName: data.fullName,
          bio: data.bio,
          currentLocation: data.currentLocation,
          travelInterests: data.travelInterests?.split(",").map(i => i.trim()).filter(Boolean),
          visitedCountries: data.visitedCountries?.split(",").map(c => c.trim()).filter(Boolean),
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : null,
          gender: data.gender,
        }

      };
      const res = await fetch(`${BASE_URL}/api/v1/user/${authUser?.id}`, {
        method: "PATCH",
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

  // ---------- Handle Avatar Upload ----------
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    if (!file.type.match('image.*')) {
      toast.error("Please select an image file");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await fetch(`${BASE_URL}/api/v1/user/avatar`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload avatar");

      const updatedUser = await res.json();
      setProfileUser(updatedUser.data);
      toast.success("Avatar updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploading(false);
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

  const genderOptions = [
    { value: "MALE", label: "Male" },
    { value: "FEMALE", label: "Female" },
    { value: "OTHER", label: "Other" },
    { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl">

        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={profileUser.image || profileUser.profile?.avatarUrl} alt={profileUser.userName} />
                  <AvatarFallback className="text-4xl">{profileUser.userName?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                {isOwnProfile && (
                  <div className="absolute bottom-0 right-0">
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="bg-white p-2 rounded-full shadow-md border">
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-3xl font-bold">{profileUser?.profile?.fullName || profileUser.userName}</h1>
                      {profileUser?.profile?.verified && (
                        <Badge variant="secondary" className="gap-1">
                          <CheckCircle2 className="h-4 w-4" /> Verified
                        </Badge>
                      )}
                    </div>

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
                      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Profile</DialogTitle>
                          <DialogDescription>Update your profile information</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="fullName">Full Name</Label>
                              <Input id="fullName" {...register("fullName")} />
                              {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="gender">Gender</Label>
                              <Select onValueChange={(value) => setValue("gender", value)} defaultValue={profileUser.profile?.gender || ""}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                  {genderOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                              id="bio"
                              rows={4}
                              placeholder="Tell others about yourself..."
                              {...register("bio")}
                            />
                            {errors.bio && <p className="text-red-500 text-sm">{errors.bio.message}</p>}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="currentLocation">Current Location</Label>
                              <Input id="currentLocation" placeholder="Dhaka, Bangladesh" {...register("currentLocation")} />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="dateOfBirth">Date of Birth</Label>
                              <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="travelInterests">Travel Interests (comma separated)</Label>
                            <Input
                              id="travelInterests"
                              placeholder="Hiking, Beach, Adventure, Culture"
                              {...register("travelInterests")}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="visitedCountries">Visited Countries (comma separated)</Label>
                            <Input
                              id="visitedCountries"
                              placeholder="Bangladesh, Thailand, Malaysia"
                              {...register("visitedCountries")}
                            />
                          </div>

                          <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit">
                              Save Changes
                            </Button>
                          </div>
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

                  {profileUser?.profile?.dateOfBirth && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Joined {new Date(profileUser.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {profileUser?.profile?.bio && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">About</h3>
                    <p className="text-muted-foreground">{profileUser.profile.bio}</p>
                  </div>
                )}

                {!isOwnProfile && (
                  <div className="flex gap-3 mt-4">
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

        {/* Profile Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profileUser.profile?.gender && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Gender:</span>
                  <span>{profileUser.profile.gender}</span>
                </div>
              )}

              {profileUser.profile?.dateOfBirth && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Date of Birth:</span>
                  <span>{new Date(profileUser.profile.dateOfBirth).toLocaleDateString()}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Location:</span>
                <span>{profileUser.profile?.currentLocation || "Not specified"}</span>
              </div>

              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Member since:</span>
                <span>{new Date(profileUser.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Travel Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" /> Travel Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profileUser.profile?.travelInterests && profileUser?.profile?.travelInterests?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Travel Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {profileUser?.profile?.travelInterests.map((interest, idx) => (
                      <Badge key={idx} variant="secondary">{interest}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {profileUser.profile?.visitedCountries && profileUser.profile?.visitedCountries?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Visited Countries</h4>
                  <div className="flex flex-wrap gap-2">
                    {profileUser.profile.visitedCountries.map((country, idx) => (
                      <Badge key={idx} variant="secondary">{country}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Travel Plans */}
        {travelPlans.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mb-4">Travel Plans</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {travelPlans.map((plan) => (
                <Card key={plan.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {plan.destination}
                      <Badge variant={plan.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {plan.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">{plan.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{plan.country}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(plan.startDate).toLocaleDateString()} -
                        {new Date(plan.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <Button variant="outline" className="w-full mt-3" asChild>
                      <Link href={`/travel-plans/${plan.id}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mb-4">Reviews</h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold">{review.rating}.0</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-2">{review.comment}</p>
                    {review.travelPlanId && (
                      <Button variant="link" className="p-0 h-auto mt-2" asChild>
                        <Link href={`/travel-plans/${review.travelPlanId}`} className="text-sm">
                          View trip details
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
