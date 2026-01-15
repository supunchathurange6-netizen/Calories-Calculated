'use client';
import { useContext } from 'react';
import WeightChart from '@/components/progress/WeightChart';
import WeightLogger from '@/components/progress/WeightLogger';
import { AppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ProgressSummary from '@/components/progress/ProgressSummary';

export default function ProgressPage() {
  const { isInitialized, profile } = useContext(AppContext);

  if (!isInitialized) {
    return <div className="p-4">Loading...</div>;
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <h2 className="text-2xl font-headline mb-4">Create a Profile to Track Progress</h2>
        <p className="mb-6 text-muted-foreground">You need to set up your profile before you can track your weight and progress.</p>
        <Button asChild>
          <Link href="/profile">Create Profile</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-3xl font-headline">Your Progress</h1>
      <ProgressSummary />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weight Over Time</CardTitle>
            <CardDescription>Your weight journey, visualized.</CardDescription>
          </CardHeader>
          <CardContent>
            <WeightChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Log Your Weight</CardTitle>
            <CardDescription>Add a new weight entry for today.</CardDescription>
          </CardHeader>
          <CardContent>
            <WeightLogger />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
