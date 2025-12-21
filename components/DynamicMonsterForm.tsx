'use client';

import { useState, useRef, useEffect } from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { Monster } from '@/types/monster';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';

interface DynamicMonsterFormProps {
  register: UseFormRegister<Monster>;
  setValue: UseFormSetValue<Monster>;
  watch: UseFormWatch<Monster>;
  errors: FieldErrors<Monster>;
  onFieldFocus?: (fieldId: string) => void;
}

interface CollapsibleCardProps {
  id: string;
  title: string;
  children: React.ReactNode;
  badge?: number;
  expanded: boolean;
  onToggle: () => void;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

function CollapsibleCard({ id, title, children, badge, expanded, onToggle, actionButton }: CollapsibleCardProps) {
  return (
    <Card id={id}>
      <CardHeader
        className="cursor-pointer hover:bg-secondary/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CardTitle>{title}</CardTitle>
            {badge !== undefined && badge > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                {badge}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {actionButton && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  actionButton.onClick();
                }}
                className="flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                {actionButton.label}
              </Button>
            )}
            {expanded ? <ChevronUp /> : <ChevronDown />}
          </div>
        </div>
      </CardHeader>
      {expanded && <CardContent className="pt-4">{children}</CardContent>}
    </Card>
  );
}

export function DynamicMonsterForm({
  register,
  setValue,
  watch,
  errors,
  onFieldFocus,
}: DynamicMonsterFormProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    stats: true,
    abilities: true,
    details: false,
    saves: false,
    skills: false,
    traits: false,
    actions: false,
    reactions: false,
    legendary: false,
  });

  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  // Watch values for dynamic sections
  const saves = watch('Saves') || [];
  const skills = watch('Skills') || [];
  const traits = watch('Traits') || [];
  const actions = watch('Actions') || [];
  const reactions = watch('Reactions') || [];
  const legendaryActions = watch('LegendaryActions') || [];

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const registerField = (fieldId: string) => {
    return (el: HTMLElement | null) => {
      fieldRefs.current[fieldId] = el;
    };
  };

  useEffect(() => {
    if (onFieldFocus) {
      const windowWithFocus = window as Window & { __focusField?: (fieldId: string) => void };
      windowWithFocus.__focusField = (fieldId: string) => {
        const element = fieldRefs.current[fieldId];
        if (element) {
          // Expand parent section if collapsed
          const sectionMatch = fieldId.match(/^(Saves|Skills|Traits|Actions|Reactions|LegendaryActions)/);
          if (sectionMatch) {
            const section = sectionMatch[1].toLowerCase();
            setExpandedSections((prev) => ({ ...prev, [section]: true }));
          }

          // Scroll and focus
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
              element.focus();
            }
          }, 100);
        }
      };
    }
  }, [onFieldFocus]);

  const addSave = () => {
    setValue('Saves', [...saves, { Name: '', Modifier: 0 }]);
    setExpandedSections((prev) => ({ ...prev, saves: true }));
  };

  const removeSave = (index: number) => {
    setValue('Saves', saves.filter((_, i) => i !== index));
  };

  const addSkill = () => {
    setValue('Skills', [...skills, { Name: '', Modifier: 0 }]);
    setExpandedSections((prev) => ({ ...prev, skills: true }));
  };

  const removeSkill = (index: number) => {
    setValue('Skills', skills.filter((_, i) => i !== index));
  };

  const addTrait = () => {
    setValue('Traits', [...traits, { Name: '', Content: '', Usage: '' }]);
    setExpandedSections((prev) => ({ ...prev, traits: true }));
  };

  const removeTrait = (index: number) => {
    setValue('Traits', traits.filter((_, i) => i !== index));
  };

  const addAction = () => {
    setValue('Actions', [...actions, { Name: '', Content: '', Usage: '' }]);
    setExpandedSections((prev) => ({ ...prev, actions: true }));
  };

  const removeAction = (index: number) => {
    setValue('Actions', actions.filter((_, i) => i !== index));
  };

  const addReaction = () => {
    setValue('Reactions', [...reactions, { Name: '', Content: '', Usage: '' }]);
    setExpandedSections((prev) => ({ ...prev, reactions: true }));
  };

  const removeReaction = (index: number) => {
    setValue('Reactions', reactions.filter((_, i) => i !== index));
  };

  const addLegendaryAction = () => {
    setValue('LegendaryActions', [...legendaryActions, { Name: '', Content: '', Usage: '' }]);
    setExpandedSections((prev) => ({ ...prev, legendary: true }));
  };

  const removeLegendaryAction = (index: number) => {
    setValue('LegendaryActions', legendaryActions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Basic Info - Always expanded */}
      <CollapsibleCard 
        id="basic" 
        title="Basic Information"
        expanded={expandedSections.basic}
        onToggle={() => toggleSection('basic')}
      >
        <div className="space-y-4">
          <div ref={registerField('Name')}>
            <Label htmlFor="Name">Name *</Label>
            <Input id="Name" {...register('Name')} />
            {errors.Name && <p className="text-sm text-red-600 mt-1">{errors.Name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div ref={registerField('Type')}>
              <Label htmlFor="Type">Type *</Label>
              <Input id="Type" {...register('Type')} placeholder="e.g., Dragon, Humanoid" />
              {errors.Type && <p className="text-sm text-red-600 mt-1">{errors.Type.message}</p>}
            </div>

            <div ref={registerField('Challenge')}>
              <Label htmlFor="Challenge">Challenge Rating *</Label>
              <Input id="Challenge" {...register('Challenge')} placeholder="e.g., 5" />
              {errors.Challenge && (
                <p className="text-sm text-red-600 mt-1">{errors.Challenge.message}</p>
              )}
            </div>
          </div>

          <div ref={registerField('Source')}>
            <Label htmlFor="Source">Source</Label>
            <Input id="Source" {...register('Source')} placeholder="e.g., Monster Manual" />
          </div>

          <div ref={registerField('Description')}>
            <Label htmlFor="Description">Description</Label>
            <Textarea id="Description" {...register('Description')} rows={3} />
          </div>

          <div ref={registerField('ImageURL')}>
            <Label htmlFor="ImageURL">Image URL (optional)</Label>
            <Input
              id="ImageURL"
              {...register('ImageURL')}
              placeholder="https://example.com/monster-image.jpg"
            />
            {errors.ImageURL && (
              <p className="text-sm text-red-600 mt-1">{errors.ImageURL.message}</p>
            )}
          </div>
        </div>
      </CollapsibleCard>

      {/* Combat Stats */}
      <CollapsibleCard 
        id="stats" 
        title="Combat Stats"
        expanded={expandedSections.stats}
        onToggle={() => toggleSection('stats')}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div id="AC" ref={registerField('AC.Value')}>
              <Label htmlFor="AC.Value">Armor Class *</Label>
              <Input
                id="AC.Value"
                type="number"
                {...register('AC.Value', { valueAsNumber: true })}
              />
              {errors.AC?.Value && (
                <p className="text-sm text-red-600 mt-1">{errors.AC.Value.message}</p>
              )}
            </div>

            <div ref={registerField('AC.Notes')}>
              <Label htmlFor="AC.Notes">AC Notes</Label>
              <Input id="AC.Notes" {...register('AC.Notes')} placeholder="e.g., natural armor" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div id="HP" ref={registerField('HP.Value')}>
              <Label htmlFor="HP.Value">Hit Points *</Label>
              <Input
                id="HP.Value"
                type="number"
                {...register('HP.Value', { valueAsNumber: true })}
              />
              {errors.HP?.Value && (
                <p className="text-sm text-red-600 mt-1">{errors.HP.Value.message}</p>
              )}
            </div>

            <div ref={registerField('HP.Notes')}>
              <Label htmlFor="HP.Notes">HP Formula</Label>
              <Input id="HP.Notes" {...register('HP.Notes')} placeholder="e.g., 10d8+20" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div ref={registerField('InitiativeModifier')}>
              <Label htmlFor="InitiativeModifier">Initiative Modifier</Label>
              <Input
                id="InitiativeModifier"
                type="number"
                {...register('InitiativeModifier', { valueAsNumber: true })}
                defaultValue={0}
              />
            </div>

            <div className="flex items-center gap-2 pt-8" ref={registerField('InitiativeAdvantage')}>
              <Checkbox
                id="InitiativeAdvantage"
                checked={watch('InitiativeAdvantage')}
                onCheckedChange={(checked) => setValue('InitiativeAdvantage', !!checked)}
              />
              <Label htmlFor="InitiativeAdvantage" className="cursor-pointer">
                Initiative Advantage
              </Label>
            </div>
          </div>
        </div>
      </CollapsibleCard>

      {/* Ability Scores */}
      <CollapsibleCard 
        id="Abilities"
        title="Ability Scores"
        expanded={expandedSections.abilities}
        onToggle={() => toggleSection('abilities')}
      >
        <div className="grid grid-cols-3 gap-4">
          {['Str', 'Dex', 'Con', 'Int', 'Wis', 'Cha'].map((ability) => (
            <div key={ability} ref={registerField(`Abilities.${ability}`)}>
              <Label htmlFor={ability}>{ability.toUpperCase()} *</Label>
              <Input
                id={ability}
                type="number"
                {...register(`Abilities.${ability}` as `Abilities.${keyof Monster['Abilities']}`, { valueAsNumber: true })}
                defaultValue={10}
              />
            </div>
          ))}
        </div>
      </CollapsibleCard>

      {/* Additional Details */}
      <CollapsibleCard 
        id="details" 
        title="Additional Details"
        expanded={expandedSections.details}
        onToggle={() => toggleSection('details')}
      >
        <div className="space-y-4">
          <div ref={registerField('Speed')}>
            <Label htmlFor="Speed">Speed (comma-separated)</Label>
            <Input
              id="Speed"
              placeholder="e.g., 30 ft., fly 60 ft."
              onChange={(e) => {
                const speeds = e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean);
                setValue('Speed', speeds);
              }}
            />
          </div>

          <div ref={registerField('Senses')}>
            <Label htmlFor="Senses">Senses (comma-separated)</Label>
            <Input
              id="Senses"
              placeholder="e.g., darkvision 60 ft., passive Perception 12"
              onChange={(e) => {
                const senses = e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean);
                setValue('Senses', senses);
              }}
            />
          </div>

          <div ref={registerField('Languages')}>
            <Label htmlFor="Languages">Languages (comma-separated)</Label>
            <Input
              id="Languages"
              placeholder="e.g., Common, Draconic"
              onChange={(e) => {
                const languages = e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean);
                setValue('Languages', languages);
              }}
            />
          </div>

          <div ref={registerField('DamageVulnerabilities')}>
            <Label htmlFor="DamageVulnerabilities">Damage Vulnerabilities (comma-separated)</Label>
            <Input
              id="DamageVulnerabilities"
              placeholder="e.g., fire, cold"
              onChange={(e) => {
                const vulns = e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean);
                setValue('DamageVulnerabilities', vulns);
              }}
            />
          </div>

          <div ref={registerField('DamageResistances')}>
            <Label htmlFor="DamageResistances">Damage Resistances (comma-separated)</Label>
            <Input
              id="DamageResistances"
              placeholder="e.g., bludgeoning, piercing"
              onChange={(e) => {
                const resists = e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean);
                setValue('DamageResistances', resists);
              }}
            />
          </div>

          <div ref={registerField('DamageImmunities')}>
            <Label htmlFor="DamageImmunities">Damage Immunities (comma-separated)</Label>
            <Input
              id="DamageImmunities"
              placeholder="e.g., poison, psychic"
              onChange={(e) => {
                const immunities = e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean);
                setValue('DamageImmunities', immunities);
              }}
            />
          </div>

          <div ref={registerField('ConditionImmunities')}>
            <Label htmlFor="ConditionImmunities">Condition Immunities (comma-separated)</Label>
            <Input
              id="ConditionImmunities"
              placeholder="e.g., charmed, frightened"
              onChange={(e) => {
                const immunities = e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean);
                setValue('ConditionImmunities', immunities);
              }}
            />
          </div>
        </div>
      </CollapsibleCard>

      {/* Saving Throws */}
      <CollapsibleCard 
        id="Saves"
        title="Saving Throws"
        badge={saves.length}
        expanded={expandedSections.saves}
        onToggle={() => toggleSection('saves')}
        actionButton={{ label: 'Add', onClick: addSave }}
      >
        <div className="space-y-4">
          {saves.map((save, index) => (
            <div key={index} className="flex gap-4 items-end">
              <div className="flex-1" ref={registerField(`Saves.${index}.Name`)}>
                <Label>Ability</Label>
                <Input
                  {...register(`Saves.${index}.Name` as `Saves.${number}.Name`)}
                  placeholder="e.g., Dex, Wis"
                />
              </div>
              <div className="flex-1" ref={registerField(`Saves.${index}.Modifier`)}>
                <Label>Modifier</Label>
                <Input
                  type="number"
                  {...register(`Saves.${index}.Modifier` as `Saves.${number}.Modifier`, { valueAsNumber: true })}
                  placeholder="e.g., +5"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => removeSave(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CollapsibleCard>

      {/* Skills */}
      <CollapsibleCard 
        id="Skills"
        title="Skills"
        badge={skills.length}
        expanded={expandedSections.skills}
        onToggle={() => toggleSection('skills')}
        actionButton={{ label: 'Add', onClick: addSkill }}
      >
        <div className="space-y-4">
          {skills.map((skill, index) => (
            <div key={index} className="flex gap-4 items-end">
              <div className="flex-1" ref={registerField(`Skills.${index}.Name`)}>
                <Label>Skill</Label>
                <Input
                  {...register(`Skills.${index}.Name` as `Skills.${number}.Name`)}
                  placeholder="e.g., Perception, Stealth"
                />
              </div>
              <div className="flex-1" ref={registerField(`Skills.${index}.Modifier`)}>
                <Label>Modifier</Label>
                <Input
                  type="number"
                  {...register(`Skills.${index}.Modifier` as `Skills.${number}.Modifier`, { valueAsNumber: true })}
                  placeholder="e.g., +5"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => removeSkill(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CollapsibleCard>

      {/* Traits */}
      <CollapsibleCard 
        id="Traits"
        title="Traits"
        badge={traits.length}
        expanded={expandedSections.traits}
        onToggle={() => toggleSection('traits')}
        actionButton={{ label: 'Add', onClick: addTrait }}
      >
        <div className="space-y-4">
          {traits.map((trait, index) => (
            <div key={index} className="border p-4 rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-4">
                  <div ref={registerField(`Traits.${index}.Name`)}>
                    <Label>Trait Name</Label>
                    <Input {...register(`Traits.${index}.Name` as `Traits.${number}.Name`)} placeholder="e.g., Pack Tactics" />
                  </div>
                  <div ref={registerField(`Traits.${index}.Usage`)}>
                    <Label>Usage (optional)</Label>
                    <Input
                      {...register(`Traits.${index}.Usage` as `Traits.${number}.Usage`)}
                      placeholder="e.g., Recharge 5-6"
                    />
                  </div>
                  <div ref={registerField(`Traits.${index}.Content`)}>
                    <Label>Description</Label>
                    <Textarea {...register(`Traits.${index}.Content` as `Traits.${number}.Content`)} rows={3} />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeTrait(index)}
                  className="ml-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleCard>

      {/* Actions */}
      <CollapsibleCard 
        id="Actions"
        title="Actions"
        badge={actions.length}
        expanded={expandedSections.actions}
        onToggle={() => toggleSection('actions')}
        actionButton={{ label: 'Add', onClick: addAction }}
      >
        <div className="space-y-4">
          {actions.map((action, index) => (
            <div key={index} className="border border-border p-4 rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-4">
                  <div ref={registerField(`Actions.${index}.Name`)}>
                    <Label>Action Name</Label>
                    <Input {...register(`Actions.${index}.Name` as `Actions.${number}.Name`)} placeholder="e.g., Multiattack" />
                  </div>
                  <div ref={registerField(`Actions.${index}.Usage`)}>
                    <Label>Usage (optional)</Label>
                    <Input
                      {...register(`Actions.${index}.Usage` as `Actions.${number}.Usage`)}
                      placeholder="e.g., Recharge 5-6"
                    />
                  </div>
                  <div ref={registerField(`Actions.${index}.Content`)}>
                    <Label>Description</Label>
                    <Textarea {...register(`Actions.${index}.Content` as `Actions.${number}.Content`)} rows={3} />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeAction(index)}
                  className="ml-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleCard>

      {/* Reactions */}
      <CollapsibleCard 
        id="Reactions"
        title="Reactions"
        badge={reactions.length}
        expanded={expandedSections.reactions}
        onToggle={() => toggleSection('reactions')}
        actionButton={{ label: 'Add', onClick: addReaction }}
      >
        <div className="space-y-4">
          {reactions.map((reaction, index) => (
            <div key={index} className="border p-4 rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-4">
                  <div ref={registerField(`Reactions.${index}.Name`)}>
                    <Label>Reaction Name</Label>
                    <Input {...register(`Reactions.${index}.Name` as `Reactions.${number}.Name`)} placeholder="e.g., Parry" />
                  </div>
                  <div ref={registerField(`Reactions.${index}.Usage`)}>
                    <Label>Usage (optional)</Label>
                    <Input {...register(`Reactions.${index}.Usage` as `Reactions.${number}.Usage`)} placeholder="e.g., 1/Turn" />
                  </div>
                  <div ref={registerField(`Reactions.${index}.Content`)}>
                    <Label>Description</Label>
                    <Textarea {...register(`Reactions.${index}.Content` as `Reactions.${number}.Content`)} rows={3} />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeReaction(index)}
                  className="ml-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleCard>

      {/* Legendary Actions */}
      <CollapsibleCard 
        id="LegendaryActions"
        title="Legendary Actions"
        badge={legendaryActions.length}
        expanded={expandedSections.legendary}
        onToggle={() => toggleSection('legendary')}
        actionButton={{ label: 'Add', onClick: addLegendaryAction }}
      >
        <div className="space-y-4">
          {legendaryActions.map((action, index) => (
            <div key={index} className="border p-4 rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-4">
                  <div ref={registerField(`LegendaryActions.${index}.Name`)}>
                    <Label>Action Name</Label>
                    <Input
                      {...register(`LegendaryActions.${index}.Name` as `LegendaryActions.${number}.Name`)}
                      placeholder="e.g., Wing Attack"
                    />
                  </div>
                  <div ref={registerField(`LegendaryActions.${index}.Usage`)}>
                    <Label>Cost (optional)</Label>
                    <Input
                      {...register(`LegendaryActions.${index}.Usage` as `LegendaryActions.${number}.Usage`)}
                      placeholder="e.g., Costs 2 Actions"
                    />
                  </div>
                  <div ref={registerField(`LegendaryActions.${index}.Content`)}>
                    <Label>Description</Label>
                    <Textarea {...register(`LegendaryActions.${index}.Content` as `LegendaryActions.${number}.Content`)} rows={3} />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeLegendaryAction(index)}
                  className="ml-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleCard>
    </div>
  );
}
