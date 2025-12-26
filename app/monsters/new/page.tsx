'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { monsterSchema, type Monster } from '@/types/monster';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DynamicMonsterForm } from '@/components/DynamicMonsterForm';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MonsterSearch } from '@/components/MonsterSearch';
import { toast } from 'sonner';
import Link from 'next/link';
import MonsterStatBlock from '@/components/MonsterStatBlock';

export default function NewMonsterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableMonsters, setAvailableMonsters] = useState<Array<{ id: string; monster: Monster }>>([]);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importedMonster, setImportedMonster] = useState<Monster | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    setError,
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
      SearchTags: [],
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

  // Apply imported monster data when it changes
  useEffect(() => {
    if (importedMonster) {
      reset(importedMonster);
    }
  }, [importedMonster, reset]);

  // Load available monsters for importing
  useEffect(() => {
    fetch('/api/monsters')
      .then(res => res.json())
      .then(data => setAvailableMonsters(data.monsters || []))
      .catch(err => console.error('Failed to load monsters:', err));
  }, []);

  const handleImportMonster = (monsterId: string) => {
    const found = availableMonsters.find(m => m.id === monsterId);
    if (!found) return;

    // Set imported monster data
    const monsterCopy = { ...found.monster };
    delete (monsterCopy as any).id;
    setImportedMonster(monsterCopy);
    
    setIsImportDialogOpen(false);
    toast.success(`Imported ${found.monster.Name} data`);
  };

  const handleFieldClick = (fieldId: string) => {
    console.log('🎯 Field clicked:', fieldId);
    
    // Map fields to their parent sections
    const fieldToSection: Record<string, string> = {
      'Name': 'basic',
      'Type': 'basic',
      'Challenge': 'basic',
      'Source': 'basic',
      'Description': 'basic',
      'ImageURL': 'basic',
      'AC': 'stats',
      'HP': 'stats',
      'InitiativeModifier': 'stats',
      'InitiativeAdvantage': 'stats',
      'Abilities': 'Abilities',
      'Speed': 'details',
      'Senses': 'details',
      'Languages': 'details',
      'DamageVulnerabilities': 'details',
      'DamageResistances': 'details',
      'DamageImmunities': 'details',
      'ConditionImmunities': 'details',
      'Saves': 'Saves',
      'Skills': 'Skills',
      'Traits': 'Traits',
      'Actions': 'Actions',
      'Reactions': 'Reactions',
      'LegendaryActions': 'LegendaryActions',
    };

    const parentSection = fieldToSection[fieldId];
    console.log('📂 Parent section:', parentSection);

    // First, try to find and click the parent section header to expand it (only if collapsed)
    if (parentSection) {
      const sectionCard = document.getElementById(parentSection);
      if (sectionCard) {
        // Check if section is already expanded by looking for CardContent
        const isExpanded = sectionCard.querySelector('[data-slot="card-content"]') !== null;
        
        if (!isExpanded) {
          // Find the header and click it to expand
          const header = sectionCard.querySelector('[role="button"], .cursor-pointer');
          if (header instanceof HTMLElement) {
            console.log('🔓 Expanding section:', parentSection);
            header.click();
          }
        } else {
          console.log('✓ Section already expanded:', parentSection);
        }
      }
    }
    
    // Wait for section to expand and render, then scroll to field
    setTimeout(() => {
      const element = document.getElementById(fieldId);
      console.log('📍 Found element:', element);
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // For input elements, focus directly
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
          element.focus();
          console.log('✅ Focused input directly');
        } else {
          // For containers, find the first focusable input
          const input = element.querySelector('input, textarea, select');
          console.log('⌨️ Found input inside container:', input);
          
          if (input instanceof HTMLElement) {
            input.focus();
            console.log('✅ Focused input successfully');
          } else {
            console.log('❌ No focusable input found');
          }
        }
      } else {
        console.log('❌ Element not found with ID:', fieldId);
      }
    }, 300);
  };
  
  const onSubmit = async (data: Monster) => {
    setIsSubmitting(true);
    
    try {
      console.log('Submitting monster data:', data);
      
      const response = await fetch('/api/monsters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Server error:', error);
        
        // Mark invalid fields from server validation
        if (error.details && Array.isArray(error.details)) {
          error.details.forEach((detail: any) => {
            const fieldPath = detail.path.join('.');
            setError(fieldPath as any, {
              type: 'server',
              message: detail.message,
            });
          });
          
          toast.error('Please fix the validation errors highlighted in the form');
          setIsSubmitting(false);
          return;
        }
        
        throw new Error(error.error || 'Failed to create monster');
      }
      
      toast.success('Monster created successfully!');
      router.push('/monsters');
    } catch (error) {
      console.error('Create monster error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create monster');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">Create New Monster</h2>
          <p className="text-muted-foreground mt-1">Add a new monster to your collection</p>
        </div>

        {/* Monster Preview Card */}
        <div className="mb-2 flex justify-center">
          <MonsterStatBlock monster={formData} onFieldClick={handleFieldClick} />
        </div>
        <p className="text-center text-sm text-muted-foreground mb-8 flex items-center justify-center gap-2">
          <span className="inline-block">💡</span>
          <span>Tip: Click any field in the preview card to jump to its input below</span>
        </p>

        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex gap-2">
              <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Import Monster</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Import Monster Data</DialogTitle>
                    <DialogDescription>
                      Select a monster to import its data. You can then modify it and save as a new monster.
                    </DialogDescription>
                  </DialogHeader>
                  <MonsterSearch
                    availableMonsters={availableMonsters}
                    onSelectMonster={handleImportMonster}
                    emptyMessage="No monsters available."
                    emptyActionLink={{ href: '/monsters', label: 'Go to monsters list' }}
                  />
                </DialogContent>
              </Dialog>
              <label htmlFor="monster-upload-json" className="sr-only">Upload Monster</label>
              <input
                id="monster-upload-json"
                type="file"
                accept="application/json"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const text = await file.text();
                    const json = JSON.parse(text);
                    reset(json);
                    toast.success('Monster loaded from file!');
                  } catch (err) {
                    toast.error('Invalid monster JSON file');
                  }
                  e.target.value = '';
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('monster-upload-json')?.click()}
              >
                Upload Monster
              </Button>
              <Link href="/monsters">
                <Button variant="outline">Back to Monsters</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit, (errors) => {
              console.error('Form validation errors:', errors);
              toast.error('Please fix validation errors before submitting');
            })} className="space-y-6">
              <DynamicMonsterForm
                register={register}
                setValue={setValue}
                watch={watch}
                errors={errors}
                onFieldFocus={handleFieldClick}
              />
              <div className="flex gap-4 pt-4 border-t">
                <Button type="submit" disabled={isSubmitting} variant="outline" className="flex-1">
                  {isSubmitting ? 'Creating...' : 'Create Monster'}
                </Button>
                <Link href="/monsters">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
