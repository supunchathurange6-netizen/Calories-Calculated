'use client';
import { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppContext } from '@/context/AppContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { MealType } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  calories: z.coerce.number().min(0, 'Calories must be a positive number.'),
  protein: z.coerce.number().min(0).optional().default(0),
  carbs: z.coerce.number().min(0).optional().default(0),
  fat: z.coerce.number().min(0).optional().default(0),
});

interface ManualFoodEntryFormProps {
  onFoodAdded: () => void;
  mealType: MealType;
}

export default function ManualFoodEntryForm({ onFoodAdded, mealType }: ManualFoodEntryFormProps) {
  const { addCustomFood, addFoodLog } = useContext(AppContext);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', calories: 0, protein: 0, carbs: 0, fat: 0 },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newFood = addCustomFood(values);
    addFoodLog(newFood, mealType, 1);
    toast({
      title: 'Custom Food Added!',
      description: `${values.name} has been added to your log and saved for future use.`,
    });
    onFoodAdded();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Food Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Homemade Sandwich" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="calories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Calories</FormLabel>
              <FormControl>
                <Input type="number" placeholder="250" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="protein"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Protein (g)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="carbs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Carbs (g)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fat (g)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full">Add and Log Food</Button>
      </form>
    </Form>
  );
}
