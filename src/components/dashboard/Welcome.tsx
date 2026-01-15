'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import placeholderImage from '@/lib/placeholder-images.json'

const heroImage = placeholderImage.placeholderImages.find(p => p.id === 'hero-background');

export default function Welcome() {
  return (
    <Card className="w-full text-center shadow-xl overflow-hidden">
        {heroImage && 
            <div className="relative h-48 w-full">
                 <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    data-ai-hint={heroImage.imageHint}
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            </div>
        }
      <CardHeader className="mt-[-2rem] z-10 relative">
        <CardTitle className="font-headline text-4xl">Welcome to Ceylanta Calories!</CardTitle>
        <CardDescription className="max-w-md mx-auto">
          Your personal guide to healthy eating with a Sri Lankan flavor. Track your meals, count your calories, and reach your wellness goals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-6">
          To get started, let's create your personalized profile.
        </p>
        <Button asChild size="lg" className="font-headline">
          <Link href="/profile">Create Your Profile</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
