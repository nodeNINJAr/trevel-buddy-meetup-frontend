/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Plane, 
  Users, 
  MapPin, 
  Search, 
  UserPlus, 
  CheckCircle2, 
  Star,
  Shield,
  Globe,
  Heart,
  TrendingUp,
  Award,
  LogIn
} from 'lucide-react';
import { popularDestinations, testimonials, mockUsers } from '@/lib/mockData';
import Image from 'next/image';

export default function HomePage() {

  //  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.2
        }} />
        
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge className="bg-white/20 text-white border-white/40 hover:bg-white/30" variant="outline">
              Join 10,000+ Travelers Worldwide
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Find Your Perfect Travel Companion
            </h1>
            <p className="text-xl md:text-2xl text-blue-100">
              Connect with like-minded travelers, share adventures, and explore the world together
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild className="text-lg h-12 px-8 bg-white text-blue-600 hover:bg-gray-100">
                <Link href="/register">
                  Get Started Free
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg h-12 px-8 border-white text-white hover:bg-white/10">
                <Link href="/explore">
                  Explore Travelers
                </Link>
              </Button>
            </div>

            {/* Demo Login Section */}
            <div className="pt-6 border-t border-white/20 mt-8">
              <p className="text-sm text-blue-100 mb-3">Want to explore as an admin?</p>
              <Button 
                size="lg" 
                variant="secondary"
                className="text-base h-11 px-6"
              >
                <LogIn className="mr-2 h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 pt-8 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>Free to Join</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span>Verified Profiles</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                <span>Global Community</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="secondary">How It Works</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Your Journey in 3 Simple Steps</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join our community and connect with travelers who share your passion for exploration
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <UserPlus className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>1. Create Your Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Sign up and tell us about your travel interests, visited countries, and dream destinations
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>2. Share Your Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Post your upcoming trips with dates, destinations, and what you're looking to experience
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>3. Find Your Buddy</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Match with compatible travelers and start planning your shared adventure together
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Destinations Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="secondary">Popular Destinations</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Where Travelers Are Heading</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover the most popular destinations among our community
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {popularDestinations.map((destination) => (
              <Link key={destination.id} href="/explore">
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="relative h-48 overflow-hidden">
                    <Image 
                      width={1400}
                      height={600}
                      src={destination.image} 
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white">{destination.name}</h3>
                      <p className="text-sm text-white/90">{destination.country}</p>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">{destination.description}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{destination.travelers} travelers</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Rated Travelers Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="secondary">Top Travelers</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Top-Rated Community</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with experienced travelers who&rsquo;ve earned trust from the community
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {mockUsers.map((user) => (
              <Link key={user.id} href={`/profile/${user.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="text-center">
                    <Avatar className="w-24 h-24 mx-auto mb-4">
                      <AvatarImage src={user.profileImage} alt={user.fullName} />
                      <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-lg">{user.fullName}</CardTitle>
                    <CardDescription className="flex items-center justify-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {user.currentLocation}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold">{user.rating}</span>
                      <span className="text-sm text-muted-foreground">({user.reviewCount} reviews)</span>
                    </div>
                    {user.verified && (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2">{user.bio}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="secondary">Why Choose Us</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The Best Platform for Travel Connections</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We provide everything you need to find the perfect travel companion
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Verified Profiles</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  All travelers are verified for your safety and peace of mind
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Search className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Smart Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Find companions based on interests, budget, and travel style
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Heart className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Global Community</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Join thousands of travelers from around the world
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Award className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Review System</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Read and leave reviews to build trust within the community
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="secondary">Success Stories</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Travelers Are Saying</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real stories from travelers who found their perfect companions
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={testimonial.image} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{testimonial.name}</CardTitle>
                      <CardDescription className="text-sm">{testimonial.location}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <TrendingUp className="h-16 w-16 mx-auto" />
            <h2 className="text-3xl md:text-5xl font-bold">Ready to Start Your Adventure?</h2>
            <p className="text-xl text-blue-100">
              Join thousands of travelers who've already found their perfect travel companions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button size="lg" asChild className="text-lg h-12 px-8 bg-white text-blue-600 hover:bg-gray-100">
                <Link href="/register">
                  <Plane className="mr-2 h-5 w-5" />
                  Sign Up Now
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg h-12 px-8 border-white text-white hover:bg-white/10">
                <Link href="/explore">
                  Browse Travelers
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary text-primary-foreground rounded-lg p-1.5">
                  <Plane className="h-5 w-5" />
                </div>
                <span className="font-bold text-lg">TravelBuddy</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Connecting travelers worldwide to create unforgettable adventures together.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/explore" className="hover:text-primary">Explore</Link></li>
                <li><Link href="/travel-plans" className="hover:text-primary">Travel Plans</Link></li>
                <li><Link href="/dashboard" className="hover:text-primary">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">About Us</Link></li>
                <li><Link href="#" className="hover:text-primary">Contact</Link></li>
                <li><Link href="#" className="hover:text-primary">Careers</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-primary">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-primary">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2025 TravelBuddy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}