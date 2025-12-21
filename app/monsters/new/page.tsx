'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { monsterSchema, type Monster } from '@/types/monster';
import { Button } from '@/components/ui/button';
import { DndMonsterCard } from '@/components/DndMonsterCard';
import { DynamicMonsterForm } from '@/components/DynamicMonsterForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import Link from 'next/link';

export default function NewMonsterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableMonsters, setAvailableMonsters] = useState<Array<{ id: string; monster: Monster }>>([]);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedMonsterId, setSelectedMonsterId] = useState<string>('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<Monster>({
    resolver: zodResolver(monsterSchema),
    defaultValues: {
      Actions: [],
      Reactions: [],
      Traits: [],
      LegendaryActions: [],
      Skills: [],
      Saves: [],
      Speed: [],
      Senses: [],
      DamageVulnerabilities: [],
      DamageResistances: [],
      DamageImmunities: [],
      ConditionImmunities: [],
      Languages: [],
      AC: { Value: 10, Notes: '' },
      HP: { Value: 10, Notes: '' },
      InitiativeModifier: 0,
      InitiativeAdvantage: false,
      Abilities: {
        Str: 10,
        Dex: 10,
        Con: 10,
        Int: 10,
        Wis: 10,
        Cha: 10,
      },
    },
  });

  const formData = watch();

  // Load available monsters for importing
  useEffect(() => {
    fetch('/api/monsters')
      .then(res => res.json())
      .then(data => setAvailableMonsters(data.monsters || []))
      .catch(err => console.error('Failed to load monsters:', err));
  }, []);

  const handleImportMonster = () => {
    const found = availableMonsters.find(m => m.id === selectedMonsterId);
    if (!found) return;

    // Reset form with selected monster's data but without the ID (creating a copy)
    const monsterCopy = { ...found.monster };
    delete (monsterCopy as any).id;
    reset(monsterCopy);
    
    setIsImportDialogOpen(false);
    toast.success(`Imported ${found.monster.Name} data`);
  };
  
  const onSubmit = async (data: Monster) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/monsters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create monster');
      }
      
      toast.success('Monster created successfully!');
      router.push('/monsters');
    } catch (error) {
      toastdiv className="flex gap-2">
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Import Monster</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Monster Data</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Select a monster to import its data. You can then modify it and save as a new monster.
                  </p>
                  <Select value={selectedMonsterId} onValueChange={setSelectedMonsterId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a monster" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMonsters.map(({ id, monster }) => (
                        <SelectItem key={id} value={id}>
                          {monster.Name} - CR {monster.Challenge}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleImportMonster} disabled={!selectedMonsterId}>
                      Import
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Link href="/monsters">
              <Button variant="outline">Back to Monsters</Button>
            </Link>
          </divtting(false);
    }
  };

  const handleFieldClick = (fieldId: string) => {
    // Call the global function that DynamicMonsterForm registers
    if ((window as any).__focusField) {
      (window as any).__focusField(fieldId);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Create New Monster</h2>
            <p className="text-muted-foreground mt-1">Add a new creature to your collection</p>
          </div>
          <Link href="/monsters">
            <Button variant="outline">Back to Monsters</Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preview Card */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <DndMonsterCard monster={formData} onFieldClick={handleFieldClick} />
          </div>

          {/* Form */}
          <div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <DynamicMonsterForm
                register={register}
                setValue={setValue}
                watch={watch}
                errors={errors}
              />
              
              <div className="flex justify-end gap-4 sticky bottom-4 bg-white p-4 rounded-lg shadow-lg border">
                <Link href="/monsters">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Monster'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
