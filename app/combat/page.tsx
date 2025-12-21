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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MoreVertical } from 'lucide-react';
import MonsterStatBlock from '@/components/MonsterStatBlock';
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
  const [columnToggles, setColumnToggles] = useState<Record<string, boolean>>({});
  const [monsterSearchQuery, setMonsterSearchQuery] = useState('');
  const [isConditionDialogOpen, setIsConditionDialogOpen] = useState(false);
  const [conditionMonsterInstanceId, setConditionMonsterInstanceId] = useState<string | null>(null);
  const [newCondition, setNewCondition] = useState('');
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
    
    const newHP = Math.max(0, Math.min(monster.maxHP, monster.currentHP + delta));
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
    setConditionMonsterInstanceId(instanceId);
    setNewCondition('');
    setIsConditionDialogOpen(true);
  };
  
  const handleConditionSubmit = () => {
    if (conditionMonsterInstanceId && newCondition.trim()) {
      addCondition(conditionMonsterInstanceId, newCondition.trim());
      setIsConditionDialogOpen(false);
      setNewCondition('');
      setConditionMonsterInstanceId(null);
    }
  };
  
  const handleResetCombat = () => {
    reset();
    setIsResetDialogOpen(false);
    toast.success('Combat session reset');
  };
  
  return (
    <div className="min-h-screen bg-background">
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
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Monster</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Monster to Combat</DialogTitle>
                </DialogHeader>
                <Input
                  placeholder="Search monsters..."
                  value={monsterSearchQuery}
                  onChange={(e) => setMonsterSearchQuery(e.target.value)}
                  className="mb-4"
                />
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {availableMonsters.filter(({ monster }) => 
                    (monster.Name || '').toLowerCase().includes(monsterSearchQuery.toLowerCase()) ||
                    monster.Type.toLowerCase().includes(monsterSearchQuery.toLowerCase())
                  ).length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      {monsterSearchQuery ? 'No monsters found.' : 'No monsters available.'} <Link href="/monsters/new" className="text-primary hover:underline">Create one first</Link>
                    </p>
                  ) : (
                    availableMonsters.filter(({ monster }) => 
                      (monster.Name || '').toLowerCase().includes(monsterSearchQuery.toLowerCase()) ||
                      monster.Type.toLowerCase().includes(monsterSearchQuery.toLowerCase())
                    ).map(({ id, monster }) => (
                      <Card
                        key={id}
                        className="cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => handleAddMonster(id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-4">
                            {monster.ImageURL && (
                              <img
                                src={monster.ImageURL}
                                alt={monster.Name}
                                className="w-12 h-12 rounded object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground">{monster.Name}</h3>
                              <div className="flex gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">{monster.Type}</Badge>
                                <Badge variant="outline" className="text-xs">CR {monster.Challenge}</Badge>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              HP: {monster.HP.Value}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                  combatMonster.currentHP < combatMonster.maxHP * 0.25 ? '#F59E0B' :
                                  combatMonster.currentHP < combatMonster.maxHP * 0.5 ? '#FBBF24' :
                                  '#10B981'
                              }}
                            />
                          </div>
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
                        </div>

                        {/* Conditions */}
                        {combatMonster.conditions.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {combatMonster.conditions.map((condition, idx) => (
                              <Badge
                                key={idx}
                                variant="destructive"
                                className="cursor-pointer"
                                onClick={() => removeCondition(combatMonster.id, condition)}
                              >
                                {condition} ×
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddCondition(combatMonster.id)}
                            className="flex-1"
                          >
                            + Condition
                          </Button>
                        </div>

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
                const monsterId = combatMonster.id.split('-')[0]; // Extract original monster ID
                return (
                  <div key={combatMonster.id} className="relative">
                    <div className="absolute top-2 right-2 z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 bg-[#fdf1dc]/90 hover:bg-[#fdf1dc] shadow-sm">
                            <MoreVertical className="h-3 w-3 text-[#7a200d]" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setColumnToggles(prev => ({ ...prev, [combatMonster.id]: !prev[combatMonster.id] }));
                          }}>
                            {columnToggles[combatMonster.id] ? 'Single Column' : 'Double Column'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/monsters/${monsterId}/edit`)}>
                            Edit Monster
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleRemoveMonster(combatMonster.id)}
                            className="text-red-600"
                          >
                            Remove from Combat
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <MonsterStatBlock 
                      monster={combatMonster.monster} 
                      showColumnToggle={false}
                      twoColumn={columnToggles[combatMonster.id]}
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
      
      {/* Add Condition Dialog */}
      <Dialog open={isConditionDialogOpen} onOpenChange={setIsConditionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Condition</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Condition Name</label>
              <Input
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                placeholder="e.g., Poisoned, Frightened, Prone"
                onKeyDown={(e) => e.key === 'Enter' && handleConditionSubmit()}
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsConditionDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConditionSubmit} disabled={!newCondition.trim()}>
                Add Condition
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
