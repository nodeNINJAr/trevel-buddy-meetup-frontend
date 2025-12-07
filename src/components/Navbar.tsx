"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, Plane, Users, Map, LayoutDashboard, User, LogOut, MapPin, MessageSquare 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Move these outside of Navbar
interface LinksProps {
  pathname: string;
}

export const LoggedOutLinks: React.FC<LinksProps> = ({ pathname }) => (
  <>
    <Link 
      href="/explore"
      className={`transition-colors hover:text-primary ${pathname === "/explore" ? "text-primary font-medium" : "text-muted-foreground"}`}
    >
      Explore Travelers
    </Link>
    <Link 
      href="/find-buddy"
      className={`transition-colors hover:text-primary ${pathname === "/find-buddy" ? "text-primary font-medium" : "text-muted-foreground"}`}
    >
      Find Travel Buddy
    </Link>
  </>
);

export const UserLinks: React.FC<LinksProps> = ({ pathname }) => (
  <>
    <Link 
      href="/explore"
      className={`transition-colors hover:text-primary ${pathname === "/explore" ? "text-primary font-medium" : "text-muted-foreground"}`}
    >
      Explore
    </Link>
    <Link 
      href="/travel-plans"
      className={`transition-colors hover:text-primary ${pathname === "/travel-plans" ? "text-primary font-medium" : "text-muted-foreground"}`}
    >
      My Plans
    </Link>
    <Link 
      href="/messages"
      className={`transition-colors hover:text-primary relative ${pathname === "/messages" ? "text-primary font-medium" : "text-muted-foreground"}`}
    >
      Messages
      <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs" variant="destructive">
        3
      </Badge>
    </Link>
  </>
);

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = () => {
    logout();
    router.push("/");
    toast.success("Signed out successfully");
    setMobileOpen(false);
  };

  if (isLoading) {
    return (
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <div className="bg-primary text-primary-foreground rounded-lg p-1.5">
                <Plane className="h-5 w-5" />
              </div>
              <span className="hidden sm:inline">TravelBuddy</span>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="bg-primary text-primary-foreground rounded-lg p-1.5">
              <Plane className="h-5 w-5" />
            </div>
            <span className="hidden sm:inline">TravelBuddy</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {!user && <LoggedOutLinks pathname={pathname} />}
            {user && <UserLinks pathname={pathname} />}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
              {/* theme toggle */}
             {!user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profileImage} alt={user.fullName} />
                      <AvatarFallback>{user.fullName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-sm">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${user.id}`}>Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/messages">Messages</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-6 mt-6">
                {user && (
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.profileImage} alt={user.fullName} />
                      <AvatarFallback>{user.fullName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  {!user ? (
                    <>
                      <Link href="/explore" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-lg">
                        <Users className="h-5 w-5" /> Explore Travelers
                      </Link>
                      <Link href="/find-buddy" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-lg">
                        <MapPin className="h-5 w-5" /> Find Travel Buddy
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/explore" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-lg">
                        <Users className="h-5 w-5" /> Explore
                      </Link>
                      <Link href="/travel-plans" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-lg">
                        <Map className="h-5 w-5" /> My Plans
                      </Link>
                      <Link href="/messages" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-lg">
                        <MessageSquare className="h-5 w-5" /> Messages
                        <Badge className="ml-auto" variant="destructive">3</Badge>
                      </Link>
                      <Link href={`/profile/${user.id}`} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-lg">
                        <User className="h-5 w-5" /> Profile
                      </Link>
                      <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-lg">
                        <LayoutDashboard className="h-5 w-5" /> Dashboard
                      </Link>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm text-muted-foreground">Theme</span>
                  {/* theme toggle */}
                 </div>

                <div className="flex flex-col gap-3 pt-4 border-t mt-auto">
                  {!user ? (
                    <>
                      <Button variant="outline" asChild>
                        <Link href="/login" onClick={() => setMobileOpen(false)}>Login</Link>
                      </Button>
                      <Button asChild>
                        <Link href="/register" onClick={() => setMobileOpen(false)}>Get Started</Link>
                      </Button>
                    </>
                  ) : (
                    <Button variant="destructive" onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
