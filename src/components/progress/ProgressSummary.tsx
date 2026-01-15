'use client';

import { AppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp, Milestone } from 'lucide-react';
import { useContext } from 'react';

const StatCard = ({ title, value, icon: Icon, change }: { title: string; value: string; icon: React.ElementType; change?: { amount: string, type: 'gain' | 'loss' } }) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {change && (
                    <p className="text-xs text-muted-foreground flex items-center">
                        {change.type === 'loss' ? 
                            <ArrowDown className="h-4 w-4 text-destructive mr-1" /> : 
                            <ArrowUp className="h-4 w-4 text-primary mr-1" />
                        }
                        {change.amount} since start
                    </p>
                )}
            </CardContent>
        </Card>
    )
}

export default function ProgressSummary() {
    const { weightHistory } = useContext(AppContext);

    if (weightHistory.length === 0) {
        return null;
    }

    const startingWeight = weightHistory[0].weight;
    const currentWeight = weightHistory[weightHistory.length - 1].weight;
    const weightChange = currentWeight - startingWeight;
    
    const changeType = weightChange > 0 ? 'gain' : 'loss';
    const changeAmount = Math.abs(weightChange).toFixed(1);

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <StatCard 
                title="Starting Weight"
                value={`${startingWeight.toFixed(1)} kg`}
                icon={Milestone}
            />
            <StatCard 
                title="Current Weight"
                value={`${currentWeight.toFixed(1)} kg`}
                icon={Milestone}
                change={{ amount: `${changeAmount} kg`, type: changeType }}
            />
            <StatCard 
                title="Total Change"
                value={`${weightChange.toFixed(1)} kg`}
                icon={changeType === 'loss' ? ArrowDown : ArrowUp}
            />
        </div>
    )
}
