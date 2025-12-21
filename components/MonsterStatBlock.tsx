'use client';

import type { Monster } from '@/types/monster';
import styles from './MonsterStatBlock.module.css';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';

interface DropdownOption {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive';
}

interface MonsterStatBlockProps {
  monster: Monster;
  className?: string;
  onFieldClick?: (fieldId: string) => void;
  dropdownOptions?: DropdownOption[];
}

export default function MonsterStatBlock({ 
  monster, 
  className = '', 
  onFieldClick,
  dropdownOptions
}: MonsterStatBlockProps) {

  const handleFieldClick = (fieldId: string) => {
    if (onFieldClick) {
      onFieldClick(fieldId);
    }
  };

  return (
    <>
      <div className={`${styles.statBlockWrapper} ${className}`}>
        {dropdownOptions && dropdownOptions.length > 0 && (
          <div className="absolute top-2 right-2 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 bg-[#fdf1dc]/90 hover:bg-[#fdf1dc] shadow-sm">
                  <MoreVertical className="h-3 w-3 text-[#7a200d]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {dropdownOptions.map((option, index) => (
                  <DropdownMenuItem 
                    key={index}
                    onClick={option.onClick}
                    className={option.variant === 'destructive' ? 'text-red-600' : ''}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        <div className={styles.bar}></div>
        <div className={styles.statBlock}>
          <div 
            className={styles.creatureName} 
            onClick={() => handleFieldClick('Name')}
            style={{ cursor: onFieldClick ? 'pointer' : 'default' }}
          >
            {monster.Name || 'Unnamed Monster'}
          </div>
          <div 
            className={styles.creatureType}
            onClick={() => handleFieldClick('Type')}
            style={{ cursor: onFieldClick ? 'pointer' : 'default' }}
          >
            {monster.Type}
          </div>

          <svg className={styles.taperedRule} height="5" width="400">
            <polyline points="0,0 400,2.5 0,5" fill="#922610" stroke="#922610" />
          </svg>

          <div 
            className={styles.propertyLine}
            onClick={() => handleFieldClick('AC')}
            style={{ cursor: onFieldClick ? 'pointer' : 'default' }}
          >
            <span className={styles.propertyName}>Armor Class</span> {monster.AC.Value}
            {monster.AC.Notes && <> ({monster.AC.Notes})</>}
          </div>
          <div 
            className={styles.propertyLine}
            onClick={() => handleFieldClick('HP')}
            style={{ cursor: onFieldClick ? 'pointer' : 'default' }}
          >
            <span className={styles.propertyName}>Hit Points</span> {monster.HP.Value}
            {monster.HP.Notes && <> ({monster.HP.Notes})</>}
          </div>
          <div 
            className={styles.propertyLine}
            onClick={() => handleFieldClick('Speed')}
            style={{ cursor: onFieldClick ? 'pointer' : 'default' }}
          >
            <span className={styles.propertyName}>Speed</span> {monster.Speed.length > 0 ? monster.Speed.join(', ') : '—'}
          </div>

          <svg className={styles.taperedRule} height="5" width="400">
            <polyline points="0,0 400,2.5 0,5" fill="#922610" stroke="#922610" />
          </svg>

          <table className={styles.abilities}>
            <tbody>
              <tr>
                <th>STR</th>
                <th>DEX</th>
                <th>CON</th>
                <th>INT</th>
                <th>WIS</th>
                <th>CHA</th>
              </tr>
              <tr>
                {Object.entries(monster.Abilities).map(([ability, score]) => {
                  const modifier = Math.floor((score - 10) / 2);
                  const formattedMod = modifier >= 0 ? `+${modifier}` : `–${Math.abs(modifier)}`;
                  return (
                    <td 
                      key={ability}
                      onClick={() => handleFieldClick(ability)}
                      style={{ cursor: onFieldClick ? 'pointer' : 'default' }}
                    >
                      {score} ({formattedMod})
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>

          <svg className={styles.taperedRule} height="5" width="400">
            <polyline points="0,0 400,2.5 0,5" fill="#922610" stroke="#922610" />
          </svg>

          {monster.Saves.length > 0 && (
            <div 
              className={styles.features}
              onClick={() => handleFieldClick('Saves')}
              style={{ cursor: onFieldClick ? 'pointer' : 'default' }}
            >
              <span className={styles.propertyName}>Saving Throws</span>{' '}
              {monster.Saves.map((save, i) => (
                <span key={i}>
                  {save.Name} {save.Modifier >= 0 ? '+' : ''}{save.Modifier}
                  {i < monster.Saves.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          )}

          {monster.Skills.length > 0 && (
            <div 
              className={styles.features}
              onClick={() => handleFieldClick('Skills')}
              style={{ cursor: onFieldClick ? 'pointer' : 'default' }}
            >
              <span className={styles.propertyName}>Skills</span>{' '}
              {monster.Skills.map((skill, i) => (
                <span key={i}>
                  {skill.Name} {skill.Modifier >= 0 ? '+' : ''}{skill.Modifier}
                  {i < monster.Skills.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          )}

          {monster.DamageVulnerabilities.length > 0 && (
            <div 
              className={styles.features}
              onClick={() => handleFieldClick('DamageVulnerabilities')}
              style={{ cursor: onFieldClick ? 'pointer' : 'default' }}
            >
              <span className={styles.propertyName}>Damage Vulnerabilities</span>{' '}
              {monster.DamageVulnerabilities.join(', ')}
            </div>
          )}

          {monster.DamageResistances.length > 0 && (
            <div 
              className={styles.features}
              onClick={() => handleFieldClick('DamageResistances')}
              style={{ cursor: onFieldClick ? 'pointer' : 'default' }}
            >
              <span className={styles.propertyName}>Damage Resistances</span>{' '}
              {monster.DamageResistances.join(', ')}
            </div>
          )}

          {monster.DamageImmunities.length > 0 && (
            <div 
              className={styles.features}
              onClick={() => handleFieldClick('DamageImmunities')}
              style={{ cursor: onFieldClick ? 'pointer' : 'default' }}
            >
              <span className={styles.propertyName}>Damage Immunities</span>{' '}
              {monster.DamageImmunities.join(', ')}
            </div>
          )}

          {monster.ConditionImmunities.length > 0 && (
            <div 
              className={styles.features}
              onClick={() => handleFieldClick('ConditionImmunities')}
              style={{ cursor: onFieldClick ? 'pointer' : 'default' }}
            >
              <span className={styles.propertyName}>Condition Immunities</span>{' '}
              {monster.ConditionImmunities.join(', ')}
            </div>
          )}

          <div 
            className={styles.features}
            onClick={() => handleFieldClick('Senses')}
            style={{ cursor: onFieldClick ? 'pointer' : 'default' }}
          >
            <span className={styles.propertyName}>Senses</span>{' '}
            {monster.Senses.length > 0 ? monster.Senses.join(', ') : '—'}
          </div>

          <div 
            className={styles.features}
            onClick={() => handleFieldClick('Languages')}
            style={{ cursor: onFieldClick ? 'pointer' : 'default' }}
          >
            <span className={styles.propertyName}>Languages</span>{' '}
            {monster.Languages.length > 0 ? monster.Languages.join(', ') : '—'}
          </div>

          <div 
            className={styles.features}
            onClick={() => handleFieldClick('Challenge')}
            style={{ cursor: onFieldClick ? 'pointer' : 'default' }}
          >
            <span className={styles.propertyName}>Challenge</span> {monster.Challenge}
          </div>

          {monster.Traits.length > 0 && (
            <>
              {monster.Traits.map((trait, index) => (
                <div 
                  key={index} 
                  className={styles.propertyBlock}
                  onClick={() => handleFieldClick('Traits')}
                  style={{ cursor: onFieldClick ? 'pointer' : 'default' }}
                >
                  <span className={styles.featureName}>{trait.Name}.</span>{' '}
                  <span className={styles.featureText}>
                    {trait.Content}
                    {trait.Usage && <span className={styles.italic}> {trait.Usage}</span>}
                  </span>
                </div>
              ))}
            </>
          )}

          {monster.Actions.length > 0 && (
            <>
              <h3 className={styles.sectionHeader}>Actions</h3>
              {monster.Actions.map((action, index) => (
                <div 
                  key={index} 
                  className={styles.action}
                  onClick={() => handleFieldClick('Actions')}
                  style={{ cursor: onFieldClick ? 'pointer' : 'default' }}
                >
                  <span className={styles.actionName}>{action.Name}.</span>{' '}
                  <span className={styles.actionContent}>
                    {action.Content}
                    {action.Usage && <span className={styles.italic}> {action.Usage}</span>}
                  </span>
                </div>
              ))}
            </>
          )}

          {monster.Reactions.length > 0 && (
            <>
              <h3 className={styles.sectionHeader}>Reactions</h3>
              {monster.Reactions.map((reaction, index) => (
                <div 
                  key={index} 
                  className={styles.action}
                  onClick={() => handleFieldClick('Reactions')}
                  style={{ cursor: onFieldClick ? 'pointer' : 'default' }}
                >
                  <span className={styles.actionName}>{reaction.Name}.</span>{' '}
                  <span className={styles.actionContent}>
                    {reaction.Content}
                    {reaction.Usage && <span className={styles.italic}> {reaction.Usage}</span>}
                  </span>
                </div>
              ))}
            </>
          )}

          {monster.LegendaryActions.length > 0 && (
            <>
              <h3 className={styles.sectionHeader}>Legendary Actions</h3>
              {monster.LegendaryActions.map((action, index) => (
                <div 
                  key={index} 
                  className={styles.action}
                  onClick={() => handleFieldClick('LegendaryActions')}
                  style={{ cursor: onFieldClick ? 'pointer' : 'default' }}
                >
                  <span className={styles.actionName}>{action.Name}.</span>{' '}
                  <span className={styles.actionContent}>
                    {action.Content}
                    {action.Usage && <span className={styles.italic}> {action.Usage}</span>}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
        <div className={styles.bar}></div>
      </div>
    </>
  );
}
