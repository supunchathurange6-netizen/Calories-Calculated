'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { UserProfile } from '@/lib/types';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Users as UsersIcon } from 'lucide-react';

export default function AdminUsersPage() {
  const firestore = useFirestore();
  const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);

  const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-headline flex items-center gap-2">
        <UsersIcon /> User Management
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Registered Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-2">User</TableHead>
                <TableHead className="px-2 w-[50px]">Age</TableHead>
                <TableHead className="px-2">Gender</TableHead>
                <TableHead className="px-2">Goal</TableHead>
                <TableHead className="px-2">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-2 py-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-2 py-3"><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell className="px-2 py-3"><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell className="px-2 py-3"><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell className="px-2 py-3"><Skeleton className="h-4 w-20" /></TableCell>
                  </TableRow>
                ))}
              {!isLoading && users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="px-2 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${user.name}`} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium break-words max-w-32">{user.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-3">{user.age}</TableCell>
                  <TableCell className="capitalize px-2 py-3">{user.gender}</TableCell>
                  <TableCell className="px-2 py-3">
                    <Badge variant="outline" className="capitalize">{user.goal}</Badge>
                  </TableCell>
                  <TableCell className="px-2 py-3">
                    {user.createdAt ? format(user.createdAt.toDate(), 'P') : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!isLoading && !users?.length && (
            <div className="text-center p-8 text-muted-foreground">
              No users found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
