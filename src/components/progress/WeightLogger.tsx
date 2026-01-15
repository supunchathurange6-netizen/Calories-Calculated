'use client';

import { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const weightSchema = z.object({
  weight: z.coerce.number().min(20, 'Invalid weight').max(300, 'Invalid weight'),
});

export default function WeightLogger() {
  const { addWeightEntry, profile } = useContext(AppContext);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof weightSchema>>({
    resolver: zodResolver(weightSchema),
    defaultValues: { weight: profile?.weight || 0 },
  });

  function onSubmit(values: z.infer<typeof weightSchema>) {
    addWeightEntry(values.weight);
    toast({
      title: 'Weight Logged!',
      description: `Your weight of ${values.weight}kg has been saved.`,
    });
    form.reset({ weight: values.weight });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Today's Weight (kg)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" placeholder="e.g. 70.5" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Log Weight</Button>
      </form>
    </Form>
  );
}
