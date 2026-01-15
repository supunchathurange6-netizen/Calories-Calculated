'use client';

import { useContext } from 'react';
import { AppContext } from '@/context/AppContext';
import CalorieSummary from '@/components/dashboard/CalorieSummary';
import MacroDisplay from '@/components/dashboard/MacroDisplay';
import DailyMealLog from '@/components/dashboard/DailyMealLog';
import Welcome from '@/components/dashboard/Welcome';
import PersonalizedSuggestions from '@/components/ai/PersonalizedSuggestions';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { profile, isInitialized } = useContext(AppContext);

  if (!isInitialized) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!profile) {
    return <Welcome />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <CalorieSummary />
        <MacroDisplay />
        <div className="md:col-span-2 lg:col-span-2 flex items-center justify-center">
            <PersonalizedSuggestions />
        </div>
      </div>
      <DailyMealLog />
    </div>
  );
}
