import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ChangeEntry {
    version: string;
    date?: string;
    sections: {
        label: 'Added' | 'Changed' | 'Fixed' | 'Removed';
        items: string[];
    }[];
}

const BADGE_COLORS: Record<string, string> = {
    Added: 'bg-green-500/20 text-green-400 border-green-500/30',
    Changed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Fixed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Removed: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const changelog: ChangeEntry[] = [
    {
        version: '0.2.2',
        sections: [
            {
                label: 'Fixed',
                items: [
                    'Firebase Admin SDK now initializes lazily (on first request) — fixes Railway build failure caused by missing env vars at compile time',
                    'firestoreCombat and firestoreFeatures updated to use lazy getDb() — no more broken db import at module load',
                ],
            },
            {
                label: 'Changed',
                items: [
                    'GCS and Firebase credentials now read from individual env vars (GCS_* and FIREBASE_*) — no JSON blobs required',
                ],
            },
        ],
    },
    {
        version: '0.2.1',
        sections: [
            {
                label: 'Added',
                items: [
                    'Monsters page: tag-based accordion grouping — each tag is a collapsible group with a monster count badge',
                    'Search bar on monsters page filters by name or tag across all groups',
                    'Expand / Collapse all groups toggle button',
                    'Divider between tag groups; monsters with no tags appear under "Untagged" (shown last)',
                ],
            },
        ],
    },
    {
        version: '0.2.0',
        sections: [
            {
                label: 'Added',
                items: [
                    'Features collection — monster features are now stored as a dedicated Firestore collection, shared across monsters',
                    'Feature library — Monster Features page now shows, edits, and deletes features with confirmation prompts',
                    'Edit features in monster form — each feature row now has an edit button',
                    'Import from feature library — Add Monster Feature dialog now imports from the shared feature library',
                    'Multi-monster conflict resolution — editing a shared feature asks whether to update all monsters or only the current one',
                    'Centralized app version sourced from lib/version.ts, shown in header',
                    'Login-time migration — existing embedded features are automatically extracted into the features collection on first login',
                    'Changelog page',
                ],
            },
            {
                label: 'Changed',
                items: [
                    'Feature type dropdown now uses a native <select> element (fixes z-index conflict inside dialogs)',
                    'Feature description textarea now has a transparent background matching other inputs',
                    'Combat session persists as a single active document per user (event-driven save, no more interval polling)',
                ],
            },
        ],
    },
    {
        version: '0.1.2',
        date: '2025-12-26',
        sections: [
            {
                label: 'Added',
                items: [
                    'TagInput component for reusable tag/condition input',
                    'Multi-tag support for monsters (SearchTags field)',
                    'Monster search now matches all entered tags',
                    'Error highlighting and auto-expansion for form sections with validation errors',
                    'CollapsibleCard and FieldWithError components',
                    'HP in combat can now go below 0 or above max HP',
                    'Monster download and upload buttons',
                ],
            },
            {
                label: 'Fixed',
                items: [
                    'Error highlighting for dynamically added fields',
                    'Edit monster link bug (UUID cut at first dash)',
                ],
            },
        ],
    },
    {
        version: '0.1.1',
        sections: [{ label: 'Added', items: ['Project published live on Railway'] }],
    },
    {
        version: '0.1.0',
        sections: [{ label: 'Added', items: ['Initial project setup'] }],
    },
];

export default function ChangelogPage() {
    return (
        <div className="bg-background">
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-foreground">Changelog</h2>
                    <p className="text-muted-foreground mt-1">BarnaBlood version history</p>
                </div>

                <div className="space-y-6">
                    {changelog.map((entry) => (
                        <Card key={entry.version} className="bg-card border-border">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-3">
                                    <span>v{entry.version}</span>
                                    {entry.date && (
                                        <span className="text-sm font-normal text-muted-foreground">
                                            {entry.date}
                                        </span>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {entry.sections.map((section) => (
                                    <div key={section.label}>
                                        <Badge
                                            variant="outline"
                                            className={`mb-2 ${BADGE_COLORS[section.label]}`}
                                        >
                                            {section.label}
                                        </Badge>
                                        <ul className="space-y-1">
                                            {section.items.map((item, i) => (
                                                <li
                                                    key={i}
                                                    className="text-sm text-muted-foreground flex gap-2"
                                                >
                                                    <span className="text-foreground mt-0.5">•</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    );
}
