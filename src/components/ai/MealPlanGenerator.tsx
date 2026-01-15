'use client';

import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Utensils } from 'lucide-react';
import { AppContext } from '@/context/AppContext';
import { GenerateMealPlanInput, GenerateMealPlanOutput, generateMealPlan } from '@/ai/flows/meal-plan-flow';
import { Textarea } from '../ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { z } from 'zod';

const formSchema = z.object({
  preferences: z.string().min(1, "Please describe your preferences."),
});

type MealPlanFormValues = z.infer<typeof formSchema>;


export default function MealPlanGenerator() {
  const [mealPlan, setMealPlan] = useState<GenerateMealPlanOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { profile, calorieInfo } = useContext(AppContext);

  const form = useForm<MealPlanFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preferences: 'Sri Lankan food, healthy',
    },
  });

  async function onSubmit(values: MealPlanFormValues) {
    if (!profile || !calorieInfo) {
        toast({
            title: 'Profile Not Found',
            description: 'Please complete your profile to generate a meal plan.',
            variant: 'destructive',
        });
        return;
    }
    
    setIsLoading(true);
    setMealPlan(null);
    try {
      const input: GenerateMealPlanInput = {
        ...values,
        goal: profile.goal,
        targetCalories: calorieInfo.targetCalories,
      }
      const result = await generateMealPlan(input);
      setMealPlan(result);
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate a meal plan. Please try again.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  }

  const MealDisplay = ({ title, meal }: { title: string; meal: GenerateMealPlanOutput['breakfast'] }) => (
     <AccordionItem value={title.toLowerCase()}>
        <AccordionTrigger className="font-headline text-lg">
          <div className="flex justify-between w-full pr-4">
            <span>{title}</span>
            <span className="text-muted-foreground font-body font-normal">{Math.round(meal.totalCalories)} kcal</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
            <ul className="space-y-2 text-sm">
                {meal.items.map((item, index) => (
                    <li key={index} className="flex justify-between">
                        <span>{item.name}</span>
                        <span className='text-muted-foreground'>{item.calories} kcal</span>
                    </li>
                ))}
            </ul>
        </AccordionContent>
    </AccordionItem>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Sparkles className="text-primary" /> AI Meal Plan Generator
        </CardTitle>
        <CardDescription>
            Get a personalized, one-day meal plan from our AI nutritionist based on your goals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                    control={form.control}
                    name="preferences"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Food Preferences</FormLabel>
                        <FormControl>
                            <Textarea placeholder="e.g., Spicy, vegetarian, Sri Lankan" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Plan...</>
                    ) : (
                        'Generate My Meal Plan'
                    )}
                    </Button>
                </form>
                </Form>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 flex flex-col items-center justify-center">
                {isLoading && (
                    <div className='text-center text-muted-foreground'>
                        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" />
                        <p className='font-semibold'>Generating your plan...</p>
                        <p className='text-sm'>This may take a moment.</p>
                    </div>
                )}
                {!isLoading && !mealPlan && (
                    <div className='text-center text-muted-foreground'>
                        <Utensils className="h-10 w-10 mx-auto mb-4" />
                        <p className='font-semibold'>Your personalized meal plan will appear here.</p>
                    </div>
                )}
                {mealPlan && (
                     <div>
                        <div className='text-center mb-4'>
                            <h3 className="font-headline text-xl">Your Daily Plan</h3>
                            <p className="text-muted-foreground">Total: {mealPlan.totalCalories} kcal</p>
                        </div>
                        <Accordion type="multiple" defaultValue={['breakfast', 'lunch', 'dinner']} className="w-full">
                            <MealDisplay title="Breakfast" meal={mealPlan.breakfast} />
                            <MealDisplay title="Lunch" meal={mealPlan.lunch} />
                            <MealDisplay title="Dinner" meal={mealPlan.dinner} />
                            <MealDisplay title="Snacks" meal={mealPlan.snacks} />
                        </Accordion>
                         <p className="text-xs text-muted-foreground mt-4 p-2 bg-background rounded-md">{mealPlan.notes}</p>
                    </div>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
