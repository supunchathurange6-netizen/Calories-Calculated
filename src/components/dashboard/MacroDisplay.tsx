'use client';
import { useContext } from 'react';
import { AppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Drumstick, Wheat, Droplets } from 'lucide-react';

const MacroCard = ({ title, icon: Icon, consumed, target }: { title: string; icon: React.ElementType; consumed: number; target: number }) => (
  <Card className="text-center flex flex-col">
    <CardHeader className="pb-2">
      <CardTitle className="text-base font-medium flex items-center justify-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col flex-grow justify-center">
      <div className="text-2xl font-bold font-headline">
        {Math.round(consumed)}<span className="text-lg text-muted-foreground">/{target}g</span>
      </div>
    </CardContent>
  </Card>
);

export default function MacroDisplay() {
  const { calorieInfo, dailyTotals } = useContext(AppContext);

  return (
    <>
      <MacroCard
        title="Protein"
        icon={Drumstick}
        consumed={dailyTotals.protein}
        target={calorieInfo?.targetProtein || 0}
      />
      <MacroCard
        title="Carbs"
        icon={Wheat}
        consumed={dailyTotals.carbs}
        target={calorieInfo?.targetCarbs || 0}
      />
      <MacroCard
        title="Fat"
        icon={Droplets}
        consumed={dailyTotals.fat}
        target={calorieInfo?.targetFat || 0}
      />
    </>
  );
}
