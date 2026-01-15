'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import FoodSearch from './FoodSearch';
import ManualFoodEntryForm from './ManualFoodEntryForm';
import { Button } from '@/components/ui/button';
import { MealType } from '@/lib/types';

interface AddFoodDialogProps {
  children: React.ReactNode;
  mealType: MealType;
}

export default function AddFoodDialog({ children, mealType }: AddFoodDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);

  const handleFoodAdded = () => {
    setIsOpen(false);
    setShowManualForm(false);
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setShowManualForm(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {showManualForm ? 'Add Custom Food' : `Add Food to ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`}
          </DialogTitle>
          <DialogDescription>
            {showManualForm ? 'Enter the details of your custom food item.' : 'Search for a food or add a new one manually.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto pr-2">
            {showManualForm ? (
            <ManualFoodEntryForm onFoodAdded={handleFoodAdded} mealType={mealType}/>
            ) : (
            <FoodSearch onFoodAdded={handleFoodAdded} mealType={mealType} />
            )}
        </div>

        <Button variant="link" onClick={() => setShowManualForm(!showManualForm)}>
            {showManualForm ? 'Back to Search' : 'Can\'t find your food? Add it manually.'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
