'use client';

import { useState, useRef, useEffect } from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { Monster } from '@/types/monster';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2 } from 'lucide-react';
import { FieldWithError } from '@/components/form/FieldWithError';
import { TagInput } from '@/components/ui/TagInput';
import { CollapsibleCard } from '@/components/form/CollapsibleCard';
import { handleDynamicField, handleCommaSeparatedChange } from '@/lib/formHelpers';

interface DynamicMonsterFormProps {
  register: UseFormRegister<Monster>;
  setValue: UseFormSetValue<Monster>;
  watch: UseFormWatch<Monster>;
  errors: FieldErrors<Monster>;
  onFieldFocus?: (fieldId: string) => void;
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

  // Expand section if any field inside has an error
  useEffect(() => {
    const errorSectionMap: Record<string, boolean> = {
      basic: !!(errors.Name || errors.Type || errors.Challenge || errors.ImageURL),
      stats: !!(errors.AC?.Value || errors.HP?.Value),
      abilities: false,
      details: !!(errors.Speed || errors.Senses || errors.Languages || errors.DamageVulnerabilities || errors.DamageResistances || errors.DamageImmunities || errors.ConditionImmunities),
      saves: Array.isArray(errors.Saves) && errors.Saves.some(e => e),
      skills: Array.isArray(errors.Skills) && errors.Skills.some(e => e),
      traits: Array.isArray(errors.Traits) && errors.Traits.some(e => e),
      actions: Array.isArray(errors.Actions) && errors.Actions.some(e => e),
      reactions: Array.isArray(errors.Reactions) && errors.Reactions.some(e => e),
      legendary: Array.isArray(errors.LegendaryActions) && errors.LegendaryActions.some(e => e),
    };
    for (const section in errorSectionMap) {
      if (errorSectionMap[section] && !expandedSections[section]) {
        setExpandedSections(prev => ({ ...prev, [section]: true }));
      }
    }
  }, [errors]);

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


