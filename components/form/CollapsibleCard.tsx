import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';

interface CollapsibleCardProps {
  id: string;
  title: string;
  children: React.ReactNode;
  badge?: number;
  expanded: boolean;
  onToggle: () => void;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

export function CollapsibleCard({
  id,
  title,
  children,
  badge,
  expanded,
  onToggle,
  actionButton,
}: CollapsibleCardProps) {
  return (
    <Card id={id}>
      <CardHeader
        className="cursor-pointer hover:bg-secondary/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CardTitle>{title}</CardTitle>
            {badge !== undefined && badge > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                {badge}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {actionButton && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  actionButton.onClick();
                }}
                className="flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                {actionButton.label}
              </Button>
            )}
            {expanded ? <ChevronUp /> : <ChevronDown />}
          </div>
        </div>
      </CardHeader>
      {expanded && <CardContent className="pt-4">{children}</CardContent>}
    </Card>
  );
}
