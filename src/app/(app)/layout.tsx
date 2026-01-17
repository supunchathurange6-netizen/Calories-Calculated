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
  Users,
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
        <Sidebar collapsible='offcanvas'>
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
          <main className="flex-1 p-4 md:p-6">{children}</main>
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
