'use client';
import { useContext } from 'react';
import { AppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Footprints, Zap, Flame, Timer } from 'lucide-react';
import Image from 'next/image';

const StatCard = ({ title, value, icon: Icon }: { title: string, value: string, icon: React.ElementType }) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    )
}


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
        <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Distance" value="5.2 km" icon={Footprints} />
                <StatCard title="Time" value="31:45" icon={Timer} />
                <StatCard title="Avg. Pace" value="6:05 /km" icon={Zap} />
                <StatCard title="Calories Burned" value="350 kcal" icon={Flame} />
            </div>
            <div className="relative h-48 w-full max-w-lg mx-auto">
                <Image src="https://picsum.photos/seed/running/600/400" alt="Person running" data-ai-hint="person running" layout="fill" className="rounded-lg object-cover" />
            </div>
            <div className='text-center'>
                <p className="text-muted-foreground mb-4">Live tracking feature is coming soon!</p>
                <Button size="lg" disabled>
                    <Zap className="mr-2" /> Start Live Tracking
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
