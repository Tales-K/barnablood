'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import MonsterStatBlock from '@/components/MonsterStatBlock';

export default function MonstersPage() {
  const router = useRouter();
  const [monsters, setMonsters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [monsterToDelete, setMonsterToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    async function loadMonsters() {
      try {
        const response = await fetch('/api/monsters', {
          cache: 'no-store',
        });
        
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch monsters');
        }
        
        const data = await response.json();
        setMonsters(data.monsters || []);
      } catch (error) {
        console.error('Error fetching monsters:', error);
        toast.error('Failed to load monsters');
      } finally {
        setLoading(false);
      }
    }
    
    loadMonsters();
  }, [router]);

  const handleDeleteMonster = async () => {
    if (!monsterToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/monsters?id=${monsterToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete monster');
      }

      toast.success(`${monsterToDelete.name} deleted successfully`);
      setMonsters(prev => prev.filter(m => m.id !== monsterToDelete.id));
      setDeleteDialogOpen(false);
      setMonsterToDelete(null);
    } catch (error) {
      console.error('Error deleting monster:', error);
      toast.error('Failed to delete monster');
    } finally {
      setIsDeleting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="bg-background flex items-center justify-center" style={{ minHeight: 'calc(100vh - var(--app-header-height))' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading monsters...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Your Monsters</h2>
            <p className="text-muted-foreground mt-1">Manage your D&D 5e monster collection</p>
          </div>
          <Link href="/monsters/new">
            <Button>Create Monster</Button>
          </Link>
        </div>
        
        {monsters.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No monsters yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Create your first monster to get started tracking combat encounters
              </p>
              <Link href="/monsters/new">
                <Button>Create Your First Monster</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {monsters.map(({ id, monster }: any) => (
                <div key={id} className="relative">
                  <MonsterStatBlock 
                    monster={monster}
                    dropdownOptions={[
                      {
                        label: 'Edit Monster',
                        onClick: () => router.push(`/monsters/${id}/edit`)
                      },
                      {
                        label: 'Delete Monster',
                        onClick: () => {
                          setMonsterToDelete({ id, name: monster.Name || 'Unnamed Monster' });
                          setDeleteDialogOpen(true);
                        },
                        variant: 'destructive' as const
                      }
                    ]}
                  />
                </div>
              ))}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Monster</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete <strong>{monsterToDelete?.name}</strong>? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDeleteDialogOpen(false);
                      setMonsterToDelete(null);
                    }}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteMonster}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </main>
    </div>
  );
}
