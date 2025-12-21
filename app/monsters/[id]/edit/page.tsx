'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { monsterSchema, type Monster } from '@/types/monster';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DynamicMonsterForm } from '@/components/DynamicMonsterForm';
import { toast } from 'sonner';
import Link from 'next/link';
import MonsterStatBlock from '@/components/MonsterStatBlock';

export default function EditMonsterPage() {
  const router = useRouter();
  const params = useParams();
  const monsterId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

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

  // Load monster data
  useEffect(() => {
    async function loadMonster() {
      try {
        const response = await fetch(`/api/monsters/${monsterId}`);

        if (response.status === 401) {
          router.push('/login');
          return;
        }

        if (response.status === 404) {
          toast.error('Monster not found');
          router.push('/monsters');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch monster');
        }

        const data = await response.json();
        reset(data.monster);
      } catch (error) {
        console.error('Error fetching monster:', error);
        toast.error('Failed to load monster');
        router.push('/monsters');
      } finally {
        setLoading(false);
      }
    }

    if (monsterId) {
      loadMonster();
    }
  }, [monsterId, router, reset]);

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
      const response = await fetch(`/api/monsters/${monsterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Server error:', error);
        
        // Mark invalid fields from server validation
        if (error.details && Array.isArray(error.details)) {
          error.details.forEach((detail: { path: string[]; message: string }) => {
            const fieldPath = detail.path.join('.');
            setError(fieldPath as keyof Monster, {
              type: 'server',
              message: detail.message,
            });
          });
          
          toast.error('Please fix the validation errors highlighted in the form');
          setIsSubmitting(false);
          return;
        }
        
        throw new Error(error.error || 'Failed to update monster');
      }

      toast.success('Monster updated successfully!');
      router.push('/monsters');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update monster');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading monster...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">Edit Monster</h2>
          <p className="text-muted-foreground mt-1">Update your monster details</p>
        </div>

        {/* Monster Preview Card */}
        <div className="mb-8 flex justify-center">
          <MonsterStatBlock monster={formData} onFieldClick={handleFieldClick} />
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex gap-2">
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
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
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