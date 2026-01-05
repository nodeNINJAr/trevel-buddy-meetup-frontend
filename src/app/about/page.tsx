"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Globe, Users, Heart, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen dark:bg-gray-900 dark:text-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">About TravelBuddy</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We connect travelers from around the world to create unforgettable adventures together.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-6 w-6" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                At TravelBuddy, our mission is to make travel more enjoyable and meaningful by connecting like-minded travelers.
                We believe that the best travel experiences are shared with others.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                Our Community
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Our community is made up of adventurers, backpackers, and culture enthusiasts from all over the world.
                Join us and find your perfect travel companion!
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-6 w-6" />
                Our Values
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                We value safety, trust, and adventure. Every profile is verified, and our smart matching system ensures you find the best travel buddy for your journey.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-6 w-6" />
                Why Choose Us?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                With TravelBuddy, you get access to a global community of travelers, verified profiles, and a seamless platform to plan your next adventure.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
