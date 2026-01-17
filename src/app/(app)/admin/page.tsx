'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { UserProfile } from '@/lib/types';
import { collection } from 'firebase/firestore';
import { Users, BarChart2 } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const chartConfig = {
  users: {
    label: 'New Users',
    color: 'hsl(var(--chart-1))',
  },
};


export default function AdminPage() {
  const firestore = useFirestore();
  const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);

  const userStats = useMemo(() => {
    if (!users) {
      return {
        totalUsers: 0,
        usersByMonth: [],
      };
    }

    const usersByMonth = users
      .filter(user => user.createdAt?.toDate)
      .reduce((acc, user) => {
        const month = format(user.createdAt.toDate(), 'yyyy-MM');
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const chartData = Object.entries(usersByMonth)
      .map(([month, count]) => ({
        month,
        users: count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalUsers: users.length,
      usersByMonth: chartData,
    };
  }, [users]);
  
  if (isLoading) {
    return (
        <div className="p-4 md:p-8 space-y-6">
            <h1 className="text-3xl font-headline">Admin Dashboard</h1>
            <div className="grid gap-4 grid-cols-1">
                <Skeleton className="h-28" />
            </div>
            <Skeleton className="h-96" />
        </div>
    )
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-3xl font-headline">Admin Dashboard</h1>
      
      <div className="grid gap-4 grid-cols-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Total registered users in the system</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart2 /> User Registration Growth</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          {userStats.usersByMonth.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-80 w-full">
              <BarChart accessibilityLayer data={userStats.usersByMonth}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="users" fill="var(--color-users)" radius={4} />
              </BarChart>
            </ChartContainer>
          ) : (
             <div className="flex flex-col items-center justify-center h-80 text-center p-8 bg-muted/50 rounded-md">
                 <h3 className="font-headline text-lg">Not Enough User Data</h3>
                 <p className="text-sm text-muted-foreground">New user registrations will be shown here once they are recorded.</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
