import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CombatMonster } from '@/types/monster';

interface CombatState {
    monsters: CombatMonster[];
    lastUpdated: number;

    // Actions
    addMonster: (monster: CombatMonster) => void;
    removeMonster: (id: string) => void;
    updateMonsterHP: (id: string, newHP: number) => void;
    addCondition: (id: string, condition: string) => void;
    removeCondition: (id: string, condition: string) => void;
    updateNotes: (id: string, notes: string) => void;
    setMonsters: (monsters: CombatMonster[]) => void;
    reset: () => void;
}

export const useCombatStore = create<CombatState>()(
    persist(
        (set) => ({
            monsters: [],
            lastUpdated: Date.now(),

            addMonster: (monster) =>
                set((state) => ({
                    monsters: [...state.monsters, monster],
                    lastUpdated: Date.now(),
                })),

            removeMonster: (id) =>
                set((state) => ({
                    monsters: state.monsters.filter((m) => m.id !== id),
                    lastUpdated: Date.now(),
                })),

            updateMonsterHP: (id, newHP) =>
                set((state) => ({
                    monsters: state.monsters.map((m) =>
                        m.id === id ? { ...m, currentHP: newHP } : m
                    ),
                    lastUpdated: Date.now(),
                })),

            addCondition: (id, condition) =>
                set((state) => ({
                    monsters: state.monsters.map((m) =>
                        m.id === id && !m.conditions.includes(condition)
                            ? { ...m, conditions: [...m.conditions, condition] }
                            : m
                    ),
                    lastUpdated: Date.now(),
                })),

            removeCondition: (id, condition) =>
                set((state) => ({
                    monsters: state.monsters.map((m) =>
                        m.id === id
                            ? { ...m, conditions: m.conditions.filter((c) => c !== condition) }
                            : m
                    ),
                    lastUpdated: Date.now(),
                })),

            updateNotes: (id, notes) =>
                set((state) => ({
                    monsters: state.monsters.map((m) =>
                        m.id === id ? { ...m, notes } : m
                    ),
                    lastUpdated: Date.now(),
                })),

            setMonsters: (monsters) =>
                set({ monsters, lastUpdated: Date.now() }),

            reset: () =>
                set({
                    monsters: [],
                    lastUpdated: Date.now(),
                }),
        }),
        {
            name: 'combat-local-storage',
        }
    )
);
