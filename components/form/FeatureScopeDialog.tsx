'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export interface MonsterInfo {
    id: string;
    name: string;
}

interface FeatureScopeDialogProps {
    open: boolean;
    onClose: () => void;
    mode: 'edit' | 'delete';
    monsters: MonsterInfo[];
    /** Called when user chooses to apply to all monsters. */
    onApplyToAll: () => void;
    /**
     * Called when user picks a subset of monsters.
     * edit   → create a copy assigned only to those monsters
     * delete → remove the feature only from those monsters
     */
    onApplyToSelected: (monsterIds: string[]) => void;
}

type Step = 'choose' | 'select';

export function FeatureScopeDialog({
    open,
    onClose,
    mode,
    monsters,
    onApplyToAll,
    onApplyToSelected,
}: FeatureScopeDialogProps) {
    const [step, setStep] = useState<Step>('choose');
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const reset = () => {
        setStep('choose');
        setSelected(new Set());
    };

    const handleOpenChange = (val: boolean) => {
        if (!val) { reset(); onClose(); }
    };

    const toggleAll = () => {
        if (selected.size === monsters.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(monsters.map(m => m.id)));
        }
    };

    const toggle = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const handleConfirm = () => {
        onApplyToSelected(Array.from(selected));
        reset();
    };

    const allLabel = mode === 'edit'
        ? `Update all ${monsters.length} monsters`
        : `Delete from all ${monsters.length} monsters`;

    const selectedLabel = mode === 'edit'
        ? 'Create a copy for selected monsters'
        : 'Remove from selected monsters only';

    const selectTitle = mode === 'edit' ? 'Select Monsters' : 'Select Monsters';
    const selectDescription = mode === 'edit'
        ? 'A new copy of this feature will be created and assigned to the selected monsters. The rest will keep the original.'
        : 'The feature will be removed only from the selected monsters. Others will keep it.';

    const confirmLabel = mode === 'edit'
        ? `Apply to ${selected.size} monster${selected.size !== 1 ? 's' : ''}`
        : `Remove from ${selected.size} monster${selected.size !== 1 ? 's' : ''}`;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-sm" aria-describedby={undefined}>
                {step === 'choose' ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>{mode === 'edit' ? 'Update Feature' : 'Delete Feature'}</DialogTitle>
                            <DialogDescription>
                                This feature is used by <strong>{monsters.length}</strong> monsters. How would you like to apply the changes?
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-3 pt-2">
                            <Button
                                variant={mode === 'delete' ? 'destructive' : 'default'}
                                onClick={() => { handleOpenChange(false); onApplyToAll(); }}
                            >
                                {allLabel}
                            </Button>
                            <Button variant="outline" onClick={() => setStep('select')}>
                                {selectedLabel}
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>{selectTitle}</DialogTitle>
                            <DialogDescription>{selectDescription}</DialogDescription>
                        </DialogHeader>

                        {/* Select all toggle */}
                        <div className="flex items-center gap-2 border-b pb-2">
                            <Checkbox
                                id="select-all"
                                checked={selected.size === monsters.length}
                                onCheckedChange={toggleAll}
                            />
                            <Label htmlFor="select-all" className="cursor-pointer font-medium">
                                Select all
                            </Label>
                        </div>

                        <div className="max-h-56 overflow-y-auto space-y-2">
                            {monsters.map(m => (
                                <div key={m.id} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`ms-${m.id}`}
                                        checked={selected.has(m.id)}
                                        onCheckedChange={() => toggle(m.id)}
                                    />
                                    <Label htmlFor={`ms-${m.id}`} className="cursor-pointer">{m.name}</Label>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button variant="outline" onClick={() => setStep('choose')} className="flex-1">
                                Back
                            </Button>
                            <Button
                                variant={mode === 'delete' ? 'destructive' : 'default'}
                                onClick={handleConfirm}
                                disabled={selected.size === 0}
                                className="flex-1"
                            >
                                {confirmLabel}
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
