'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import MonsterStatBlock from '@/components/MonsterStatBlock';

export default function MonstersPage() {
  const router = useRouter();
  const [monsters, setMonsters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [columnToggles, setColumnToggles] = useState<Record<string, boolean>>({});
  
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
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading monsters...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {monsters.map(({ id, monster }: any) => (
              <Card key={id} className="hover:shadow-lg transition-shadow bg-card border-border relative">
                <div className="absolute top-4 right-4 z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setColumnToggles(prev => ({ ...prev, [id]: !prev[id] }));
                      }}>
                        {columnToggles[id] ? 'Single Column' : 'Double Column'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/monsters/${id}`)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/monsters/${id}/edit`)}>
                        Edit Monster
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardContent className="pt-6">
                  <div className="flex justify-center">
                    <MonsterStatBlock 
                      monster={monster} 
                      showColumnToggle={false}
                      twoColumn={columnToggles[id]}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
