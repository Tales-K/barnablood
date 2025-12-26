import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CombatMonster } from '@/types/monster';

interface CombatState {
    sessionId: string;
    monsters: CombatMonster[];
    lastUpdated: number;
    version: number;
    isSyncing: boolean;
    pendingChanges: boolean;

    // Actions
    addMonster: (monster: CombatMonster) => void;
    removeMonster: (id: string) => void;
    updateMonsterHP: (id: string, newHP: number) => void;
    addCondition: (id: string, condition: string) => void;
    removeCondition: (id: string, condition: string) => void;
    updateNotes: (id: string, notes: string) => void;
    reset: () => void;
    setVersion: (version: number) => void;
    setSyncing: (syncing: boolean) => void;
    markChangesPending: () => void;
    clearChangesPending: () => void;
}

export const useCombatStore = create<CombatState>()(
    persist(
        (set, get) => ({
            sessionId: crypto.randomUUID(),
            monsters: [],
            lastUpdated: Date.now(),
            version: 0,
            isSyncing: false,
            pendingChanges: false,

            addMonster: (monster) =>
                set((state) => ({
                    monsters: [...state.monsters, monster],
                    lastUpdated: Date.now(),
                    pendingChanges: true,
                })),

            removeMonster: (id) =>
                set((state) => ({
                    monsters: state.monsters.filter((m) => m.id !== id),
                    lastUpdated: Date.now(),
                    pendingChanges: true,
                })),

            updateMonsterHP: (id, newHP) =>
                set((state) => ({
                    monsters: state.monsters.map((m) =>
                        m.id === id ? { ...m, currentHP: newHP } : m
                    ),
                    lastUpdated: Date.now(),
                    pendingChanges: true,
                })),

            addCondition: (id, condition) =>
                set((state) => ({
                    monsters: state.monsters.map((m) =>
                        m.id === id && !m.conditions.includes(condition)
                            ? { ...m, conditions: [...m.conditions, condition] }
                            : m
                    ),
                    lastUpdated: Date.now(),
                    pendingChanges: true,
                })),

            removeCondition: (id, condition) =>
                set((state) => ({
                    monsters: state.monsters.map((m) =>
                        m.id === id
                            ? { ...m, conditions: m.conditions.filter((c) => c !== condition) }
                            : m
                    ),
                    lastUpdated: Date.now(),
                    pendingChanges: true,
                })),

            updateNotes: (id, notes) =>
                set((state) => ({
                    monsters: state.monsters.map((m) =>
                        m.id === id ? { ...m, notes } : m
                    ),
                    lastUpdated: Date.now(),
                    pendingChanges: true,
                })),

            reset: () =>
                set({
                    sessionId: crypto.randomUUID(),
                    monsters: [],
                    lastUpdated: Date.now(),
                    version: 0,
                    pendingChanges: true,
                }),

            setVersion: (version) => set({ version }),
            setSyncing: (isSyncing) => set({ isSyncing }),
            markChangesPending: () => set({ pendingChanges: true }),
            clearChangesPending: () => set({ pendingChanges: false }),
        }),
        {
            name: 'combat-local-storage',
        }
    )
);

// Debounce helper for auto-save
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
