'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown, Search } from 'lucide-react';
import { toast } from 'sonner';
import MonsterStatBlock from '@/components/MonsterStatBlock';

type MonsterItem = { id: string; monster: any };

function useGroupedMonsters(monsters: MonsterItem[], search: string) {
  return useMemo(() => {
    const q = search.toLowerCase().trim();
    const filtered = q
      ? monsters.filter(({ monster }) =>
          monster.Name?.toLowerCase().includes(q) ||
          (monster.SearchTags || []).some((t: string) => t.toLowerCase().includes(q))
        )
      : monsters;

    const map: Record<string, MonsterItem[]> = {};
    for (const item of filtered) {
      const tags: string[] = item.monster.SearchTags?.length ? item.monster.SearchTags : ['Untagged'];
      for (const tag of tags) {
        (map[tag] ??= []).push(item);
      }
    }

    return Object.entries(map).sort(([a], [b]) => {
      if (a === 'Untagged') return 1;
      if (b === 'Untagged') return -1;
      return a.localeCompare(b);
    });
  }, [monsters, search]);
}

export default function MonstersPage() {
  const router = useRouter();
  const [monsters, setMonsters] = useState<MonsterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [monsterToDelete, setMonsterToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetch('/api/monsters', { cache: 'no-store' })
      .then(async (res) => {
        if (res.status === 401) { router.push('/login'); return; }
        if (!res.ok) throw new Error();
        const data = await res.json();
        const list: MonsterItem[] = data.monsters || [];
        setMonsters(list);
        // Start all groups expanded
        const allTags = new Set<string>();
        for (const { monster } of list) {
          const tags: string[] = monster.SearchTags?.length ? monster.SearchTags : ['Untagged'];
          tags.forEach(t => allTags.add(t));
        }
        setExpandedGroups(allTags);
      })
      .catch(() => toast.error('Failed to load monsters'))
      .finally(() => setLoading(false));
  }, [router]);

  const groups = useGroupedMonsters(monsters, search);

  // Expand all groups when search is active so results are visible
  useEffect(() => {
    if (search) setExpandedGroups(new Set(groups.map(([tag]) => tag)));
  }, [search, groups]);

  const allExpanded = groups.every(([tag]) => expandedGroups.has(tag));

  const toggleAll = useCallback(() => {
    if (allExpanded) {
      setExpandedGroups(new Set());
    } else {
      setExpandedGroups(new Set(groups.map(([tag]) => tag)));
    }
  }, [allExpanded, groups]);

  const toggleGroup = (tag: string) =>
    setExpandedGroups(prev => {
      const next = new Set(prev);
      next.has(tag) ? next.delete(tag) : next.add(tag);
      return next;
    });

  const confirmDelete = (id: string, name: string) => {
    setMonsterToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteMonster = async () => {
    if (!monsterToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/monsters?id=${monsterToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success(`${monsterToDelete.name} deleted`);
      setMonsters(prev => prev.filter(m => m.id !== monsterToDelete.id));
      setDeleteDialogOpen(false);
      setMonsterToDelete(null);
    } catch {
      toast.error('Failed to delete monster');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-background flex items-center justify-center" style={{ minHeight: 'calc(100vh - var(--app-header-height))' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading monsters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Your Monsters</h2>
            <p className="text-muted-foreground mt-1">Manage your D&D 5e monster collection</p>
          </div>
          <Link href="/monsters/new">
            <Button>Create Monster</Button>
          </Link>
        </div>

        {monsters.length === 0 ? (
          <div className="p-12 text-center rounded-lg border">
            <h3 className="text-xl font-semibold text-foreground mb-2">No monsters yet</h3>
            <p className="text-muted-foreground mb-6">Create your first monster to get started</p>
            <Link href="/monsters/new"><Button>Create Your First Monster</Button></Link>
          </div>
        ) : (
          <>
            {/* Search + expand toggle toolbar */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search by name or tag…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAll}
                className="shrink-0 flex items-center gap-1.5"
                title={allExpanded ? 'Collapse all groups' : 'Expand all groups'}
              >
                {allExpanded
                  ? <><ChevronsDownUp className="h-4 w-4" /> Collapse all</>
                  : <><ChevronsUpDown className="h-4 w-4" /> Expand all</>
                }
              </Button>
            </div>

            {groups.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No monsters match your search.</p>
            ) : (
              <div className="space-y-2">
                {groups.map(([tag, items], groupIdx) => {
                  const isOpen = expandedGroups.has(tag);
                  return (
                    <div key={tag}>
                      {groupIdx > 0 && <Separator className="mb-2" />}

                      {/* Group header */}
                      <button
                        type="button"
                        onClick={() => toggleGroup(tag)}
                        className="w-full flex items-center gap-3 py-2 px-1 rounded-md hover:bg-muted/50 transition-colors group"
                      >
                        {isOpen
                          ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                          : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        }
                        <span className="font-semibold text-foreground">{tag}</span>
                        <Badge variant="outline" className="text-xs ml-1">
                          {items.length}
                        </Badge>
                      </button>

                      {/* Monster grid */}
                      {isOpen && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-3 pl-7">
                          {items.map(({ id, monster }) => (
                            <MonsterStatBlock
                              key={id}
                              monster={monster}
                              dropdownOptions={[
                                { label: 'Edit Monster', onClick: () => router.push(`/monsters/${id}/edit`) },
                                {
                                  label: 'Delete Monster',
                                  onClick: () => confirmDelete(id, monster.Name || 'Unnamed Monster'),
                                  variant: 'destructive' as const,
                                },
                              ]}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Delete confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Monster</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{monsterToDelete?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteDialogOpen(false); setMonsterToDelete(null); }} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteMonster} disabled={isDeleting}>
              {isDeleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

