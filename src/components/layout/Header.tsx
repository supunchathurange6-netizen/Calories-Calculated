'use client';
import React, { useContext } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AppContext } from '@/context/AppContext';
import { usePathname } from 'next/navigation';
import { User } from 'lucide-react';

const getPageTitle = (pathname: string) => {
    switch (pathname) {
        case '/':
            return 'Dashboard';
        case '/profile':
            return 'Profile';
        case '/progress':
            return 'Progress';
        default:
            return 'Ceylanta Calories';
    }
}

export default function Header() {
    const { profile } = useContext(AppContext);
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
            <div className="hidden md:block">
              <SidebarTrigger />
            </div>
            <h1 className="text-lg font-semibold md:text-xl font-headline">
                {getPageTitle(pathname)}
            </h1>
            <div className="ml-auto flex items-center gap-4">
                <Avatar>
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${profile?.name}`} />
                    <AvatarFallback>
                        {profile ? profile.name.charAt(0).toUpperCase() : <User />}
                    </AvatarFallback>
                </Avatar>
            </div>
        </header>
    );
}
