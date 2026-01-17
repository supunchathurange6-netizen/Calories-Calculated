'use client';
import React, { useContext, useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AppContext } from '@/context/AppContext';
import { usePathname, useRouter } from 'next/navigation';
import { User, Sparkles, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';
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
import { SidebarTrigger } from '../ui/sidebar';


const getPageTitle = (pathname: string) => {
  if (pathname.startsWith('/admin')) {
    return 'Admin';
  }
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
      return 'Healthy Calorie Planner';
  }
};

export default function Header() {
  const { profile, signOut } = useContext(AppContext);
  const pathname = usePathname();
  const router = useRouter();
  const [quote, setQuote] = useState({ timeOfDay: 'morning', text: '' });
  const [isClient, setIsClient] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    // This ensures the code runs only on the client, avoiding SSR issues.
    setIsClient(true);
    setQuote(getTodaysQuote());
  }, []);

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

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="flex flex-1 items-center justify-start">
        {pathname.startsWith('/admin') && (
            <SidebarTrigger />
        )}
      </div>
      
      <h1 className="text-lg font-semibold md:text-xl font-headline text-center">
        {getPageTitle(pathname)}
      </h1>
      <div className="flex items-center gap-4 flex-1 justify-end">
        {profile ? (
          !pathname.startsWith('/admin') && (
            <>
              {isClient && <MotivationalPopover />}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={`https://i.pravatar.cc/150?u=${profile?.name}`} />
                      <AvatarFallback>
                        {profile ? profile.name.charAt(0).toUpperCase() : <User />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profile.name}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )
        ) : (
          !pathname.startsWith('/admin') && (
            <Button asChild>
              <Link href="/profile">Get Started</Link>
            </Button>
          )
        )}
      </div>
    </header>
  );
}
