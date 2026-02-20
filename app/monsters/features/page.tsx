'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { MonsterFeatureDialog, type MonsterFeature } from '@/components/form/MonsterFeatureDialog';
import { FeatureScopeDialog, type MonsterInfo } from '@/components/form/FeatureScopeDialog';
import { CATEGORY_LABELS, CATEGORY_COLORS, type FeatureWithId, type FeatureCategory } from '@/types/feature';
import { toast } from 'sonner';

export default function MonsterFeaturesPage() {
    const [features, setFeatures] = useState<FeatureWithId[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Edit dialog
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingFeature, setEditingFeature] = useState<FeatureWithId | undefined>(undefined);

    // Scope dialog — shared for edit and delete (multi-monster)
    const [scopeDialog, setScopeDialog] = useState<{
        open: boolean;
        mode: 'edit' | 'delete';
        featureId: string;
        category: FeatureCategory;
        feature: MonsterFeature;
        monsters: MonsterInfo[];
    } | null>(null);

    // Simple delete confirm (used when monsterCount <= 1)
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; feature: FeatureWithId | null }>({
        open: false,
        feature: null,
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const reloadFeatures = () => {
        fetch('/api/features')
            .then(res => res.json())
            .then(data => setFeatures(data.features || []))
            .catch(err => console.error('Failed to reload features:', err));
    };

    useEffect(() => {
        fetch('/api/features')
            .then(res => res.json())
            .then(data => setFeatures(data.features || []))
            .catch(err => console.error('Failed to load features:', err))
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        if (!search.trim()) return features;
        const lower = search.toLowerCase();
        return features.filter(
            f =>
                f.Name.toLowerCase().includes(lower) ||
                CATEGORY_LABELS[f.Category].toLowerCase().includes(lower) ||
                f.Content.toLowerCase().includes(lower)
        );
    }, [features, search]);

    const openEdit = (feature: FeatureWithId) => {
        setEditingFeature(feature);
        setEditDialogOpen(true);
    };

    const handleEditSave = async (category: FeatureCategory, feature: MonsterFeature, featureId?: string) => {
        if (!featureId) return;
        try {
            const res = await fetch(`/api/features/${featureId}`);
            const { monsters } = await res.json() as { monsters: MonsterInfo[] };
            if (monsters.length > 1) {
                setScopeDialog({ open: true, mode: 'edit', featureId, category, feature, monsters });
            } else {
                await applyEditAll(featureId, category, feature);
            }
        } catch {
            toast.error('Failed to update feature');
        }
    };

    const applyEditAll = async (featureId: string, category: FeatureCategory, feature: MonsterFeature) => {
        const res = await fetch(`/api/features/${featureId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feature: { ...feature, Category: category }, scope: 'all' }),
        });
        if (!res.ok) { toast.error('Failed to update feature'); return; }
        const result = await res.json();
        const updated: FeatureWithId = { ...feature, Category: category, id: result.newFeatureId };
        setFeatures(prev => prev.map(f => (f.id === featureId ? updated : f)));
        toast.success('Feature updated');
    };

    const applyEditSelected = async (
        featureId: string, category: FeatureCategory, feature: MonsterFeature, monsterIds: string[]
    ) => {
        const res = await fetch(`/api/features/${featureId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feature: { ...feature, Category: category }, scope: 'selected', monsterIds }),
        });
        if (!res.ok) { toast.error('Failed to update feature'); return; }
        toast.success('New copy created and assigned to selected monsters');
        reloadFeatures();
    };

    const openDelete = async (feat: FeatureWithId) => {
        const count = feat.monsterCount ?? 0;
        if (count > 1) {
            try {
                const res = await fetch(`/api/features/${feat.id}`);
                const { monsters } = await res.json() as { monsters: MonsterInfo[] };
                setScopeDialog({ open: true, mode: 'delete', featureId: feat.id, category: feat.Category, feature: feat, monsters });
            } catch {
                toast.error('Failed to load monster list');
            }
        } else {
            setDeleteDialog({ open: true, feature: feat });
        }
    };

    const execDelete = async (featureId: string, monsterIds?: string[]) => {
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/features/${featureId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: monsterIds ? JSON.stringify({ monsterIds }) : undefined,
            });
            if (!res.ok) throw new Error();
            const result = await res.json() as { featureDeleted: boolean };
            if (result.featureDeleted) {
                setFeatures(prev => prev.filter(f => f.id !== featureId));
                toast.success('Feature deleted');
            } else {
                toast.success('Feature removed from selected monsters');
                reloadFeatures();
            }
        } catch {
            toast.error('Failed to delete feature');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteDialog.feature) return;
        await execDelete(deleteDialog.feature.id);
        setDeleteDialog({ open: false, feature: null });
    };

    return (
        <div className="bg-background">
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-foreground">Monster Features</h2>
                    <p className="text-muted-foreground mt-1">
                        Browse and manage all traits, actions, reactions and legendary actions
                    </p>
                </div>

                <Input
                    placeholder="Search by name, type, or description..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="mb-6"
                />

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                ) : filtered.length === 0 ? (
                    <Card className="p-12 text-center">
                        <p className="text-muted-foreground">
                            {search
                                ? 'No features match your search.'
                                : 'No features found. Add features to your monsters to see them here.'}
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((feat) => (
                            <Card key={feat.id} className="bg-card border-border">
                                <CardHeader className="pb-2">
                                    <div className="flex items-start gap-2 flex-wrap">
                                        <span
                                            className={`text-xs font-medium px-2 py-0.5 rounded border shrink-0 ${CATEGORY_COLORS[feat.Category]}`}
                                        >
                                            {CATEGORY_LABELS[feat.Category]}
                                        </span>
                                        <CardTitle className="text-base flex-1">{feat.Name}</CardTitle>
                                        {feat.Usage && (
                                            <span className="text-xs text-muted-foreground">({feat.Usage})</span>
                                        )}
                                        <span
                                            className="text-xs text-muted-foreground shrink-0"
                                            title={`Used by ${feat.monsterCount ?? 0} monster${(feat.monsterCount ?? 0) !== 1 ? 's' : ''}`}
                                        >
                                            {feat.monsterCount ?? 0} monster{(feat.monsterCount ?? 0) !== 1 ? 's' : ''}
                                        </span>
                                        <div className="flex gap-1 ml-auto shrink-0">
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                onClick={() => openEdit(feat)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                onClick={() => openDelete(feat)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{feat.Content}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

            {/* Edit dialog */}
            <MonsterFeatureDialog
                open={editDialogOpen}
                onOpenChange={(open) => {
                    if (!open) setEditingFeature(undefined);
                    setEditDialogOpen(open);
                }}
                onSave={handleEditSave}
                availableFeatures={features}
                editingFeature={editingFeature}
            />

            {/* Scope dialog — edit & delete (multi-monster) */}
            {scopeDialog && (
                <FeatureScopeDialog
                    open={scopeDialog.open}
                    onClose={() => setScopeDialog(null)}
                    mode={scopeDialog.mode}
                    monsters={scopeDialog.monsters}
                    onApplyToAll={() => {
                        const d = scopeDialog;
                        setScopeDialog(null);
                        if (d.mode === 'edit') {
                            applyEditAll(d.featureId, d.category, d.feature);
                        } else {
                            execDelete(d.featureId);
                        }
                    }}
                    onApplyToSelected={(monsterIds) => {
                        const d = scopeDialog;
                        setScopeDialog(null);
                        if (d.mode === 'edit') {
                            applyEditSelected(d.featureId, d.category, d.feature, monsterIds);
                        } else {
                            execDelete(d.featureId, monsterIds);
                        }
                    }}
                />
            )}

            {/* Simple delete confirm (monsterCount <= 1) */}
            <Dialog
                open={deleteDialog.open}
                onOpenChange={(open) => !open && setDeleteDialog({ open: false, feature: null })}
            >
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Feature</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{deleteDialog.feature?.Name}</strong>?
                            This will also remove it from all monsters that use it.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2 justify-end">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialog({ open: false, feature: null })}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

