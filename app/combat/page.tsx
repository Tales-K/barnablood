'use client';

import { useEffect, useState } from 'react';
import { useCombatStore } from '@/lib/stores/combat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MonsterStatBlock from '@/components/MonsterStatBlock';
import { MonsterSearch } from '@/components/MonsterSearch';
import { TagInput } from '@/components/ui/TagInput';
import type { Monster } from '@/types/monster';

export default function CombatPage() {
  const router = useRouter();
  const {
    sessionId,
    monsters: combatMonsters,
    version,
    addMonster,
    removeMonster,
    updateMonsterHP,
    addCondition,
    removeCondition,
    updateNotes,
    reset,
    setVersion,
  } = useCombatStore();
  
  const [availableMonsters, setAvailableMonsters] = useState<Array<{ id: string; monster: Monster }>>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [newConditions, setNewConditions] = useState<Record<string, string>>({});
  const [hpChanges, setHpChanges] = useState<Record<string, { add: string; subtract: string }>>({});
  
  // Load available monsters
  useEffect(() => {
    fetch('/api/monsters')
      .then(res => res.json())
      .then(data => setAvailableMonsters(data.monsters || []))
      .catch(err => console.error('Failed to load monsters:', err));
  }, []);
  
  // Auto-sync every 2 seconds
  useEffect(() => {
    if (combatMonsters.length === 0) return;
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/combat/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            monsters: combatMonsters,
            version,
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          // Update version from server response
          if (data.version !== undefined) {
            setVersion(data.version);
          }
        } else {
          const error = await response.json();
          if (response.status === 409) {
            console.error('Conflict detected:', error);
            toast.error('Combat session conflict - please reload the page');
          } else {
            console.error('Save failed:', error);
          }
        }
      } catch (error) {
        console.error('Auto-sync failed:', error);
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [sessionId, combatMonsters, version]);
  
  const handleAddMonster = (monsterId: string) => {
    const found = availableMonsters.find(m => m.id === monsterId);
    if (!found) return;
    
    addMonster({
      id: `${monsterId}-${Date.now()}`,
      monster: found.monster,
      currentHP: found.monster.HP.Value,
      maxHP: found.monster.HP.Value,
      conditions: [],
      notes: '',
    });
    
    setIsAddDialogOpen(false);
    toast.success(`${found.monster.Name} added to combat!`);
  };
  
  const handleRemoveMonster = (instanceId: string) => {
    removeMonster(instanceId);
    toast.success('Monster removed from combat');
  };
  
  const handleHPChange = (instanceId: string, delta: number) => {
    const monster = combatMonsters.find(m => m.id === instanceId);
    if (!monster) return;
    const newHP = monster.currentHP + delta;
    updateMonsterHP(instanceId, newHP);
  };

  const handleQuickHPChange = (instanceId: string, type: 'add' | 'subtract') => {
    const value = parseInt(hpChanges[instanceId]?.[type] || '0');
    if (isNaN(value) || value === 0) return;
    
    handleHPChange(instanceId, type === 'add' ? value : -value);
    
    // Clear the input
    setHpChanges(prev => ({
      ...prev,
      [instanceId]: {
        ...prev[instanceId],
        [type]: ''
      }
    }));
  };

  const updateHpChangeInput = (instanceId: string, type: 'add' | 'subtract', value: string) => {
    setHpChanges(prev => ({
      ...prev,
      [instanceId]: {
        add: prev[instanceId]?.add || '',
        subtract: prev[instanceId]?.subtract || '',
        [type]: value
      }
    }));
  };
  
  const handleAddCondition = (instanceId: string) => {
    const conditionName = newConditions[instanceId]?.trim();
    if (!conditionName) return;
    
    addCondition(instanceId, conditionName);
    setNewConditions(prev => ({
      ...prev,
      [instanceId]: ''
    }));
    toast.success(`Condition "${conditionName}" added`);
  };
  
  const updateConditionInput = (instanceId: string, value: string) => {
    setNewConditions(prev => ({
      ...prev,
      [instanceId]: value
    }));
  };
  
  const handleResetCombat = () => {
    reset();
    setIsResetDialogOpen(false);
    toast.success('Combat session reset');
  };
  
  return (
    <div className="bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Combat Tracker</h2>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-muted-foreground">Track HP, conditions, and notes for your monsters</p>
              <Badge variant="outline">{combatMonsters.length} in combat</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsAddDialogOpen(true)}>Add Monster</Button>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Monster to Combat</DialogTitle>
                  <DialogDescription>
                    Search and select a monster to add to the combat session
                  </DialogDescription>
                </DialogHeader>
                <MonsterSearch
                  availableMonsters={availableMonsters}
                  onSelectMonster={handleAddMonster}
                  emptyMessage="No monsters found."
                  emptyActionLink={{ href: '/monsters/new', label: 'Create one first' }}
                />
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" onClick={() => setIsResetDialogOpen(true)}>
              Reset Combat
            </Button>
          </div>
        </div>
        
        {combatMonsters.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No monsters in combat
              </h3>
              <p className="text-muted-foreground mb-6">
                Add monsters from your library to start tracking combat
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                Add Your First Monster
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* Combat Manager */}
            <Card className="mb-4 bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Combat Manager</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap justify-center gap-4">
                  {combatMonsters.map((combatMonster) => (
                    <Card key={combatMonster.id} className="bg-card border-border p-3">
                      <div className="space-y-3">
                        <div>
                          <div className="font-medium break-words text-foreground">{combatMonster.monster.Name}</div>
                          <div className="text-sm text-muted-foreground mb-1">
                            {combatMonster.currentHP} / {combatMonster.maxHP} HP
                          </div>
                          <div className="w-full bg-muted rounded-full h-3 mb-2">
                            <div
                              className="h-3 rounded-full transition-all"
                              style={{
                                width: `${Math.max(0, Math.min(100, (combatMonster.currentHP / combatMonster.maxHP) * 100))}%`,
                                backgroundColor: 
                                  combatMonster.currentHP <= 0 ? '#EF4444' :
                                  combatMonster.currentHP < combatMonster.maxHP * 0.2 ? '#EF4444' :
                                  combatMonster.currentHP < combatMonster.maxHP * 0.5 ? '#FBBF24' :
                                  '#10B981'
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                placeholder="Add HP"
                                className="flex-1 h-8 text-center bg-green-950/20 border-green-800/50 text-green-400 placeholder:text-green-600"
                                value={hpChanges[combatMonster.id]?.add || ''}
                                onChange={(e) => updateHpChangeInput(combatMonster.id, 'add', e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleQuickHPChange(combatMonster.id, 'add');
                                  }
                                }}
                              />
                              <Input
                                type="number"
                                placeholder="Sub HP"
                                className="flex-1 h-8 text-center bg-red-950/20 border-red-800/50 text-red-400 placeholder:text-red-600"
                                value={hpChanges[combatMonster.id]?.subtract || ''}
                                onChange={(e) => updateHpChangeInput(combatMonster.id, 'subtract', e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleQuickHPChange(combatMonster.id, 'subtract');
                                  }
                                }}
                              />
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-7 text-xs bg-green-950/20 border-green-800/50 text-green-400 hover:bg-green-950/30"
                                onClick={() => handleHPChange(combatMonster.id, Math.floor(combatMonster.maxHP * 0.05))}
                              >
                                +5%
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-7 text-xs bg-green-950/20 border-green-800/50 text-green-400 hover:bg-green-950/30"
                                onClick={() => handleHPChange(combatMonster.id, Math.floor(combatMonster.maxHP * 0.15))}
                              >
                                +15%
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-7 text-xs bg-green-950/20 border-green-800/50 text-green-400 hover:bg-green-950/30"
                                onClick={() => handleHPChange(combatMonster.id, Math.floor(combatMonster.maxHP * 0.25))}
                              >
                                +25%
                              </Button>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-7 text-xs bg-red-950/20 border-red-800/50 text-red-400 hover:bg-red-950/30"
                                onClick={() => handleHPChange(combatMonster.id, -Math.floor(combatMonster.maxHP * 0.05))}
                              >
                                -5%
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-7 text-xs bg-red-950/20 border-red-800/50 text-red-400 hover:bg-red-950/30"
                                onClick={() => handleHPChange(combatMonster.id, -Math.floor(combatMonster.maxHP * 0.15))}
                              >
                                -15%
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-7 text-xs bg-red-950/20 border-red-800/50 text-red-400 hover:bg-red-950/30"
                                onClick={() => handleHPChange(combatMonster.id, -Math.floor(combatMonster.maxHP * 0.25))}
                              >
                                -25%
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Conditions */}
                        <TagInput
                          tags={combatMonster.conditions}
                          onChange={tags => {
                            // Remove all then add all tags (simulate full replace)
                            // Remove all existing
                            combatMonster.conditions.forEach(cond => removeCondition(combatMonster.id, cond));
                            // Add new
                            tags.forEach(cond => addCondition(combatMonster.id, cond));
                          }}
                          placeholder="+ Condition"
                          className=""
                        />

                        {/* Notes */}
                        <div>
                          <Textarea
                            value={combatMonster.notes || ''}
                            onChange={(e) => updateNotes(combatMonster.id, e.target.value)}
                            placeholder="Combat notes..."
                            rows={2}
                            className="text-sm bg-background"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {combatMonsters.map((combatMonster) => {
                // Use the full monster UUID before the first '-' only if the id is a composite (id-timestamp), else use as is
                const monsterId = (() => {
                  // If the id is in the format uuid-timestamp, extract uuid part (before last '-')
                  const parts = combatMonster.id.split('-');
                  if (parts.length > 4) {
                    // UUID v4 has 4 dashes, so join the first 5 parts
                    return parts.slice(0, 5).join('-');
                  }
                  return combatMonster.id;
                })();
                return (
                  <div key={combatMonster.id}>
                    <MonsterStatBlock 
                      monster={combatMonster.monster}
                      dropdownOptions={[
                        {
                          label: 'Edit Monster',
                          onClick: () => router.push(`/monsters/${monsterId}/edit`)
                        },
                        {
                          label: 'Remove from Combat',
                          onClick: () => handleRemoveMonster(combatMonster.id),
                          variant: 'destructive' as const
                        }
                      ]}
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
      
      {/* Reset Combat Confirmation Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Combat Session?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Are you sure you want to reset the combat session? This will clear all monsters and cannot be undone.</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleResetCombat}>
              Reset Combat
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
