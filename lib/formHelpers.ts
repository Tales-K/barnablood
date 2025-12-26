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
        // Ensure correct type for setValue
        if (type === 'Actions' || type === 'LegendaryActions' || type === 'Reactions') {
            setValue(type, [...(arr as { Name: string; Content: string; Usage?: string }[]), empty as { Name: string; Content: string; Usage?: string }]);
        } else if (type === 'Saves' || type === 'Skills' || type === 'Traits') {
            setValue(type, [...(arr as { Name: string; Modifier: number }[]), empty as { Name: string; Modifier: number }]);
        }
    } else if (action === 'remove' && typeof index === 'number') {
        // Ensure correct type for setValue
        if (type === 'Actions' || type === 'LegendaryActions' || type === 'Reactions') {
            setValue(type, (arr as { Name: string; Content: string; Usage?: string }[]).filter((_, i) => i !== index));
        } else if (type === 'Saves' || type === 'Skills' || type === 'Traits') {
            setValue(type, (arr as { Name: string; Modifier: number }[]).filter((_, i) => i !== index));
        }
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
