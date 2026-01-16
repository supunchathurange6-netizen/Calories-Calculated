'use client';
import React, { useContext } from 'react';
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
} from '@/components/ui/sidebar';
import Header from '@/components/layout/Header';
import { AppContext } from '@/context/AppContext';
import BottomNavBar from '@/components/layout/BottomNavBar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, isInitialized } = useContext(AppContext);
  const router = useRouter();

  React.useEffect(() => {
    // Redirect to profile creation if initialization is complete, there is no profile,
    // and the user is not on the profile or admin pages.
    if (isInitialized && !profile && pathname !== '/profile' && !pathname.startsWith('/admin')) {
        router.replace('/profile');
    }
  }, [isInitialized, profile, pathname, router]);


  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/scan', label: 'Scan', icon: QrCode },
    { href: '/progress', label: 'Progress', icon: BarChart3 },
    { href: '/profile', label: 'Profile', icon: UserIcon },
  ];

  if (!isInitialized) {
    return <div className="flex items-center justify-center h-screen bg-background">
      <UtensilsCrossed className="h-12 w-12 animate-pulse text-primary"/>
    </div>;
  }

  if (pathname.startsWith('/admin')) {
    const adminNavItems = [
      { href: '/admin', label: 'Dashboard', icon: BarChart3 },
      { href: '/dashboard', label: 'Back to App', icon: ArrowLeft },
    ];
    return (
      <SidebarProvider className="admin-light-theme">
        <Sidebar variant='inset' collapsible='icon'>
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2 justify-center">
              <Menu className="w-8 h-8 text-primary" />
              <h1 className="font-headline text-2xl font-semibold group-data-[collapsible=icon]:hidden">Admin</h1>
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
                      className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
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
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar variant='inset' collapsible='icon'>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2 justify-center">
            <UtensilsCrossed className="w-8 h-8 text-primary" />
            <h1 className="font-headline text-2xl font-semibold group-data-[collapsible=icon]:hidden">Ceylanta</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
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
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
        <BottomNavBar />
      </SidebarInset>
    </SidebarProvider>
  );
}
