'use client';
import React, { useContext } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AppContext } from '@/context/AppContext';
import { usePathname } from 'next/navigation';
import { User, Bell } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

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

export default function Header() {
    const { profile } = useContext(AppContext);
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
            <div className="md:hidden flex-1" />
            <h1 className="text-lg font-semibold md:text-xl font-headline flex-1 text-center md:text-left">
                {getPageTitle(pathname)}
            </h1>
            <div className="flex items-center gap-4 flex-1 justify-end">
               {profile ? (
                <>
                    <Button variant="ghost" size="icon">
                        <Bell className="h-5 w-5" />
                        <span className="sr-only">Notifications</span>
                    </Button>
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${profile?.name}`} />
                        <AvatarFallback>
                            {profile ? profile.name.charAt(0).toUpperCase() : <User />}
                        </AvatarFallback>
                    </Avatar>
                </>
               ) : (
                <Button asChild>
                    <Link href="/profile">Get Started</Link>
                </Button>
               )}
            </div>
        </header>
    );
}
