'use client';

import { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { ActivityLevel, Gender, Goal } from '@/lib/types';

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  age: z.coerce.number().min(12, { message: 'You must be at least 12 years old.' }).max(100),
  gender: z.enum(['male', 'female'], { required_error: 'Please select a gender.' }),
  height: z.coerce.number().min(100, { message: 'Height must be at least 100 cm.' }),
  weight: z.coerce.number().min(30, { message: 'Weight must be at least 30 kg.' }),
  activityLevel: z.enum(['low', 'medium', 'high'], { required_error: 'Please select an activity level.' }),
  goal: z.enum(['lose', 'maintain', 'gain'], { required_error: 'Please select a goal.' }),
});

export default function ProfileForm() {
  const { profile, setProfile, addWeightEntry } = useContext(AppContext);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile || {
      name: '',
      age: 25,
      gender: 'male',
      height: 170,
      weight: 70,
      activityLevel: 'low',
      goal: 'maintain',
    },
  });

  function onSubmit(values: z.infer<typeof profileSchema>) {
    setProfile(values);
    addWeightEntry(values.weight);
    toast({
      title: 'Profile Saved!',
      description: "Your calorie and macro goals have been calculated.",
    });
    router.push('/');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl><Input placeholder="Your Name" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl><Input type="number" placeholder="25" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Gender</FormLabel>
                <FormControl>
                    <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex items-center space-x-4 pt-2"
                    >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl><RadioGroupItem value="male" /></FormControl>
                        <FormLabel className="font-normal">Male</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl><RadioGroupItem value="female" /></FormControl>
                        <FormLabel className="font-normal">Female</FormLabel>
                    </FormItem>
                    </RadioGroup>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Height (cm)</FormLabel>
                <FormControl><Input type="number" placeholder="170" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Weight (kg)</FormLabel>
                <FormControl><Input type="number" placeholder="70" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="activityLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Activity Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value as ActivityLevel}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select your activity level" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="low">Low (sedentary, light exercise)</SelectItem>
                  <SelectItem value="medium">Medium (moderately active)</SelectItem>
                  <SelectItem value="high">High (very active)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="goal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Goal</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value as Goal}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select your primary goal" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="lose">Lose Weight</SelectItem>
                  <SelectItem value="maintain">Maintain Weight</SelectItem>
                  <SelectItem value="gain">Gain Weight</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="lg" className="w-full font-headline">{profile ? 'Update Profile' : 'Save Profile & Continue'}</Button>
      </form>
    </Form>
  );
}
