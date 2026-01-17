'use client';
import React, { useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BarChart3,
  LayoutDashboard,
  Menu,
  User as UserIcon,
  UtensilsCrossed,
  QrCode,
  Users,
  Sparkles,
  LogOut,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar';
import Header from '@/components/layout/Header';
import { AppContext } from '@/context/AppContext';
import BottomNavBar from '@/components/layout/BottomNavBar';
import { getTodaysQuote } from '@/lib/get-motivational-quote';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, isInitialized, signOut } = useContext(AppContext);
  const router = useRouter();
  const [quote, setQuote] = useState({ timeOfDay: 'morning', text: '' });
  const [isClient, setIsClient] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    // This ensures the code runs only on the client, avoiding SSR issues.
    setIsClient(true);
    setQuote(getTodaysQuote());
  }, []);

  React.useEffect(() => {
    // This effect handles the admin theme for the sidebar
    if (pathname.startsWith('/admin')) {
      document.body.classList.add('admin-sidebar-theme');
    } else {
      document.body.classList.remove('admin-sidebar-theme');
    }

    // Cleanup function to remove the class when the component unmounts
    // or before the next time the effect runs.
    return () => {
      document.body.classList.remove('admin-sidebar-theme');
    };
  }, [pathname]);

  React.useEffect(() => {
    // Redirect to profile creation if initialization is complete, there is no profile,
    // and the user is not on the profile or admin pages.
    if (isInitialized && !profile && pathname !== '/profile' && !pathname.startsWith('/admin')) {
        router.replace('/profile');
    }
  }, [isInitialized, profile, pathname, router]);

  const handleSignOut = () => {
    signOut();
    router.push('/');
  };


  const MotivationalPopover = () => (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="sr-only">Motivation</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Good {quote.timeOfDay.charAt(0).toUpperCase() + quote.timeOfDay.slice(1)}!</h4>
            <p className="text-sm text-muted-foreground">
              {quote.text}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  if (!isInitialized) {
    return <div className="flex items-center justify-center h-screen bg-background">
      <UtensilsCrossed className="h-12 w-12 animate-pulse text-primary"/>
    </div>;
  }

  if (pathname.startsWith('/admin')) {
    const adminNavItems = [
      { href: '/admin', label: 'Dashboard', icon: BarChart3 },
      { href: '/admin/users', label: 'Users', icon: Users },
      { href: '/dashboard', label: 'Back to App', icon: ArrowLeft },
    ];
    return (
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2 justify-center">
              <Menu className="w-8 h-8 text-primary" />
              <h1 className="font-headline text-2xl font-semibold">Admin</h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.label}
                      className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
                    >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <Header />
          <main className="flex-1 p-2">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
        <BottomNavBar />
    </div>
  );
}
