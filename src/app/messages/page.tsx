"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plane, Mail, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ComingSoonPage() {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [progress, setProgress] = useState(75); // Example: 75% completion

  // Set a target date for the countdown (e.g., 7 days from now)
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 7);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);

      setDays(d);
      setHours(h);
      setMinutes(m);
      setSeconds(s);

      if (difference <= 0) {
        clearInterval(interval);
        setDays(0);
        setHours(0);
        setMinutes(0);
        setSeconds(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      // Here, you can add logic to store the email (e.g., API call)
      console.log(`Subscribed with email: ${email}`);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-500 to-indigo-600 text-white dark:from-gray-800 dark:to-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Logo and Title */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="bg-white/20 text-white rounded-lg p-2">
              <Plane className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold">TravelBuddy</h1>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-4">We’re Working on It!</h2>
          <p className="text-lg md:text-xl text-blue-100 dark:text-gray-300">
            Our platform is under construction. We’re adding the final touches to bring you an amazing experience.
          </p>

          {/* Countdown Timer */}
          <div className="flex justify-center gap-4 my-8">
            <Card className="bg-white/10 border-white/20 text-white w-24 h-24 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold">{days}</p>
              <p className="text-sm">Days</p>
            </Card>
            <Card className="bg-white/10 border-white/20 text-white w-24 h-24 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold">{hours}</p>
              <p className="text-sm">Hours</p>
            </Card>
            <Card className="bg-white/10 border-white/20 text-white w-24 h-24 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold">{minutes}</p>
              <p className="text-sm">Minutes</p>
            </Card>
            <Card className="bg-white/10 border-white/20 text-white w-24 h-24 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold">{seconds}</p>
              <p className="text-sm">Seconds</p>
            </Card>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-4 mb-8">
            <div
              className="bg-white rounded-full h-4 flex items-center justify-end pr-2"
              style={{ width: `${progress}%` }}
            >
              <span className="text-xs font-bold">{progress}%</span>
            </div>
          </div>

          {/* Subscription Form */}
          <Card className="bg-white/10 border-white/20 max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-white">Get Notified</CardTitle>
              <CardDescription className="text-blue-100 dark:text-gray-300">
                Subscribe to receive updates and launch notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSubscribed ? (
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <p>Thanks for subscribing! We’ll notify you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-white" />
                    <Input
                      type="email"
                      placeholder="Your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-white text-blue-600 hover:bg-gray-200">
                    Notify Me
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Features Preview */}
          <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Smart Matching
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-blue-100 dark:text-gray-300">
                  Find your perfect travel buddy based on interests, budget, and travel style.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Verified Profiles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-blue-100 dark:text-gray-300">
                  All travelers are verified for safety and trust.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  24/7 Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-blue-100 dark:text-gray-300">
                  Our team is always here to help you with anything.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-sm text-blue-200 dark:text-gray-400">
            <p>© 2026 TravelBuddy. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
