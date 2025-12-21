'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import MonsterStatBlock from '@/components/MonsterStatBlock';
import type { Monster } from '@/types/monster';

export default function MonsterViewPage() {
  const router = useRouter();
  const params = useParams();
  const [monster, setMonster] = useState<Monster | null>(null);
  const [loading, setLoading] = useState(true);

  const monsterId = params.id as string;

  useEffect(() => {
    async function loadMonster() {
      try {
        const response = await fetch(`/api/monsters/${monsterId}`);

        if (response.status === 401) {
          router.push('/login');
          return;
        }

        if (response.status === 404) {
          toast.error('Monster not found');
          router.push('/monsters');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch monster');
        }

        const data = await response.json();
        setMonster(data.monster);
      } catch (error) {
        console.error('Error fetching monster:', error);
        toast.error('Failed to load monster');
        router.push('/monsters');
      } finally {
        setLoading(false);
      }
    }

    if (monsterId) {
      loadMonster();
    }
  }, [monsterId, router]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this monster?')) {
      return;
    }

    try {
      const response = await fetch(`/api/monsters/${monsterId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete monster');
      }

      toast.success('Monster deleted successfully');
      router.push('/monsters');
    } catch (error) {
      console.error('Error deleting monster:', error);
      toast.error('Failed to delete monster');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading monster...</p>
        </div>
      </div>
    );
  }

  if (!monster) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Monster not found</h2>
          <Link href="/monsters">
            <Button>Back to Monsters</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-end gap-2 mb-4">
          <Link href={`/monsters/${monsterId}/edit`}>
            <Button>Edit Monster</Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
          <Link href="/monsters">
            <Button variant="outline">Back to List</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stat Block */}
          <div className="lg:col-span-2">
            <MonsterStatBlock monster={monster} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Image */}
            {monster.ImageURL && (
              <Card>
                <CardContent className="p-4">
                  <img
                    src={monster.ImageURL}
                    alt={monster.Name}
                    className="w-full rounded-lg object-cover"
                  />
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-semibold">{monster.Type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CR:</span>
                  <span className="font-semibold">{monster.Challenge}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">AC:</span>
                  <span className="font-semibold">{monster.AC.Value}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">HP:</span>
                  <span className="font-semibold">{monster.HP.Value}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Actions:</span>
                  <span className="font-semibold">{monster.Actions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Traits:</span>
                  <span className="font-semibold">{monster.Traits.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Initiative Info */}
            {(monster.InitiativeModifier !== undefined || monster.InitiativeAdvantage) && (
              <Card>
                <CardHeader>
                  <CardTitle>Initiative</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {monster.InitiativeModifier !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Modifier:</span>
                      <span className="font-semibold">
                        {monster.InitiativeModifier >= 0 ? '+' : ''}{monster.InitiativeModifier}
                      </span>
                    </div>
                  )}
                  {monster.InitiativeAdvantage && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Advantage:</span>
                      <span className="font-semibold text-green-600">Yes</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}