'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monster } from '@/types/monster';
import Link from 'next/link';
import Image from 'next/image';

interface MonsterSearchProps {
  availableMonsters: Array<{ id: string; monster: Monster }>;
  onSelectMonster: (monsterId: string) => void;
  emptyMessage?: string;
  emptyActionLink?: { href: string; label: string };
}

export function MonsterSearch({
  availableMonsters,
  onSelectMonster,
  emptyMessage = 'No monsters found.',
  emptyActionLink,
}: MonsterSearchProps) {
  const [nameQuery, setNameQuery] = useState('');
  const [tagQuery, setTagQuery] = useState('');

  const filteredMonsters = availableMonsters.filter(({ monster }) => {
    const nameMatch = !nameQuery || 
      (monster.Name || '').toLowerCase().includes(nameQuery.toLowerCase()) ||
      monster.Type.toLowerCase().includes(nameQuery.toLowerCase());

    // Support multiple tag queries, split by comma or space
    const tagTerms = tagQuery.split(/[,\s]+/).map(t => t.trim().toLowerCase()).filter(Boolean);
    const tags = (monster.SearchTags || []).map(t => t.toLowerCase());
    const tagMatch = tagTerms.length === 0 || tagTerms.every(term => tags.some(tag => tag.includes(term)));

    return nameMatch && tagMatch;
  });

  return (
    <>
      <div className="space-y-3">
        <div>
          <Label htmlFor="nameSearch">Search by Name/Type</Label>
          <Input
            id="nameSearch"
            placeholder="e.g., Goblin, Dragon..."
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="tagSearch">Search by Tag</Label>
          <Input
            id="tagSearch"
            placeholder="e.g., undead, boss..."
            value={tagQuery}
            onChange={(e) => setTagQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredMonsters.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {emptyMessage}{' '}
            {emptyActionLink && (
              <Link href={emptyActionLink.href} className="text-primary hover:underline">
                {emptyActionLink.label}
              </Link>
            )}
          </p>
        ) : (
          filteredMonsters.map(({ id, monster }) => (
            <Card
              key={id}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onSelectMonster(id)}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-4">
                  {monster.ImageURL && (
                    <Image
                      src={monster.ImageURL}
                      alt={monster.Name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{monster.Name}</h3>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {monster.Type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        CR {monster.Challenge}
                      </Badge>
                      {monster.SearchTags && monster.SearchTags.length > 0 && (
                        monster.SearchTags.slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">HP: {monster.HP.Value}</div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
