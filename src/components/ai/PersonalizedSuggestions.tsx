'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';
import { personalizedFoodSuggestions } from '@/ai/flows/personalized-food-suggestions';
import { Card } from '../ui/card';

const formSchema = z.object({
  dietaryGoals: z.string().min(1, 'Please state your dietary goals.'),
  foodPreferences: z.string().min(1, 'Please state your food preferences.'),
  cuisinePreference: z.string().min(1, 'Please state your cuisine preference.'),
});

export default function PersonalizedSuggestions() {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dietaryGoals: '',
      foodPreferences: '',
      cuisinePreference: 'Sri Lankan and International',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSuggestions([]);
    try {
      const result = await personalizedFoodSuggestions(values);
      setSuggestions(result.suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      toast({
        title: 'Error',
        description: 'Failed to get suggestions. Please try again.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full h-full text-lg p-6 bg-accent/50 border-2 border-dashed hover:bg-accent/80 transition-all duration-300">
          <Sparkles className="mr-2 h-5 w-5" />
          Get AI Food Suggestions
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <Sparkles />
            AI Food Advisor
          </DialogTitle>
          <DialogDescription>
            Get personalized food ideas based on your goals and tastes.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="dietaryGoals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dietary Goal</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Weight loss, muscle gain" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="foodPreferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Food Preferences</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Spicy, vegetarian, low-carb" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cuisinePreference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cuisine Preference</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Sri Lankan, Italian" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  'Get Suggestions'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        {suggestions.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="font-semibold">Here are some ideas:</h3>
            <Card className="p-4">
              <ul className="list-disc list-inside space-y-1 text-sm">
                {suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
