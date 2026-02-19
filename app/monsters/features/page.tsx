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
import { CATEGORY_LABELS, CATEGORY_COLORS, type FeatureWithId, type FeatureCategory } from '@/types/feature';
import { toast } from 'sonner';

export default function MonsterFeaturesPage() {
    const [features, setFeatures] = useState<FeatureWithId[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Edit dialog
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingFeature, setEditingFeature] = useState<FeatureWithId | undefined>(undefined);

    // Delete confirmation dialog
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; feature: FeatureWithId | null }>({
        open: false,
        feature: null,
    });
    const [isDeleting, setIsDeleting] = useState(false);

    // Scope-conflict dialog (when editing a feature used by multiple monsters)
    const [scopeDialog, setScopeDialog] = useState<{
        open: boolean;
        featureId: string;
        category: FeatureCategory;
        feature: MonsterFeature;
        monsterCount: number;
    } | null>(null);

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
            const infoRes = await fetch(`/api/features/${featureId}`);
            const { monsterCount } = await infoRes.json() as { monsterCount: number };
            if (monsterCount > 1) {
                setScopeDialog({ open: true, featureId, category, feature, monsterCount });
            } else {
                await applyEdit(featureId, category, feature, 'all');
            }
        } catch {
            toast.error('Failed to update feature');
        }
    };

    const applyEdit = async (
        featureId: string,
        category: FeatureCategory,
        feature: MonsterFeature,
        scope: 'all' | 'this'
    ) => {
        const res = await fetch(`/api/features/${featureId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feature: { ...feature, Category: category }, scope }),
        });
        if (!res.ok) { toast.error('Failed to update feature'); return; }
        const result = await res.json();
        const updatedId = result.newFeatureId as string;
        const updated: FeatureWithId = { ...feature, Category: category, id: updatedId };
        setFeatures(prev => prev.map(f => (f.id === featureId ? updated : f)));
        toast.success('Feature updated');
    };

    const openDelete = (feature: FeatureWithId) => {
        setDeleteDialog({ open: true, feature });
    };

    const handleConfirmDelete = async () => {
        if (!deleteDialog.feature) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/features/${deleteDialog.feature.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
            setFeatures(prev => prev.filter(f => f.id !== deleteDialog.feature!.id));
            toast.success('Feature deleted');
        } catch {
            toast.error('Failed to delete feature');
        } finally {
            setIsDeleting(false);
            setDeleteDialog({ open: false, feature: null });
        }
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

            {/* Scope conflict dialog */}
            {scopeDialog && (
                <Dialog open={scopeDialog.open} onOpenChange={(open) => !open && setScopeDialog(null)}>
                    <DialogContent className="max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Update Feature</DialogTitle>
                            <DialogDescription>
                                This feature is used by <strong>{scopeDialog.monsterCount}</strong> monsters. How would you like to apply the changes?
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-3 pt-2">
                            <Button
                                onClick={async () => {
                                    setScopeDialog(null);
                                    await applyEdit(scopeDialog.featureId, scopeDialog.category, scopeDialog.feature, 'all');
                                }}
                            >
                                Update all {scopeDialog.monsterCount} monsters
                            </Button>
                            <Button
                                variant="outline"
                                onClick={async () => {
                                    setScopeDialog(null);
                                    await applyEdit(scopeDialog.featureId, scopeDialog.category, scopeDialog.feature, 'this');
                                }}
                            >
                                Detach — only update in this view
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete confirmation */}
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

