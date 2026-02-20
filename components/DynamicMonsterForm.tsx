'use client';

import { useState, useRef, useEffect } from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { Monster } from '@/types/monster';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, Trash2 } from 'lucide-react';
import { FieldWithError } from '@/components/form/FieldWithError';
import { CommaArrayInput } from '@/components/ui/CommaArrayInput';
import { CollapsibleCard } from '@/components/form/CollapsibleCard';
import { handleDynamicField } from '@/lib/formHelpers';
import { MonsterFeatureDialog, type FeatureCategory, type MonsterFeature } from '@/components/form/MonsterFeatureDialog';
import { CATEGORY_LABELS, CATEGORY_COLORS, type FeatureWithId } from '@/types/feature';
import { Badge } from '@/components/ui/badge';

interface DynamicMonsterFormProps {
  register: UseFormRegister<Monster>;
  setValue: UseFormSetValue<Monster>;
  watch: UseFormWatch<Monster>;
  errors: FieldErrors<Monster>;
  onFieldFocus?: (fieldId: string) => void;
  /** Features managed by the parent page (not RHF). */
  features: FeatureWithId[];
  onAddFeature: (category: FeatureCategory, feature: MonsterFeature, existingFeatureId?: string) => void;
  onEditFeature: (featureId: string, category: FeatureCategory, feature: MonsterFeature) => void;
  onRemoveFeature: (featureId: string) => void;
  /** Features already in the library — shown in the import tab. */
  availableFeatures?: FeatureWithId[];
  /** When set, scroll to this feature and open its edit dialog. */
  openEditForFeatureId?: string;
  /** Called after the dialog has been opened for openEditForFeatureId so the parent can reset the value. */
  onFeatureEditOpened?: () => void;
}

