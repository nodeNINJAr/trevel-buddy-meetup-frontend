"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Map,
  MessageSquare,
  BarChart3,
  Star,
  Settings,
  Menu,
  X,
  Plane,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/ThemeToggle";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  dataTour?: string;
}

interface SidebarContentProps {
  links: SidebarLink[];
  pathname: string;
  setIsOpen: (open: boolean) => void;
}

// Move this outside the main component
const SidebarContent: React.FC<SidebarContentProps> = ({ links, pathname, setIsOpen }) => (
  <>
    <div className="p-6 border-b">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl">
        <div className="bg-primary text-primary-foreground rounded-lg p-1.5">
          <Plane className="h-5 w-5" />
        </div>
        <span>TravelBuddy</span>
      </Link>
    </div>

    <ScrollArea className="flex-1 py-6">
      <nav className="space-y-1 px-3">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              data-tour={link.dataTour}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </ScrollArea>

    <div className="p-4 border-t">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Theme</span>
        <ThemeToggle />
      </div>
    </div>
  </>
);

const userLinks: SidebarLink[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/travel-plans", label: "My Plans", icon: Map, dataTour: "plans" },
  { href: "/messages", label: "Messages", icon: MessageSquare, dataTour: "messages" },
  { href: "/profile/me", label: "Profile", icon: Users, dataTour: "profile" },
];

const adminLinks: SidebarLink[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/users", label: "Manage Users", icon: Users, dataTour: "users" },
  { href: "/dashboard/travels", label: "Manage Travels", icon: Map, dataTour: "travels" },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare, dataTour: "messages-admin" },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/reviews", label: "Reviews", icon: Star },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const { user } = useAuth();
  const pathname = usePathname() || "/";
  const [isOpen, setIsOpen] = React.useState(false);

  const links = user?.role === "ADMIN" ? adminLinks : userLinks;

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-20 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:bg-card">
        <SidebarContent links={links} pathname={pathname} setIsOpen={setIsOpen} />
      </aside>

      {/* Mobile Sidebar */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-card lg:hidden flex flex-col">
            <SidebarContent links={links} pathname={pathname} setIsOpen={setIsOpen} />
          </aside>
        </>
      )}
    </>
  );
}
