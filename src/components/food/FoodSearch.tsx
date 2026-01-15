'use client';
import { useState, useMemo, useContext } from 'react';
import { AppContext } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import foodsData from '@/lib/foods.json';
import type { Food, MealType } from '@/lib/types';
import { PlusCircle } from 'lucide-react';

interface FoodSearchProps {
  onFoodAdded: () => void;
  mealType: MealType;
}

const servingOptions = [
  { label: '0.5 serving', value: 0.5 },
  { label: '1 serving', value: 1 },
  { label: '1.5 servings', value: 1.5 },
  { label: '2 servings', value: 2 },
];

export default function FoodSearch({ onFoodAdded, mealType }: FoodSearchProps) {
  const { addFoodLog, customFoods } = useContext(AppContext);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServings, setSelectedServings] = useState<Record<string, number>>({});

  const allFoods = useMemo(() => [...foodsData.foods, ...customFoods], [customFoods]);

  const filteredFoods = useMemo(() =>
    allFoods.filter((food) =>
      food.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [allFoods, searchTerm]
  );

  const handleAddFood = (food: Food) => {
    const servings = selectedServings[food.id] || 1;
    addFoodLog(food, mealType, servings);
    toast({
      title: `${food.name} added!`,
      description: `Added ${servings} serving(s) to your ${mealType}.`,
    });
    onFoodAdded();
  };
  
  const handleServingChange = (foodId: string, value: string) => {
    setSelectedServings(prev => ({ ...prev, [foodId]: parseFloat(value) }));
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        type="search"
        placeholder="Search for food..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <ScrollArea className="h-64">
        <div className="space-y-2 pr-4">
          {filteredFoods.map((food) => (
            <div key={food.id} className="flex items-center justify-between p-2 rounded-md border">
              <div>
                <p className="font-semibold">{food.name}</p>
                <p className="text-sm text-muted-foreground">{food.calories} kcal per serving</p>
              </div>
              <div className="flex items-center gap-2">
                <Select onValueChange={(value) => handleServingChange(food.id, value)} defaultValue="1">
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Servings" />
                  </SelectTrigger>
                  <SelectContent>
                    {servingOptions.map(opt => (
                      <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="icon" variant="ghost" onClick={() => handleAddFood(food)}>
                  <PlusCircle className="h-5 w-5 text-primary" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
