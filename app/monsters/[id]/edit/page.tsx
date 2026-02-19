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
import type { FeatureWithId, FeatureCategory } from '@/types/feature';
import type { MonsterFeature } from '@/components/form/MonsterFeatureDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function EditMonsterPage() {
  const router = useRouter();
  const params = useParams();
  const monsterId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [features, setFeatures] = useState<FeatureWithId[]>([]);
  const [availableFeatures, setAvailableFeatures] = useState<FeatureWithId[]>([]);

  // Scope-conflict dialog state
  const [scopeDialog, setScopeDialog] = useState<{
    open: boolean;
    featureId: string;
    category: FeatureCategory;
    feature: MonsterFeature;
    monsterCount: number;
  } | null>(null);

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

  // Load monster data + its features
  useEffect(() => {
    async function loadMonster() {
      try {
        const response = await fetch(`/api/monsters/${monsterId}`);

        if (response.status === 401) { router.push('/login'); return; }
        if (response.status === 404) { toast.error('Monster not found'); router.push('/monsters'); return; }
        if (!response.ok) throw new Error('Failed to fetch monster');

        const data = await response.json();
        reset(data.monster);

        // Load features from FeatureIds
        const featureIds: string[] = data.monster.FeatureIds || [];
        if (featureIds.length > 0) {
          const results = await Promise.all(
            featureIds.map((id: string) =>
              fetch(`/api/features/${id}`)
                .then(r => r.ok ? r.json() : null)
            )
          );
          setFeatures(
            results
              .filter(Boolean)
              .map((r: { feature: FeatureWithId }) => r.feature)
          );
        }
      } catch (error) {
        console.error('Error fetching monster:', error);
        toast.error('Failed to load monster');
        router.push('/monsters');
      } finally {
        setLoading(false);
      }
    }

    if (monsterId) loadMonster();
  }, [monsterId, router, reset]);

  // Load available features library
  useEffect(() => {
    fetch('/api/features')
      .then(res => res.json())
      .then(data => setAvailableFeatures(data.features || []))
      .catch(err => console.error('Failed to load features:', err));
  }, []);

  // ---- Feature callbacks ----
  const handleAddFeature = async (category: FeatureCategory, feature: MonsterFeature) => {
    try {
      const res = await fetch('/api/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...feature, Category: category }),
      });
      const created: FeatureWithId = await res.json();
      setFeatures(prev => [...prev, created]);
      setAvailableFeatures(prev => [...prev, created]);
    } catch {
      toast.error('Failed to add feature');
    }
  };

  const handleEditFeature = async (featureId: string, category: FeatureCategory, feature: MonsterFeature) => {
    try {
      const infoRes = await fetch(`/api/features/${featureId}`);
      const { monsterCount } = await infoRes.json() as { monsterCount: number; feature: FeatureWithId };
      if (monsterCount > 1) {
        setScopeDialog({ open: true, featureId, category, feature, monsterCount });
      } else {
        await applyFeatureEdit(featureId, category, feature, 'all');
      }
    } catch {
      toast.error('Failed to update feature');
    }
  };

  const applyFeatureEdit = async (
    featureId: string,
    category: FeatureCategory,
    feature: MonsterFeature,
    scope: 'all' | 'this'
  ) => {
    const res = await fetch(`/api/features/${featureId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feature: { ...feature, Category: category }, scope, monsterId }),
    });
    const result = await res.json();
    const updatedId = result.newFeatureId as string;
    const updatedFeature: FeatureWithId = { ...feature, Category: category, id: updatedId };
    setFeatures(prev =>
      prev.map(f => (f.id === featureId ? updatedFeature : f))
    );
    setAvailableFeatures(prev =>
      prev.map(f => (f.id === featureId ? updatedFeature : f))
    );
    toast.success('Feature updated');
  };

  const handleRemoveFeature = (featureId: string) => {
    setFeatures(prev => prev.filter(f => f.id !== featureId));
  };

  const buildEmbeddedArrays = (feats: FeatureWithId[]) => ({
    Traits: feats.filter(f => f.Category === 'Traits').map(({ Name, Content, Usage }) => Usage ? { Name, Content, Usage } : { Name, Content }),
    Actions: feats.filter(f => f.Category === 'Actions').map(({ Name, Content, Usage }) => Usage ? { Name, Content, Usage } : { Name, Content }),
    Reactions: feats.filter(f => f.Category === 'Reactions').map(({ Name, Content, Usage }) => Usage ? { Name, Content, Usage } : { Name, Content }),
    LegendaryActions: feats.filter(f => f.Category === 'LegendaryActions').map(({ Name, Content, Usage }) => Usage ? { Name, Content, Usage } : { Name, Content }),
  });

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
      'Traits': 'MonsterFeatures',
      'Actions': 'MonsterFeatures',
      'Reactions': 'MonsterFeatures',
      'LegendaryActions': 'MonsterFeatures',
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
      const monsterData = {
        ...data,
        FeatureIds: features.map(f => f.id),
        ...buildEmbeddedArrays(features),
      };

      const response = await fetch(`/api/monsters/${monsterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(monsterData),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.details && Array.isArray(error.details)) {
          error.details.forEach((detail: { path: string[]; message: string }) => {
            const fieldPath = detail.path.join('.');
            setError(fieldPath as keyof Monster, { type: 'server', message: detail.message });
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
      <div className="bg-background flex items-center justify-center" style={{ minHeight: 'calc(100vh - var(--app-header-height))' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading monster...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">Edit Monster</h2>
          <p className="text-muted-foreground mt-1">Update your monster details</p>
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
              <Link href="/monsters">
                <Button variant="outline">Back to Monsters</Button>
              </Link>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData, null, 2));
                  const dlAnchor = document.createElement('a');
                  dlAnchor.setAttribute("href", dataStr);
                  dlAnchor.setAttribute("download", `${formData.Name || 'monster'}.json`);
                  document.body.appendChild(dlAnchor);
                  dlAnchor.click();
                  dlAnchor.remove();
                }}
              >
                Download Monster
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit, (errors) => {
                console.error('Form validation errors:', errors);
                toast.error('Please fix validation errors before submitting');
              })}
              onKeyDown={e => {
                // Prevent Enter from submitting unless in textarea or button
                if (e.key === 'Enter') {
                  const target = e.target as HTMLElement;
                  if (
                    target.tagName !== 'TEXTAREA' &&
                    target.tagName !== 'BUTTON' &&
                    !(target as HTMLInputElement).type?.toLowerCase().includes('submit')
                  ) {
                    e.preventDefault();
                  }
                }
              }}
              className="space-y-6"
            >
              <DynamicMonsterForm
                register={register}
                setValue={setValue}
                watch={watch}
                errors={errors}
                onFieldFocus={handleFieldClick}
                features={features}
                onAddFeature={handleAddFeature}
                onEditFeature={handleEditFeature}
                onRemoveFeature={handleRemoveFeature}
                availableFeatures={availableFeatures}
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

      {/* Feature scope conflict dialog */}
      {scopeDialog && (
        <Dialog open={scopeDialog.open} onOpenChange={(open) => !open && setScopeDialog(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Update Feature</DialogTitle>
              <DialogDescription>
                This feature is used by <strong>{scopeDialog.monsterCount}</strong> monsters. How would you like to apply the changes?
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 pt-2">
              <Button
                onClick={async () => {
                  setScopeDialog(null);
                  await applyFeatureEdit(scopeDialog.featureId, scopeDialog.category, scopeDialog.feature, 'all');
                }}
              >
                Update all {scopeDialog.monsterCount} monsters
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  setScopeDialog(null);
                  await applyFeatureEdit(scopeDialog.featureId, scopeDialog.category, scopeDialog.feature, 'this');
                }}
              >
                Only this monster
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}