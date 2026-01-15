import ProfileForm from '@/components/profile/ProfileForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ProfilePage() {
  return (
    <div className="flex justify-center items-start py-8 px-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Your Profile</CardTitle>
          <CardDescription>
            Tell us about yourself to calculate your personalized calorie needs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>
    </div>
  );
}
