'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { monsterSchema, type Monster } from '@/types/monster';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Link from 'next/link';
import MonsterStatBlock from '@/components/MonsterStatBlock';

export default function EditMonsterPage() {
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const monsterId = params.id as string;

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
    },
  });

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
        reset(data.monster); // Populate form with existing data
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
        throw new Error(error.error || 'Failed to update monster');
      }

      toast.success('Monster updated successfully!');
      router.push(`/monsters/${monsterId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update monster');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions for array fields
  const addToArray = (field: keyof Monster, value: string) => {
    const current = watch(field) as string[];
    if (value && !current.includes(value)) {
      setValue(field, [...current, value]);
    }
  };

  const removeFromArray = (field: keyof Monster, index: number) => {
    const current = watch(field) as string[];
    setValue(field, current.filter((_, i) => i !== index));
  };

  const addAction = () => {
    const current = watch('Actions');
    setValue('Actions', [...current, { Name: '', Content: '', Usage: '' }]);
  };

  const removeAction = (index: number) => {
    const current = watch('Actions');
    setValue('Actions', current.filter((_, i) => i !== index));
  };

  const handleFieldClick = (fieldId: string) => {
    setFocusedField(fieldId);
    
    // Map field IDs to actual DOM element IDs (some are CollapsibleCard IDs)
    const elementId = fieldId;
    
    // Scroll to the field
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Try to focus the first input/textarea within the element
        const input = element.querySelector('input, textarea, select');
        if (input instanceof HTMLElement) {
          input.focus();
        }
      }
    }, 100);
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6 p-4 bg-card border border-border rounded-lg">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Edit Monster</h2>
            <p className="text-muted-foreground mt-1">Preview updates as you type</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
            <Link href={`/monsters/${monsterId}`}>
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </div>

        {/* Live Preview */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-foreground mb-4">Live Preview</h3>
          <div className="flex justify-center">
            <MonsterStatBlock 
              monster={watch()} 
              showColumnToggle={true}
              onFieldClick={handleFieldClick}
            />
          </div>
        </div>

        {/* Edit Form */}
        <div className="border-t-2 border-gray-300 pt-8">
          <h3 className="text-xl font-bold text-foreground mb-6">Edit Details</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="Name">Name</Label>
                  <Input
                    id="Name"
                    {...register('Name')}
                    placeholder="Monster name"
                    className={focusedField === 'Name' ? 'ring-2 ring-blue-500' : ''}
                  />
                  {errors.Name && (
                    <p className="text-sm text-red-600">{errors.Name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="Type">Type</Label>
                  <Input
                    id="type"
                    {...register('Type')}
                    placeholder="e.g., humanoid, beast, undead"
                  />
                  {errors.Type && (
                    <p className="text-sm text-red-600">{errors.Type.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="challenge">Challenge Rating</Label>
                  <Input
                    id="challenge"
                    {...register('Challenge')}
                    placeholder="e.g., 1/2, 1, 2"
                  />
                  {errors.Challenge && (
                    <p className="text-sm text-red-600">{errors.Challenge.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="source">Source</Label>
                  <Input
                    id="source"
                    {...register('Source')}
                    placeholder="e.g., Monster Manual, Homebrew"
                  />
                  {errors.Source && (
                    <p className="text-sm text-red-600">{errors.Source.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Combat Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Combat Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ac">Armor Class</Label>
                  <Input
                    id="ac"
                    type="number"
                    {...register('AC.Value', { valueAsNumber: true })}
                  />
                  {errors.AC?.Value && (
                    <p className="text-sm text-red-600">{errors.AC.Value.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="acNotes">AC Notes</Label>
                  <Input
                    id="acNotes"
                    {...register('AC.Notes')}
                    placeholder="e.g., natural armor, chain mail"
                  />
                </div>
                <div>
                  <Label htmlFor="hp">Hit Points</Label>
                  <Input
                    id="hp"
                    type="number"
                    {...register('HP.Value', { valueAsNumber: true })}
                  />
                  {errors.HP?.Value && (
                    <p className="text-sm text-red-600">{errors.HP.Value.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="hpNotes">HP Notes</Label>
                  <Input
                    id="hpNotes"
                    {...register('HP.Notes')}
                    placeholder="e.g., 3d8 + 3"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ability Scores */}
          <Card>
            <CardHeader>
              <CardTitle>Ability Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {(['Str', 'Dex', 'Con', 'Int', 'Wis', 'Cha'] as const).map((ability) => (
                  <div key={ability}>
                    <Label htmlFor={ability}>{ability}</Label>
                    <Input
                      id={ability}
                      type="number"
                      min="1"
                      max="30"
                      {...register(`Abilities.${ability}`, { valueAsNumber: true })}
                    />
                    {errors.Abilities?.[ability] && (
                      <p className="text-sm text-red-600">{errors.Abilities[ability]?.message}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Image URL */}
          <Card>
            <CardHeader>
              <CardTitle>Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="imageURL">Image URL</Label>
                <Input
                  id="imageURL"
                  {...register('ImageURL')}
                  placeholder="https://example.com/monster-image.jpg"
                />
                {errors.ImageURL && (
                  <p className="text-sm text-red-600">{errors.ImageURL.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Initiative */}
          <Card>
            <CardHeader>
              <CardTitle>Initiative</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="initiativeModifier">Initiative Modifier</Label>
                  <Input
                    id="initiativeModifier"
                    type="number"
                    {...register('InitiativeModifier', { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <Label htmlFor="initiativeAdvantage">Initiative Advantage</Label>
                  <Select
                    value={watch('InitiativeAdvantage') ? 'true' : 'false'}
                    onValueChange={(value) => setValue('InitiativeAdvantage', value === 'true')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No advantage</SelectItem>
                      <SelectItem value="true">Has advantage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                {...register('Description')}
                placeholder="Optional description or flavor text"
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Array Fields */}
          {[
            { key: 'Speed' as const, label: 'Speed', placeholder: 'e.g., 30 ft., fly 60 ft.' },
            { key: 'Senses' as const, label: 'Senses', placeholder: 'e.g., darkvision 60 ft., passive Perception 12' },
            { key: 'Languages' as const, label: 'Languages', placeholder: 'e.g., Common, Elvish' },
            { key: 'DamageVulnerabilities' as const, label: 'Damage Vulnerabilities', placeholder: 'e.g., fire, lightning' },
            { key: 'DamageResistances' as const, label: 'Damage Resistances', placeholder: 'e.g., poison, psychic' },
            { key: 'DamageImmunities' as const, label: 'Damage Immunities', placeholder: 'e.g., poison, necrotic' },
            { key: 'ConditionImmunities' as const, label: 'Condition Immunities', placeholder: 'e.g., poisoned, charmed' },
          ].map(({ key, label, placeholder }) => (
            <Card key={key}>
              <CardHeader>
                <CardTitle>{label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder={placeholder}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const target = e.target as HTMLInputElement;
                        addToArray(key, target.value);
                        target.value = '';
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.querySelector(`input[placeholder="${placeholder}"]`) as HTMLInputElement;
                      if (input?.value) {
                        addToArray(key, input.value);
                        input.value = '';
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(watch(key) as string[]).map((item, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeFromArray(key, index)}>
                      {item} ×
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {watch('Skills').map((_, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div>
                    <Label>Skill Name</Label>
                    <Input {...register(`Skills.${index}.Name`)} placeholder="e.g., Stealth" />
                  </div>
                  <div>
                    <Label>Modifier</Label>
                    <Input
                      type="number"
                      {...register(`Skills.${index}.Modifier`, { valueAsNumber: true })}
                      placeholder="3"
                    />
                  </div>
                  <Button type="button" variant="outline" onClick={() => {
                    const current = watch('Skills');
                    setValue('Skills', current.filter((_, i) => i !== index));
                  }}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => {
                const current = watch('Skills');
                setValue('Skills', [...current, { Name: '', Modifier: 0 }]);
              }}>
                Add Skill
              </Button>
            </CardContent>
          </Card>

          {/* Saving Throws */}
          <Card>
            <CardHeader>
              <CardTitle>Saving Throws</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {watch('Saves').map((_, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div>
                    <Label>Ability</Label>
                    <Input {...register(`Saves.${index}.Name`)} placeholder="e.g., Str" />
                  </div>
                  <div>
                    <Label>Modifier</Label>
                    <Input
                      type="number"
                      {...register(`Saves.${index}.Modifier`, { valueAsNumber: true })}
                      placeholder="3"
                    />
                  </div>
                  <Button type="button" variant="outline" onClick={() => {
                    const current = watch('Saves');
                    setValue('Saves', current.filter((_, i) => i !== index));
                  }}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => {
                const current = watch('Saves');
                setValue('Saves', [...current, { Name: '', Modifier: 0 }]);
              }}>
                Add Save
              </Button>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {watch('Actions').map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label>Action Name</Label>
                      <Input {...register(`Actions.${index}.Name`)} placeholder="e.g., Sword Attack" />
                    </div>
                    <Button type="button" variant="outline" onClick={() => removeAction(index)}>
                      Remove
                    </Button>
                  </div>
                  <div>
                    <Label>Content</Label>
                    <Textarea {...register(`Actions.${index}.Content`)} placeholder="Action description" />
                  </div>
                  <div>
                    <Label>Usage (optional)</Label>
                    <Input {...register(`Actions.${index}.Usage`)} placeholder="e.g., Recharge 5-6" />
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addAction}>
                Add Action
              </Button>
            </CardContent>
          </Card>

          {/* Traits */}
          <Card>
            <CardHeader>
              <CardTitle>Traits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {watch('Traits').map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label>Trait Name</Label>
                      <Input {...register(`Traits.${index}.Name`)} placeholder="e.g., Amphibious" />
                    </div>
                    <Button type="button" variant="outline" onClick={() => {
                      const current = watch('Traits');
                      setValue('Traits', current.filter((_, i) => i !== index));
                    }}>
                      Remove
                    </Button>
                  </div>
                  <div>
                    <Label>Content</Label>
                    <Textarea {...register(`Traits.${index}.Content`)} placeholder="Trait description" />
                  </div>
                  <div>
                    <Label>Usage (optional)</Label>
                    <Input {...register(`Traits.${index}.Usage`)} placeholder="e.g., 3/Day" />
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => {
                const current = watch('Traits');
                setValue('Traits', [...current, { Name: '', Content: '', Usage: '' }]);
              }}>
                Add Trait
              </Button>
            </CardContent>
          </Card>

          {/* Reactions */}
          <Card>
            <CardHeader>
              <CardTitle>Reactions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {watch('Reactions').map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label>Reaction Name</Label>
                      <Input {...register(`Reactions.${index}.Name`)} placeholder="e.g., Parry" />
                    </div>
                    <Button type="button" variant="outline" onClick={() => {
                      const current = watch('Reactions');
                      setValue('Reactions', current.filter((_, i) => i !== index));
                    }}>
                      Remove
                    </Button>
                  </div>
                  <div>
                    <Label>Content</Label>
                    <Textarea {...register(`Reactions.${index}.Content`)} placeholder="Reaction description" />
                  </div>
                  <div>
                    <Label>Usage (optional)</Label>
                    <Input {...register(`Reactions.${index}.Usage`)} placeholder="e.g., 1/Turn" />
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => {
                const current = watch('Reactions');
                setValue('Reactions', [...current, { Name: '', Content: '', Usage: '' }]);
              }}>
                Add Reaction
              </Button>
            </CardContent>
          </Card>

          {/* Legendary Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Legendary Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {watch('LegendaryActions').map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label>Legendary Action Name</Label>
                      <Input {...register(`LegendaryActions.${index}.Name`)} placeholder="e.g., Cast a Spell" />
                    </div>
                    <Button type="button" variant="outline" onClick={() => {
                      const current = watch('LegendaryActions');
                      setValue('LegendaryActions', current.filter((_, i) => i !== index));
                    }}>
                      Remove
                    </Button>
                  </div>
                  <div>
                    <Label>Content</Label>
                    <Textarea {...register(`LegendaryActions.${index}.Content`)} placeholder="Legendary action description" />
                  </div>
                  <div>
                    <Label>Usage (optional)</Label>
                    <Input {...register(`LegendaryActions.${index}.Usage`)} placeholder="e.g., Costs 2 actions" />
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => {
                const current = watch('LegendaryActions');
                setValue('LegendaryActions', [...current, { Name: '', Content: '', Usage: '' }]);
              }}>
                Add Legendary Action
              </Button>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4 sticky bottom-0 bg-gray-50 py-4 border-t-2 border-gray-200">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Updating...' : 'Save Changes'}
            </Button>
            <Link href={`/monsters/${monsterId}`}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
        </div>
      </main>
    </div>
  );
}