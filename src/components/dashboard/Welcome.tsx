'use client';
import { useContext } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import placeholderImage from '@/lib/placeholder-images.json';
import { AppContext } from '@/context/AppContext';

const heroImage = placeholderImage.placeholderImages.find(p => p.id === 'hero-background');

export default function Welcome() {
  const { profile } = useContext(AppContext);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-4">
      {heroImage && (
        <div className="relative w-full max-w-4xl h-56 md:h-72 rounded-xl overflow-hidden shadow-2xl">
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            data-ai-hint={heroImage.imageHint}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-left">
            <h1 className="font-headline text-3xl md:text-5xl font-bold text-white shadow-md">
              Ceylanta Calories
            </h1>
            <p className="text-white/90 mt-2 text-sm md:text-base max-w-lg">
                Your personal guide to healthy eating with a Sri Lankan flavor.
            </p>
          </div>
        </div>
      )}

      <Card className="w-full max-w-lg -mt-10 z-10 shadow-xl border-2">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            Start Your Wellness Journey
          </CardTitle>
          <CardDescription>
            {profile 
              ? "You have a profile. Let's get started!" 
              : "To get started, let's create your personalized profile. It only takes a minute."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="lg" className="w-full font-headline">
            <Link href={profile ? "/dashboard" : "/profile"}>
              {profile ? "Get Started" : "Create Your Profile"}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