  // Helper for add/remove
  const handleAdd = (type: any) => {
    handleDynamicField({ type, action: 'add', setValue, watch });
    // Map type to section key
    const sectionMap: Record<string, string> = {
      'Saves': 'saves',
      'Skills': 'skills',
      'Traits': 'traits',
      'Actions': 'actions',
      'Reactions': 'reactions',
      'LegendaryActions': 'legendary',
    };
    const sectionKey = sectionMap[type] || type.toLowerCase();
    setExpandedSections((prev) => ({ ...prev, [sectionKey]: true }));
  };
  const handleRemove = (type: any, index: number) => {
    handleDynamicField({ type, action: 'remove', setValue, watch, index });
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
            <FieldWithError
              label="Name *"
              inputProps={{ id: 'Name', ...register('Name') }}
              error={errors.Name?.message as string}
            />
          </div>

          <div ref={registerField('SearchTags')}>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <TagInput
              tags={watch('SearchTags') || []}
              onChange={tags => setValue('SearchTags', tags)}
              placeholder="+ Tag"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">

            <div ref={registerField('Type')}>
              <FieldWithError
                label="Type *"
                inputProps={{ id: 'Type', ...register('Type'), placeholder: 'e.g., Dragon, Humanoid' }}
                error={errors.Type?.message as string}
              />
            </div>


            <div ref={registerField('Challenge')}>
              <FieldWithError
                label="Challenge Rating *"
                inputProps={{ id: 'Challenge', ...register('Challenge'), placeholder: 'e.g., 5' }}
                error={errors.Challenge?.message as string}
              />
            </div>
          </div>


          <div ref={registerField('Source')}>
            <FieldWithError
              label="Source"
              inputProps={{ id: 'Source', ...register('Source'), placeholder: 'e.g., Monster Manual' }}
            />
          </div>


          <div ref={registerField('Description')}>
            <FieldWithError
              label="Description"
              inputProps={{ id: 'Description', ...register('Description'), rows: 3 }}
              as="textarea"
            />
          </div>


          <div ref={registerField('ImageURL')}>
            <FieldWithError
              label="Image URL (optional)"
              inputProps={{
                id: 'ImageURL',
                ...register('ImageURL'),
                placeholder: 'https://example.com/monster-image.jpg',
              }}
              error={errors.ImageURL?.message as string}
            />
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
            <FieldWithError
              label="Speed (comma-separated)"
              inputProps={{
                id: 'Speed',
                placeholder: 'e.g., 30 ft., fly 60 ft.',
                value: (watch('Speed') || []).join(', '),
                onChange: (e: any) => handleCommaSeparatedChange(e, setValue, 'Speed'),
                ...register('Speed'),
              }}
            />
          </div>


          <div ref={registerField('Senses')}>
            <FieldWithError
              label="Senses (comma-separated)"
              inputProps={{
                id: 'Senses',
                placeholder: 'e.g., darkvision 60 ft., passive Perception 12',
                value: (watch('Senses') || []).join(', '),
                onChange: (e: any) => handleCommaSeparatedChange(e, setValue, 'Senses'),
                ...register('Senses'),
              }}
            />
          </div>


          <div ref={registerField('Languages')}>
            <FieldWithError
              label="Languages (comma-separated)"
              inputProps={{
                id: 'Languages',
                placeholder: 'e.g., Common, Draconic',
                value: (watch('Languages') || []).join(', '),
                onChange: (e: any) => handleCommaSeparatedChange(e, setValue, 'Languages'),
                ...register('Languages'),
              }}
            />
          </div>


          <div ref={registerField('DamageVulnerabilities')}>
            <FieldWithError
              label="Damage Vulnerabilities (comma-separated)"
              inputProps={{
                id: 'DamageVulnerabilities',
                placeholder: 'e.g., fire, cold',
                value: (watch('DamageVulnerabilities') || []).join(', '),
                onChange: (e: any) => handleCommaSeparatedChange(e, setValue, 'DamageVulnerabilities'),
                ...register('DamageVulnerabilities'),
              }}
            />
          </div>


          <div ref={registerField('DamageResistances')}>
            <FieldWithError
              label="Damage Resistances (comma-separated)"
              inputProps={{
                id: 'DamageResistances',
                placeholder: 'e.g., bludgeoning, piercing',
                value: (watch('DamageResistances') || []).join(', '),
                onChange: (e: any) => handleCommaSeparatedChange(e, setValue, 'DamageResistances'),
                ...register('DamageResistances'),
              }}
            />
          </div>


          <div ref={registerField('DamageImmunities')}>
            <FieldWithError
              label="Damage Immunities (comma-separated)"
              inputProps={{
                id: 'DamageImmunities',
                placeholder: 'e.g., poison, psychic',
                value: (watch('DamageImmunities') || []).join(', '),
                onChange: (e: any) => handleCommaSeparatedChange(e, setValue, 'DamageImmunities'),
                ...register('DamageImmunities'),
              }}
            />
          </div>


          <div ref={registerField('ConditionImmunities')}>
            <FieldWithError
              label="Condition Immunities (comma-separated)"
              inputProps={{
                id: 'ConditionImmunities',
                placeholder: 'e.g., charmed, frightened',
                value: (watch('ConditionImmunities') || []).join(', '),
                onChange: (e: any) => handleCommaSeparatedChange(e, setValue, 'ConditionImmunities'),
                ...register('ConditionImmunities'),
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
        actionButton={{ label: 'Add', onClick: () => handleAdd('Saves') }}
      >
        <div className="space-y-4">
          {saves.map((save, index) => (
            <div key={index} className="flex gap-4 items-end">
              <div className="flex-1" ref={registerField(`Saves.${index}.Name`)}>
                <FieldWithError
                  label="Ability"
                  inputProps={{
                    ...register(`Saves.${index}.Name` as `Saves.${number}.Name`),
                    placeholder: "e.g., Dex, Wis"
                  }}
                  error={errors.Saves?.[index]?.Name?.message as string}
                />
              </div>
              <div className="flex-1" ref={registerField(`Saves.${index}.Modifier`)}>
                <FieldWithError
                  label="Modifier"
                  inputProps={{
                    type: "number",
                    ...register(`Saves.${index}.Modifier` as `Saves.${number}.Modifier`, { valueAsNumber: true }),
                    placeholder: "e.g., +5"
                  }}
                  error={errors.Saves?.[index]?.Modifier?.message as string}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => handleRemove('Saves', index)}
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
        actionButton={{ label: 'Add', onClick: () => handleAdd('Skills') }}
      >
        <div className="space-y-4">
          {skills.map((skill, index) => (
            <div key={index} className="flex gap-4 items-end">
              <div className="flex-1" ref={registerField(`Skills.${index}.Name`)}>
                <FieldWithError
                  label="Skill"
                  inputProps={{
                    ...register(`Skills.${index}.Name` as `Skills.${number}.Name`),
                    placeholder: "e.g., Perception, Stealth"
                  }}
                  error={errors.Skills?.[index]?.Name?.message as string}
                />
              </div>
              <div className="flex-1" ref={registerField(`Skills.${index}.Modifier`)}>
                <FieldWithError
                  label="Modifier"
                  inputProps={{
                    type: "number",
                    ...register(`Skills.${index}.Modifier` as `Skills.${number}.Modifier`, { valueAsNumber: true }),
                    placeholder: "e.g., +5"
                  }}
                  error={errors.Skills?.[index]?.Modifier?.message as string}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => handleRemove('Skills', index)}
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
        actionButton={{ label: 'Add', onClick: () => handleAdd('Traits') }}
      >
        <div className="space-y-4">
          {traits.map((trait, index) => (
            <div key={index} className="border p-4 rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-4">
                  <div ref={registerField(`Traits.${index}.Name`)}>
                    <FieldWithError
                      label="Trait Name *"
                      inputProps={{
                        ...register(`Traits.${index}.Name` as `Traits.${number}.Name`),
                        placeholder: "e.g., Pack Tactics"
                      }}
                      error={errors.Traits?.[index]?.Name?.message as string}
                    />
                  </div>
                  <div ref={registerField(`Traits.${index}.Usage`)}>
                    <FieldWithError
                      label="Usage"
                      inputProps={{
                        ...register(`Traits.${index}.Usage` as `Traits.${number}.Usage`),
                        placeholder: "e.g., Recharge 5-6"
                      }}
                      error={errors.Traits?.[index]?.Usage?.message as string}
                    />
                  </div>
                  <div ref={registerField(`Traits.${index}.Content`)}>
                    <FieldWithError
                      label="Description *"
                      inputProps={{
                        ...register(`Traits.${index}.Content` as `Traits.${number}.Content`),
                        rows: 3
                      }}
                      as="textarea"
                      error={errors.Traits?.[index]?.Content?.message as string}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemove('Traits', index)}
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
        actionButton={{ label: 'Add', onClick: () => handleAdd('Actions') }}
      >
        <div className="space-y-4">
          {actions.map((action, index) => (
            <div key={index} className="border border-border p-4 rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-4">
                  <div ref={registerField(`Actions.${index}.Name`)}>
                    <FieldWithError
                      label="Action Name *"
                      inputProps={{
                        ...register(`Actions.${index}.Name` as `Actions.${number}.Name`),
                        placeholder: "e.g., Multiattack"
                      }}
                      error={errors.Actions?.[index]?.Name?.message as string}
                    />
                  </div>
                  <div ref={registerField(`Actions.${index}.Usage`)}>
                    <FieldWithError
                      label="Usage"
                      inputProps={{
                        ...register(`Actions.${index}.Usage` as `Actions.${number}.Usage`),
                        placeholder: "e.g., Recharge 5-6"
                      }}
                      error={errors.Actions?.[index]?.Usage?.message as string}
                    />
                  </div>
                  <div ref={registerField(`Actions.${index}.Content`)}>
                    <FieldWithError
                      label="Description *"
                      inputProps={{
                        ...register(`Actions.${index}.Content` as `Actions.${number}.Content`),
                        rows: 3
                      }}
                      as="textarea"
                      error={errors.Actions?.[index]?.Content?.message as string}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemove('Actions', index)}
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
        actionButton={{ label: 'Add', onClick: () => handleAdd('Reactions') }}
      >
        <div className="space-y-4">
          {reactions.map((reaction, index) => (
            <div key={index} className="border p-4 rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-4">
                  <div ref={registerField(`Reactions.${index}.Name`)}>
                    <FieldWithError
                      label="Reaction Name *"
                      inputProps={{
                        ...register(`Reactions.${index}.Name` as `Reactions.${number}.Name`),
                        placeholder: "e.g., Parry"
                      }}
                      error={errors.Reactions?.[index]?.Name?.message as string}
                    />
                  </div>
                  <div ref={registerField(`Reactions.${index}.Usage`)}>
                    <FieldWithError
                      label="Usage"
                      inputProps={{
                        ...register(`Reactions.${index}.Usage` as `Reactions.${number}.Usage`),
                        placeholder: "e.g., 1/Turn"
                      }}
                      error={errors.Reactions?.[index]?.Usage?.message as string}
                    />
                  </div>
                  <div ref={registerField(`Reactions.${index}.Content`)}>
                    <FieldWithError
                      label="Description *"
                      inputProps={{
                        ...register(`Reactions.${index}.Content` as `Reactions.${number}.Content`),
                        rows: 3
                      }}
                      as="textarea"
                      error={errors.Reactions?.[index]?.Content?.message as string}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemove('Reactions', index)}
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
        actionButton={{ label: 'Add', onClick: () => handleAdd('LegendaryActions') }}
      >
        <div className="space-y-4">
          {legendaryActions.map((action, index) => (
            <div key={index} className="border p-4 rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-4">
                  <div ref={registerField(`LegendaryActions.${index}.Name`)}>
                    <FieldWithError
                      label="Action Name *"
                      inputProps={{
                        ...register(`LegendaryActions.${index}.Name` as `LegendaryActions.${number}.Name`),
                        placeholder: "e.g., Wing Attack"
                      }}
                      error={errors.LegendaryActions?.[index]?.Name?.message as string}
                    />
                  </div>
                  <div ref={registerField(`LegendaryActions.${index}.Usage`)}>
                    <FieldWithError
                      label="Cost"
                      inputProps={{
                        ...register(`LegendaryActions.${index}.Usage` as `LegendaryActions.${number}.Usage`),
                        placeholder: "e.g., Costs 2 Actions"
                      }}
                      error={errors.LegendaryActions?.[index]?.Usage?.message as string}
                    />
                  </div>
                  <div ref={registerField(`LegendaryActions.${index}.Content`)}>
                    <FieldWithError
                      label="Description *"
                      inputProps={{
                        ...register(`LegendaryActions.${index}.Content` as `LegendaryActions.${number}.Content`),
                        rows: 3
                      }}
                      as="textarea"
                      error={errors.LegendaryActions?.[index]?.Content?.message as string}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemove('LegendaryActions', index)}
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
