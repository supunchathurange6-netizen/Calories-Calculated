'use client';
import React, { useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  Home,
  User as UserIcon,
  UtensilsCrossed,
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
import Header from './Header';
import { AppContext } from '@/context/AppContext';
import BottomNavBar from './BottomNavBar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, isInitialized } = useContext(AppContext);
  const router = useRouter();

  React.useEffect(() => {
    if (isInitialized && !profile && pathname !== '/profile') {
      router.replace('/profile');
    }
  }, [isInitialized, profile, pathname, router]);


  const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/progress', label: 'Progress', icon: BarChart3 },
    { href: '/profile', label: 'Profile', icon: UserIcon },
  ];

  if (!isInitialized) {
    return <div className="flex items-center justify-center h-screen bg-background">
      <UtensilsCrossed className="h-12 w-12 animate-pulse text-primary"/>
    </div>;
  }
  
  if (!profile) {
    return <>{children}</>
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <UtensilsCrossed className="w-8 h-8 text-primary" />
            <h1 className="font-headline text-2xl font-semibold">Ceylanta</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
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
