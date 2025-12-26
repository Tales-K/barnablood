import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CommaArrayInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  allowDuplicates?: boolean;
  label?: string;
}

export function CommaArrayInput({ values, onChange, placeholder = '+ Item', className = '', allowDuplicates = false, label }: CommaArrayInputProps) {
  const [input, setInput] = useState('');

  const addValue = () => {
    const value = input.trim();
    if (!value) return;
    if (!allowDuplicates && values.includes(value)) {
      setInput('');
      return;
    }
    onChange([...values, value]);
    setInput('');
  };

  const removeValue = (value: string) => {
    onChange(values.filter(t => t !== value));
  };

  return (
    <div>
      {label && <label className="block mb-1 text-sm font-medium">{label}</label>}
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder={placeholder}
          className={`h-8 text-sm text-center ${className}`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') addValue();
          }}
        />
        <Button type="button" size="sm" onClick={addValue}>
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {values.map((value, idx) => (
          <Badge
            key={idx}
            variant="secondary"
            className="cursor-pointer flex items-center gap-1"
          >
            {value}
            <button
              type="button"
              onClick={() => removeValue(value)}
              style={{ background: 'none', border: 'none', padding: 0, marginLeft: 4, cursor: 'pointer', color: 'inherit', fontSize: '1em', lineHeight: 1 }}
              aria-label={`Remove ${value}`}
            >
              ×
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
