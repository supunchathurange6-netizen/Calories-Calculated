'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const harmCategories = [
  'HARM_CATEGORY_HATE_SPEECH',
  'HARM_CATEGORY_DANGEROUS_CONTENT',
  'HARM_CATEGORY_HARASSMENT',
  'HARM_CATEGORY_SEXUALLY_EXPLICIT',
] as const;

const thresholds = [
  'BLOCK_NONE',
  'BLOCK_ONLY_HIGH',
  'BLOCK_MEDIUM_AND_ABOVE',
  'BLOCK_LOW_AND_ABOVE',
] as const;

const safetySettingsSchema = z.object({
  HARM_CATEGORY_HATE_SPEECH: z.enum(thresholds),
  HARM_CATEGORY_DANGEROUS_CONTENT: z.enum(thresholds),
  HARM_CATEGORY_HARASSMENT: z.enum(thresholds),
  HARM_CATEGORY_SEXUALLY_EXPLICIT: z.enum(thresholds),
});

type SafetySettingsFormValues = z.infer<typeof safetySettingsSchema>;

export default function AdminPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const firestore = useFirestore();

  const form = useForm<SafetySettingsFormValues>({
    resolver: zodResolver(safetySettingsSchema),
    defaultValues: {
      HARM_CATEGORY_HATE_SPEECH: 'BLOCK_MEDIUM_AND_ABOVE',
      HARM_CATEGORY_DANGEROUS_CONTENT: 'BLOCK_MEDIUM_AND_ABOVE',
      HARM_CATEGORY_HARASSMENT: 'BLOCK_MEDIUM_AND_ABOVE',
      HARM_CATEGORY_SEXUALLY_EXPLICIT: 'BLOCK_MEDIUM_AND_ABOVE',
    },
  });

  function onSubmit(data: SafetySettingsFormValues) {
    setIsLoading(true);
    
    const settingsRef = doc(firestore, 'safetySettings', 'global');
    setDocumentNonBlocking(settingsRef, data, { merge: true });

    toast({
      title: 'Success!',
      description: 'Safety settings have been updated.',
    });
    
    setIsLoading(false);
  }

  return (
    <div className="flex justify-center items-start p-4 md:p-8">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Shield className="text-primary" />
            Safety Settings Admin Panel
          </CardTitle>
          <CardDescription>
            Configure the content safety thresholds for the generative AI models. This panel is hidden and should only be accessible to administrators.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {harmCategories.map((category) => (
                  <FormField
                    key={category}
                    control={form.control}
                    name={category}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">{category.replace('HARM_CATEGORY_', '')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a threshold" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {thresholds.map((threshold) => (
                              <SelectItem key={threshold} value={threshold}>
                                {threshold.replace('BLOCK_', '').replace('_', ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save Settings'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
