'use client';
import { useContext } from 'react';
import { AppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import AddFoodDialog from '../food/AddFoodDialog';
import type { LoggedFood, MealType } from '@/lib/types';

const mealTitles: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snacks: 'Snacks',
};

export default function DailyMealLog() {
  const { loggedFoods, removeFoodLog } = useContext(AppContext);

  const mealFoods = (mealType: MealType) =>
    loggedFoods.filter((food) => food.mealType === mealType);

  const mealCalories = (mealType: MealType) =>
    mealFoods(mealType).reduce((total, food) => total + food.calories * food.servings, 0);

  const MealSection = ({ mealType }: { mealType: MealType }) => {
    const foods = mealFoods(mealType);
    const totalCalories = mealCalories(mealType);
    return (
      <AccordionItem value={mealType}>
        <AccordionTrigger className="font-headline text-lg">
          <div className="flex justify-between w-full pr-4">
            <span>{mealTitles[mealType]}</span>
            <span className="text-muted-foreground font-body font-normal">{Math.round(totalCalories)} kcal</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            {foods.length > 0 ? (
              foods.map((food: LoggedFood) => (
                <div key={food.id} className="flex justify-between items-center p-2 rounded-md bg-background">
                  <div>
                    <p className="font-semibold">{food.name}</p>
                    <p className="text-sm text-muted-foreground">{Math.round(food.calories * food.servings)} kcal &bull; {food.servings} serving(s)</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeFoodLog(food.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground p-2">No food logged for this meal.</p>
            )}
            <AddFoodDialog mealType={mealType}>
                <Button variant="outline" className="w-full mt-2">
                    <Plus className="mr-2 h-4 w-4" /> Add Food
                </Button>
            </AddFoodDialog>
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Today's Meals</CardTitle>
        <CardDescription>Log your food intake for today to track your progress.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={['breakfast', 'lunch', 'dinner']} className="w-full">
          <MealSection mealType="breakfast" />
          <MealSection mealType="lunch" />
          <MealSection mealType="dinner" />
          <MealSection mealType="snacks" />
        </Accordion>
      </CardContent>
    </Card>
  );
}
