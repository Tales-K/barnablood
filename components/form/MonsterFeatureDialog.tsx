'use client';

import { useState, useMemo, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    FEATURE_CATEGORIES,
    CATEGORY_LABELS,
    CATEGORY_COLORS,
    type FeatureCategory,
    type FeatureWithId,
} from '@/types/feature';

export type { FeatureCategory };
export interface MonsterFeature {
    Name: string;
    Content: string;
    Usage?: string;
}

interface MonsterFeatureDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Called when the user confirms. featureId is passed when editing an existing feature. */
    onSave: (category: FeatureCategory, feature: MonsterFeature, featureId?: string) => void;
    /** Features from the features collection — used for the "Import" tab. */
    availableFeatures: FeatureWithId[];
    /** When provided the dialog opens in edit mode pre-populated with feature data. */
    editingFeature?: FeatureWithId;
}

export function MonsterFeatureDialog({
    open,
    onOpenChange,
    onSave,
    availableFeatures,
    editingFeature,
}: MonsterFeatureDialogProps) {
    const isEditing = Boolean(editingFeature);

    const [mode, setMode] = useState<'new' | 'import'>('new');
    const [category, setCategory] = useState<FeatureCategory>('Traits');
    const [name, setName] = useState('');
    const [usage, setUsage] = useState('');
    const [content, setContent] = useState('');
    const [search, setSearch] = useState('');
    const [errors, setErrors] = useState<{ name?: string; content?: string }>({});

    // Pre-populate form when editing
    useEffect(() => {
        if (open && editingFeature) {
            setCategory(editingFeature.Category);
            setName(editingFeature.Name);
            setUsage(editingFeature.Usage ?? '');
            setContent(editingFeature.Content);
            setErrors({});
            setMode('new');
        }
    }, [open, editingFeature]);

    const filteredFeatures = useMemo(() => {
        if (!search.trim()) return availableFeatures;
        const lower = search.toLowerCase();
        return availableFeatures.filter(
            (f) =>
                f.Name.toLowerCase().includes(lower) ||
                CATEGORY_LABELS[f.Category].toLowerCase().includes(lower)
        );
    }, [availableFeatures, search]);

    const resetForm = () => {
        setName('');
        setUsage('');
        setContent('');
        setSearch('');
        setErrors({});
        setCategory('Traits');
    };

    const handleOpenChange = (val: boolean) => {
        if (!val) {
            resetForm();
            if (!isEditing) setMode('new');
        }
        onOpenChange(val);
    };

    const handleSave = () => {
        const errs: typeof errors = {};
        if (!name.trim()) errs.name = 'Name is required';
        if (!content.trim()) errs.content = 'Description is required';
        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }
        onSave(
            category,
            { Name: name.trim(), Content: content.trim(), Usage: usage.trim() || undefined },
            editingFeature?.id
        );
        resetForm();
        onOpenChange(false);
    };

    const handleImport = (feature: FeatureWithId) => {
        setCategory(feature.Category);
        setName(feature.Name);
        setUsage(feature.Usage ?? '');
        setContent(feature.Content);
        setErrors({});
        setMode('new');
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit Monster Feature' : 'Add Monster Feature'}
                    </DialogTitle>
                </DialogHeader>

                {/* Mode toggle — hidden when editing an existing feature */}
                {!isEditing && (
                    <div className="flex border rounded-md overflow-hidden shrink-0">
                        {(['new', 'import'] as const).map((m) => (
                            <button
                                key={m}
                                type="button"
                                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                                    mode === m
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                                onClick={() => setMode(m)}
                            >
                                {m === 'new' ? 'New Feature' : 'Import from Feature Library'}
                            </button>
                        ))}
                    </div>
                )}

                <div className="overflow-y-auto flex-1">
                    {mode === 'new' ? (
                        <div className="space-y-4 py-1">
                            {/* Type — native select avoids Radix portal z-index issues */}
                            <div>
                                <Label htmlFor="feat-category">Type</Label>
                                <div className="relative mt-1">
                                    <select
                                        id="feat-category"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value as FeatureCategory)}
                                        className="w-full rounded-md border border-input bg-background text-foreground px-3 py-2 pr-8 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer"
                                    >
                                        {FEATURE_CATEGORIES.map((k) => (
                                            <option key={k} value={k} className="bg-background text-foreground">
                                                {CATEGORY_LABELS[k]}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-muted-foreground">
                                        ▾
                                    </span>
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <Label htmlFor="feat-name">Name *</Label>
                                <Input
                                    id="feat-name"
                                    className="mt-1"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        if (errors.name)
                                            setErrors((prev) => ({ ...prev, name: undefined }));
                                    }}
                                    placeholder="e.g., Pack Tactics"
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive mt-1">{errors.name}</p>
                                )}
                            </div>

                            {/* Usage */}
                            <div>
                                <Label htmlFor="feat-usage">Usage</Label>
                                <Input
                                    id="feat-usage"
                                    className="mt-1"
                                    value={usage}
                                    onChange={(e) => setUsage(e.target.value)}
                                    placeholder="e.g., Recharge 5-6"
                                />
                            </div>

                            {/* Content */}
                            <div>
                                <Label htmlFor="feat-content">Description *</Label>
                                <textarea
                                    id="feat-content"
                                    value={content}
                                    onChange={(e) => {
                                        setContent(e.target.value);
                                        if (errors.content)
                                            setErrors((prev) => ({ ...prev, content: undefined }));
                                    }}
                                    placeholder="Describe what this feature does..."
                                    rows={4}
                                    className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                                />
                                {errors.content && (
                                    <p className="text-sm text-destructive mt-1">{errors.content}</p>
                                )}
                            </div>

                            <Button type="button" onClick={handleSave} className="w-full">
                                {isEditing ? 'Save Changes' : 'Add Feature'}
                            </Button>
                        </div>
                    ) : (
                        /* Import tab */
                        <div className="space-y-3 py-1">
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search features..."
                                autoFocus
                            />
                            {filteredFeatures.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    {availableFeatures.length === 0
                                        ? 'No features in the library yet.'
                                        : 'No features match your search.'}
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {filteredFeatures.map((feature) => (
                                        <button
                                            key={feature.id}
                                            type="button"
                                            className="w-full text-left border rounded-md p-3 hover:bg-muted/50 transition-colors space-y-1"
                                            onClick={() => handleImport(feature)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`text-xs font-medium px-2 py-0.5 rounded border shrink-0 ${CATEGORY_COLORS[feature.Category]}`}
                                                >
                                                    {CATEGORY_LABELS[feature.Category]}
                                                </span>
                                                <span className="font-medium text-sm truncate">
                                                    {feature.Name}
                                                </span>
                                            </div>
                                            {feature.Usage && (
                                                <p className="text-xs text-muted-foreground">
                                                    {feature.Usage}
                                                </p>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

