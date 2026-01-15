'use client';
import { useContext } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AppContext } from '@/context/AppContext';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { Card } from '../ui/card';

const chartImage = PlaceHolderImages.find(p => p.id === 'progress-chart-bg');

export default function WeightChart() {
  const { weightHistory } = useContext(AppContext);
  
  if (weightHistory.length < 2) {
    return (
        <Card className="flex flex-col items-center justify-center text-center p-8 h-80 bg-muted/50 overflow-hidden">
             {chartImage && 
                <div className="relative h-32 w-full mb-4">
                     <Image
                        src={chartImage.imageUrl}
                        alt={chartImage.description}
                        data-ai-hint={chartImage.imageHint}
                        fill
                        className="object-cover rounded-md opacity-50"
                    />
                </div>
            }
            <h3 className="font-headline text-lg">Not Enough Data</h3>
            <p className="text-sm text-muted-foreground">Log your weight for a few more days to see your progress chart.</p>
        </Card>
    );
  }

  const chartData = weightHistory.map(entry => ({
    date: entry.date,
    weight: entry.weight
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <ChartContainer config={{}} className="h-80 w-full">
      <AreaChart
        accessibilityLayer
        data={chartData}
        margin={{ left: 12, right: 12, top: 12 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
        <YAxis 
            domain={['dataMin - 2', 'dataMax + 2']}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => `${value}kg`}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
        <defs>
            <linearGradient id="fillWeight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
            </linearGradient>
        </defs>
        <Area
          dataKey="weight"
          type="natural"
          fill="url(#fillWeight)"
          stroke="hsl(var(--primary))"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  );
}
