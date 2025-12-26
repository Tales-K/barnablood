import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Monster } from '@/types/monster';

// Handles add/remove for all dynamic arrays
export function handleDynamicField({ type, action, setValue, watch, index }: {
    type: 'Saves' | 'Skills' | 'Traits' | 'Actions' | 'Reactions' | 'LegendaryActions';
    action: 'add' | 'remove';
    setValue: UseFormSetValue<Monster>;
    watch: UseFormWatch<Monster>;
    index?: number;
}) {
    const arr = watch(type) || [];
    if (action === 'add') {
        let empty;
        switch (type) {
            case 'Saves':
                empty = { Name: '', Modifier: 0 };
                break;
            case 'Skills':
                empty = { Name: '', Modifier: 0 };
                break;
            case 'Traits':
            case 'Actions':
            case 'Reactions':
            case 'LegendaryActions':
                empty = { Name: '', Content: '', Usage: '' };
                break;
            default:
                empty = {};
        }
        setValue(type, [...arr, empty]);
    } else if (action === 'remove' && typeof index === 'number') {
        setValue(type, arr.filter((_: any, i: number) => i !== index));
    }
}

// Handles comma separated changes
export function handleCommaSeparatedChange(
    e: React.ChangeEvent<HTMLInputElement>,
    setValue: any,
    field: string
) {
    const values = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
    setValue(field, values);
}
