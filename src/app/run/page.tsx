'use client';
import { useContext, useState } from 'react';
import { AppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Footprints, Zap, Flame, Timer, PlayCircle } from 'lucide-react';
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

// Mock state for demonstration. In a real app, this would come from context or state management.
const MOCK_RUN_DATA = {
    distance: "5.2 km",
    time: "31:45",
    pace: "6:05 /km",
    calories: "350 kcal",
    imageUrl: "https://picsum.photos/seed/running/600/400",
};


export default function RunPage() {
  const { isInitialized, profile } = useContext(AppContext);
  // This state will determine if we show the stats or the start screen.
  // For now, it's false to show the start screen.
  const [hasRunData, setHasRunData] = useState(false);

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
        <div className='flex justify-between items-center'>
            <h1 className="text-3xl font-headline flex items-center gap-2"><Footprints/> Running Tracker</h1>
            {hasRunData && (
                 <Button variant="outline" onClick={() => setHasRunData(false)}>End Run</Button>
            )}
        </div>
      
      {hasRunData && MOCK_RUN_DATA ? (
        <Card>
            <CardHeader>
            <CardTitle>Morning Run</CardTitle>
            <CardDescription>Here's a summary of your recent activity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Distance" value={MOCK_RUN_DATA.distance} icon={Footprints} />
                    <StatCard title="Time" value={MOCK_RUN_DATA.time} icon={Timer} />
                    <StatCard title="Avg. Pace" value={MOCK_RUN_DATA.pace} icon={Zap} />
                    <StatCard title="Calories Burned" value={MOCK_RUN_DATA.calories} icon={Flame} />
                </div>
                <div className="relative h-48 w-full max-w-lg mx-auto">
                    <Image src={MOCK_RUN_DATA.imageUrl} alt="Person running" data-ai-hint="person running" layout="fill" className="rounded-lg object-cover" />
                </div>
            </CardContent>
        </Card>
      ) : (
        <Card className="text-center">
            <CardHeader>
                <CardTitle>Ready for a run?</CardTitle>
                <CardDescription>Track your runs to automatically calculate burned calories.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex flex-col items-center justify-center min-h-[300px]">
                <div className="relative h-48 w-full max-w-sm mx-auto mb-4">
                    <Image src="https://picsum.photos/seed/startrun/600/400" alt="Person getting ready to run" data-ai-hint="runner stretching" layout="fill" className="rounded-lg object-cover" />
                </div>
                <p className="text-muted-foreground">Live tracking feature is coming soon!</p>
                <Button size="lg" onClick={() => setHasRunData(true)} disabled>
                    <PlayCircle className="mr-2" /> Start Live Tracking
                </Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
