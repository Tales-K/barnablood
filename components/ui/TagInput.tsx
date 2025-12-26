import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  allowDuplicates?: boolean;
}

export function TagInput({ tags, onChange, placeholder = '+ Tag', className = '', allowDuplicates = false }: TagInputProps) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const value = input.trim();
    if (!value) return;
    if (!allowDuplicates && tags.includes(value)) {
      setInput('');
      return;
    }
    onChange([...tags, value]);
    setInput('');
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter(t => t !== tag));
  };

  return (
    <div>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder={placeholder}
          className={`h-8 text-sm text-center ${className}`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => {
            if (e.key === 'Enter') addTag();
          }}
        />
        <Button type="button" size="sm" onClick={addTag} className="h-8 px-2">Add</Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="cursor-pointer"
              onClick={() => removeTag(tag)}
            >
              {tag} ×
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
