'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { UserProfile } from '@/lib/types';
import { collection, doc, deleteDoc } from 'firebase/firestore';
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
import { Trash2, Users as UsersIcon } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button, buttonVariants } from '@/components/ui/button';

export default function AdminUsersPage() {
  const firestore = useFirestore();
  const usersQuery = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const { toast } = useToast();

  const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleDeleteUser = async (userId: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'users', userId));
      toast({
        title: 'User Deleted',
        description: 'The user profile has been successfully deleted.',
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete user. You may not have permission.',
      });
    }
    setUserToDelete(null);
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
                <TableHead className="px-2 text-right">Actions</TableHead>
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
                    <TableCell className="px-2 py-3 text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
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
                  <TableCell className="px-2 py-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => setUserToDelete(user)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
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
      
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user profile for{' '}
              <span className="font-bold">{userToDelete?.name}</span>. Note that this only removes the user profile document, not their authentication record or related sub-collection data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={() => userToDelete && handleDeleteUser(userToDelete.id)}
            >
              Delete User Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
