'use client';
import { useContext } from 'react';
import { AppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Footprints, Zap } from 'lucide-react';
import Image from 'next/image';

export default function RunPage() {
  const { isInitialized, profile } = useContext(AppContext);

  if (!isInitialized) {
    return <div className="p-4">Loading...</div>;
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <h2 className="text-2xl font-headline mb-4">Create a Profile to Track Your Runs</h2>
        <p className="mb-6 text-muted-foreground">You need to set up your profile before you can track your running activity.</p>
        <Button asChild>
          <Link href="/profile">Create Profile</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-3xl font-headline flex items-center gap-2"><Footprints/> Running Tracker</h1>
      <Card>
        <CardHeader>
          <CardTitle>Morning Run</CardTitle>
          <CardDescription>Track your runs to automatically calculate burned calories.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
            <div className="relative h-48 w-full max-w-lg mx-auto mb-6">
                <Image src="https://picsum.photos/seed/running/600/400" alt="Person running" data-ai-hint="person running" layout="fill" className="rounded-lg object-cover" />
            </div>
          <p className="text-muted-foreground mb-4">This feature is coming soon!</p>
          <Button size="lg" disabled>
            <Zap className="mr-2" /> Start Live Tracking
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
