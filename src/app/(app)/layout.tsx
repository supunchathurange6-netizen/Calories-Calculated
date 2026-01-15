'use client';
import React, { useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  LayoutDashboard,
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

function MobileHeader() {
  const pathname = usePathname();

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
        case '/dashboard':
            return 'Dashboard';
        case '/profile':
            return 'Profile';
        case '/progress':
            return 'Progress';
        case '/scan':
            return 'Scan QR Code';
        default:
            return 'Ceylanta Calories';
    }
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:hidden justify-center">
      <h1 className="text-lg font-semibold md:text-xl font-headline flex-1 text-center">
          {getPageTitle(pathname)}
      </h1>
    </header>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, isInitialized } = useContext(AppContext);
  const router = useRouter();

  React.useEffect(() => {
    // Only redirect if initialization is complete, there is no profile, AND we are not on the profile page.
    if (isInitialized && !profile && pathname !== '/profile') {
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
        <div className="hidden md:block">
          <Header />
        </div>
        <MobileHeader />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
        <BottomNavBar />
      </SidebarInset>
    </SidebarProvider>
  );
}
