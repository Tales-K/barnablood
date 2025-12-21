'use client';

import { Monster } from '@/types/monster';
import { Separator } from '@/components/ui/separator';

interface DndMonsterCardProps {
  monster: Monster;
  onFieldClick?: (fieldId: string) => void;
}

export function DndMonsterCard({ monster, onFieldClick }: DndMonsterCardProps) {
  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const handleFieldClick = (fieldId: string) => {
    if (onFieldClick) {
      onFieldClick(fieldId);
    }
  };

  return (
    <div className="bg-[#f9f7f1] border-4 border-[#832614] rounded-sm shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-[#e0ddd2] border-b-2 border-[#832614] px-6 py-4">
        <h1 
          className="text-3xl font-bold text-[#832614] uppercase cursor-pointer hover:text-[#a93b28] transition-colors"
          onClick={() => handleFieldClick('Name')}
        >
          {monster.Name || 'Unnamed Monster'}
        </h1>
        <p 
          className="text-sm italic text-gray-700 mt-1 cursor-pointer hover:text-gray-900 transition-colors"
          onClick={() => handleFieldClick('Type')}
        >
          {monster.Type}
        </p>
      </div>

      <div className="px-6 py-4">
        {/* Top Stats Bar */}
        <div className="flex flex-wrap gap-6 mb-4">
          <div 
            className="cursor-pointer hover:bg-[#e0ddd2] p-2 rounded transition-colors"
            onClick={() => handleFieldClick('AC.Value')}
          >
            <span className="font-bold text-[#832614]">Armor Class</span>{' '}
            <span className="text-gray-900">{monster.AC.Value}</span>
            {monster.AC.Notes && <span className="text-gray-600 text-sm"> ({monster.AC.Notes})</span>}
          </div>
          <div 
            className="cursor-pointer hover:bg-[#e0ddd2] p-2 rounded transition-colors"
            onClick={() => handleFieldClick('HP.Value')}
          >
            <span className="font-bold text-[#832614]">Hit Points</span>{' '}
            <span className="text-gray-900">{monster.HP.Value}</span>
            {monster.HP.Notes && <span className="text-gray-600 text-sm"> ({monster.HP.Notes})</span>}
          </div>
          <div 
            className="cursor-pointer hover:bg-[#e0ddd2] p-2 rounded transition-colors"
            onClick={() => handleFieldClick('Speed')}
          >
            <span className="font-bold text-[#832614]">Speed</span>{' '}
            <span className="text-gray-900">{monster.Speed.join(', ') || '—'}</span>
          </div>
        </div>

        <Separator className="my-4 bg-[#832614]" />

        {/* Ability Scores */}
        <div className="grid grid-cols-6 gap-2 mb-4">
          {Object.entries(monster.Abilities).map(([ability, score]) => (
            <div
              key={ability}
              className="text-center border border-[#832614] rounded p-2 cursor-pointer hover:bg-[#e0ddd2] transition-colors"
              onClick={() => handleFieldClick(`Abilities.${ability}`)}
            >
              <div className="text-xs font-bold text-[#832614] uppercase">{ability}</div>
              <div className="text-lg font-bold text-gray-900">{score}</div>
              <div className="text-xs text-gray-600">({getModifier(score)})</div>
            </div>
          ))}
        </div>

        <Separator className="my-4 bg-[#832614]" />

        {/* Saves */}
        {monster.Saves && monster.Saves.length > 0 && (
          <div 
            className="mb-2 cursor-pointer hover:bg-[#e0ddd2] p-2 rounded transition-colors"
            onClick={() => handleFieldClick('Saves')}
          >
            <span className="font-bold text-[#832614]">Saving Throws</span>{' '}
            <span className="text-gray-900">
              {monster.Saves.map(s => `${s.Name} ${s.Modifier >= 0 ? '+' : ''}${s.Modifier}`).join(', ')}
            </span>
          </div>
        )}

        {/* Skills */}
        {monster.Skills && monster.Skills.length > 0 && (
          <div 
            className="mb-2 cursor-pointer hover:bg-[#e0ddd2] p-2 rounded transition-colors"
            onClick={() => handleFieldClick('Skills')}
          >
            <span className="font-bold text-[#832614]">Skills</span>{' '}
            <span className="text-gray-900">
              {monster.Skills.map(s => `${s.Name} ${s.Modifier >= 0 ? '+' : ''}${s.Modifier}`).join(', ')}
            </span>
          </div>
        )}

        {/* Damage Vulnerabilities */}
        {monster.DamageVulnerabilities && monster.DamageVulnerabilities.length > 0 && (
          <div 
            className="mb-2 cursor-pointer hover:bg-[#e0ddd2] p-2 rounded transition-colors"
            onClick={() => handleFieldClick('DamageVulnerabilities')}
          >
            <span className="font-bold text-[#832614]">Damage Vulnerabilities</span>{' '}
            <span className="text-gray-900">{monster.DamageVulnerabilities.join(', ')}</span>
          </div>
        )}

        {/* Damage Resistances */}
        {monster.DamageResistances && monster.DamageResistances.length > 0 && (
          <div 
            className="mb-2 cursor-pointer hover:bg-[#e0ddd2] p-2 rounded transition-colors"
            onClick={() => handleFieldClick('DamageResistances')}
          >
            <span className="font-bold text-[#832614]">Damage Resistances</span>{' '}
            <span className="text-gray-900">{monster.DamageResistances.join(', ')}</span>
          </div>
        )}

        {/* Damage Immunities */}
        {monster.DamageImmunities && monster.DamageImmunities.length > 0 && (
          <div 
            className="mb-2 cursor-pointer hover:bg-[#e0ddd2] p-2 rounded transition-colors"
            onClick={() => handleFieldClick('DamageImmunities')}
          >
            <span className="font-bold text-[#832614]">Damage Immunities</span>{' '}
            <span className="text-gray-900">{monster.DamageImmunities.join(', ')}</span>
          </div>
        )}

        {/* Condition Immunities */}
        {monster.ConditionImmunities && monster.ConditionImmunities.length > 0 && (
          <div 
            className="mb-2 cursor-pointer hover:bg-[#e0ddd2] p-2 rounded transition-colors"
            onClick={() => handleFieldClick('ConditionImmunities')}
          >
            <span className="font-bold text-[#832614]">Condition Immunities</span>{' '}
            <span className="text-gray-900">{monster.ConditionImmunities.join(', ')}</span>
          </div>
        )}

        {/* Senses */}
        {monster.Senses && monster.Senses.length > 0 && (
          <div 
            className="mb-2 cursor-pointer hover:bg-[#e0ddd2] p-2 rounded transition-colors"
            onClick={() => handleFieldClick('Senses')}
          >
            <span className="font-bold text-[#832614]">Senses</span>{' '}
            <span className="text-gray-900">{monster.Senses.join(', ')}</span>
          </div>
        )}

        {/* Languages */}
        <div 
          className="mb-2 cursor-pointer hover:bg-[#e0ddd2] p-2 rounded transition-colors"
          onClick={() => handleFieldClick('Languages')}
        >
          <span className="font-bold text-[#832614]">Languages</span>{' '}
          <span className="text-gray-900">{monster.Languages?.length > 0 ? monster.Languages.join(', ') : '—'}</span>
        </div>

        {/* Challenge */}
        <div 
          className="mb-4 cursor-pointer hover:bg-[#e0ddd2] p-2 rounded transition-colors"
          onClick={() => handleFieldClick('Challenge')}
        >
          <span className="font-bold text-[#832614]">Challenge</span>{' '}
          <span className="text-gray-900">{monster.Challenge}</span>
        </div>

        {/* Traits */}
        {monster.Traits && monster.Traits.length > 0 && (
          <>
            <Separator className="my-4 bg-[#832614]" />
            {monster.Traits.map((trait, index) => (
              <div 
                key={index} 
                className="mb-3 cursor-pointer hover:bg-[#e0ddd2] p-2 rounded transition-colors"
                onClick={() => handleFieldClick(`Traits.${index}`)}
              >
                <div className="font-bold italic text-[#832614]">
                  {trait.Name}.{' '}
                  {trait.Usage && <span className="text-sm">({trait.Usage})</span>}
                </div>
                <div className="text-gray-900">{trait.Content}</div>
              </div>
            ))}
          </>
        )}

        {/* Actions */}
        {monster.Actions && monster.Actions.length > 0 && (
          <>
            <Separator className="my-4 bg-[#832614]" />
            <h2 className="text-xl font-bold text-[#832614] mb-3 uppercase border-b border-[#832614] pb-1">
              Actions
            </h2>
            {monster.Actions.map((action, index) => (
              <div 
                key={index} 
                className="mb-3 cursor-pointer hover:bg-[#e0ddd2] p-2 rounded transition-colors"
                onClick={() => handleFieldClick(`Actions.${index}`)}
              >
                <div className="font-bold italic text-[#832614]">
                  {action.Name}.{' '}
                  {action.Usage && <span className="text-sm">({action.Usage})</span>}
                </div>
                <div className="text-gray-900">{action.Content}</div>
              </div>
            ))}
          </>
        )}

        {/* Reactions */}
        {monster.Reactions && monster.Reactions.length > 0 && (
          <>
            <Separator className="my-4 bg-[#832614]" />
            <h2 className="text-xl font-bold text-[#832614] mb-3 uppercase border-b border-[#832614] pb-1">
              Reactions
            </h2>
            {monster.Reactions.map((reaction, index) => (
              <div 
                key={index} 
                className="mb-3 cursor-pointer hover:bg-[#e0ddd2] p-2 rounded transition-colors"
                onClick={() => handleFieldClick(`Reactions.${index}`)}
              >
                <div className="font-bold italic text-[#832614]">
                  {reaction.Name}.{' '}
                  {reaction.Usage && <span className="text-sm">({reaction.Usage})</span>}
                </div>
                <div className="text-gray-900">{reaction.Content}</div>
              </div>
            ))}
          </>
        )}

        {/* Legendary Actions */}
        {monster.LegendaryActions && monster.LegendaryActions.length > 0 && (
          <>
            <Separator className="my-4 bg-[#832614]" />
            <h2 className="text-xl font-bold text-[#832614] mb-3 uppercase border-b border-[#832614] pb-1">
              Legendary Actions
            </h2>
            {monster.LegendaryActions.map((action, index) => (
              <div 
                key={index} 
                className="mb-3 cursor-pointer hover:bg-[#e0ddd2] p-2 rounded transition-colors"
                onClick={() => handleFieldClick(`LegendaryActions.${index}`)}
              >
                <div className="font-bold italic text-[#832614]">
                  {action.Name}.{' '}
                  {action.Usage && <span className="text-sm">({action.Usage})</span>}
                </div>
                <div className="text-gray-900">{action.Content}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