export function DynamicMonsterForm({
  register,
  setValue,
  watch,
  errors,
  onFieldFocus,
  features,
  onAddFeature,
  onEditFeature,
  onRemoveFeature,
  availableFeatures = [],
  openEditForFeatureId,
  onFeatureEditOpened,
}: DynamicMonsterFormProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    stats: true,
    abilities: true,
    details: false,
    saves: false,
    skills: false,
    features: false,
  });
  const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<FeatureWithId | undefined>(undefined);

  // When a feature ID is passed in from the parent (card click), scroll to it and open the edit dialog
  useEffect(() => {
    if (!openEditForFeatureId) return;
    const feature = features.find(f => f.id === openEditForFeatureId);
    if (!feature) return;
    setExpandedSections(prev => ({ ...prev, features: true }));
    setTimeout(() => {
      const el = document.getElementById(`feature-${openEditForFeatureId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setEditingFeature(feature);
      setIsFeatureDialogOpen(true);
      onFeatureEditOpened?.();
    }, 300);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openEditForFeatureId]);

  // Expand section if any field inside has an error
  useEffect(() => {
    // Only expand sections if errors appear in a section that is currently collapsed
    setExpandedSections(prev => {
      const errorSectionMap: Record<string, boolean> = {
        basic: !!(errors.Name || errors.Type || errors.Challenge || errors.ImageURL),
        stats: !!(errors.AC?.Value || errors.HP?.Value),
        abilities: false,
        details: !!(errors.Speed || errors.Senses || errors.Languages || errors.DamageVulnerabilities || errors.DamageResistances || errors.DamageImmunities || errors.ConditionImmunities),
        saves: Array.isArray(errors.Saves) && errors.Saves.some(e => e),
        skills: Array.isArray(errors.Skills) && errors.Skills.some(e => e),
        features: false,
      };
      let changed = false;
      const next = { ...prev };
      for (const section in errorSectionMap) {
        if (errorSectionMap[section] && !prev[section]) {
          next[section] = true;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [errors, setExpandedSections]);

  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  // Watch values for dynamic sections
  const saves = watch('Saves') || [];
  const skills = watch('Skills') || [];

  const handleOpenAddDialog = () => {
    setEditingFeature(undefined);
    setIsFeatureDialogOpen(true);
    setExpandedSections(prev => ({ ...prev, features: true }));
  };

  const handleOpenEditDialog = (feature: FeatureWithId) => {
    setEditingFeature(feature);
    setIsFeatureDialogOpen(true);
  };

  const handleDialogSave = (category: FeatureCategory, feature: MonsterFeature, featureId?: string) => {
    if (featureId) {
      const isAlreadyInMonster = features.some(f => f.id === featureId);
      if (isAlreadyInMonster) {
        onEditFeature(featureId, category, feature);
      } else {
        // Imported from library — reuse the existing feature id
        onAddFeature(category, feature, featureId);
      }
    } else {
      onAddFeature(category, feature);
    }
  };

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
          const sectionMatch = fieldId.match(/^(Saves|Skills)/);
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


  // Helper for add/remove (Saves and Skills only)
  type SimpleFieldType = "Saves" | "Skills";
  const handleAdd = (type: SimpleFieldType) => {
    handleDynamicField({ type, action: 'add', setValue, watch });
    setExpandedSections(prev => ({ ...prev, [type.toLowerCase()]: true }));
  };
  const handleRemove = (type: SimpleFieldType, index: number) => {
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
            <CommaArrayInput
              label="Tags"
              values={Array.isArray(watch('SearchTags')) ? watch('SearchTags')! : []}
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
              label="Image URL"
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

          <div id="Speed" ref={registerField('Speed')}>
            <CommaArrayInput
              label="Speed"
              values={Array.isArray(watch('Speed')) ? watch('Speed') : []}
              onChange={vals => setValue('Speed', vals)}
              placeholder="e.g., 30 ft., fly 60 ft."
            />
          </div>


          <div id="Senses" ref={registerField('Senses')}>
            <CommaArrayInput
              label="Senses"
              values={Array.isArray(watch('Senses')) ? watch('Senses') : []}
              onChange={vals => setValue('Senses', vals)}
              placeholder="e.g., darkvision 60 ft., passive Perception 12"
            />
          </div>


          <div id="Languages" ref={registerField('Languages')}>
            <CommaArrayInput
              label="Languages"
              values={Array.isArray(watch('Languages')) ? watch('Languages') : []}
              onChange={vals => setValue('Languages', vals)}
              placeholder="e.g., Common, Draconic"
            />
          </div>


          <div id="DamageVulnerabilities" ref={registerField('DamageVulnerabilities')}>
            <CommaArrayInput
              label="Damage Vulnerabilities"
              values={Array.isArray(watch('DamageVulnerabilities')) ? watch('DamageVulnerabilities') : []}
              onChange={vals => setValue('DamageVulnerabilities', vals)}
              placeholder="e.g., fire, cold"
            />
          </div>


          <div id="DamageResistances" ref={registerField('DamageResistances')}>
            <CommaArrayInput
              label="Damage Resistances"
              values={Array.isArray(watch('DamageResistances')) ? watch('DamageResistances') : []}
              onChange={vals => setValue('DamageResistances', vals)}
              placeholder="e.g., bludgeoning, piercing"
            />
          </div>


          <div id="DamageImmunities" ref={registerField('DamageImmunities')}>
            <CommaArrayInput
              label="Damage Immunities"
              values={Array.isArray(watch('DamageImmunities')) ? watch('DamageImmunities') : []}
              onChange={vals => setValue('DamageImmunities', vals)}
              placeholder="e.g., poison, psychic"
            />
          </div>


          <div id="ConditionImmunities" ref={registerField('ConditionImmunities')}>
            <CommaArrayInput
              label="Condition Immunities"
              values={Array.isArray(watch('ConditionImmunities')) ? watch('ConditionImmunities') : []}
              onChange={vals => setValue('ConditionImmunities', vals)}
              placeholder="e.g., charmed, frightened"
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

      {/* Monster Features */}
      <CollapsibleCard
        id="MonsterFeatures"
        title="Monster Features"
        badge={features.length}
        expanded={expandedSections.features}
        onToggle={() => toggleSection('features')}
        actionButton={{ label: 'Add Monster Feature', onClick: handleOpenAddDialog }}
      >
        <div className="space-y-3">
          {features.map((feat) => (
            <div key={feat.id} id={`feature-${feat.id}`} className="border rounded-md p-3 flex gap-3 items-start">
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={`text-xs shrink-0 ${CATEGORY_COLORS[feat.Category]}`}
                  >
                    {CATEGORY_LABELS[feat.Category]}
                  </Badge>
                  <span className="font-medium text-sm">{feat.Name}</span>
                  {feat.Usage && (
                    <span className="text-xs text-muted-foreground">({feat.Usage})</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{feat.Content}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleOpenEditDialog(feat)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => onRemoveFeature(feat.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {features.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No features yet. Click &quot;Add Monster Feature&quot; to add traits, actions, reactions, or legendary actions.
            </p>
          )}
        </div>
      </CollapsibleCard>

      <MonsterFeatureDialog
        open={isFeatureDialogOpen}
        onOpenChange={(val) => {
          if (!val) setEditingFeature(undefined);
          setIsFeatureDialogOpen(val);
        }}
        onSave={handleDialogSave}
        availableFeatures={availableFeatures}
        editingFeature={editingFeature}
      />
    </div>
  );
}
