import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface FieldWithErrorProps {
  label: string;
  inputProps: any;
  error?: string;
  as?: 'input' | 'textarea';
  [key: string]: any;
}

export function FieldWithError({
  label,
  inputProps,
  error,
  as = 'input',
  ...rest
}: FieldWithErrorProps) {
  const InputComponent = as === 'textarea' ? Textarea : Input;
  return (
    <div {...rest}>
      <Label>{label}</Label>
      <InputComponent {...inputProps} aria-invalid={!!error} />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
