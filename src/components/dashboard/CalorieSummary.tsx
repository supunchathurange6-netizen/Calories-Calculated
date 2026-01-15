'use client';
import { useContext } from 'react';
import { AppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Flame } from 'lucide-react';

export default function CalorieSummary() {
  const { calorieInfo, dailyTotals } = useContext(AppContext);

  const consumed = dailyTotals.calories;
  const target = calorieInfo?.targetCalories || 2000;
  const remaining = target - consumed;
  const progress = (consumed / target) * 100;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center justify-between">
          Calories
          <Flame className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <div className="text-4xl font-bold font-headline text-primary">
          {Math.round(remaining)}
        </div>
        <p className="text-xs text-muted-foreground">Remaining</p>
        <div className="mt-4 flex-grow flex flex-col justify-end">
          <Progress value={progress} className="w-full h-2" />
          <div className="flex justify-between text-xs mt-1 text-muted-foreground">
            <span>Consumed: {Math.round(consumed)}</span>
            <span>Target: {target}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
