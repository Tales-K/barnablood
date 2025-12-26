import React from 'react';

interface CommaFieldDisplayProps {
  value?: string[] | string | null;
  emptyText?: string;
}

export const CommaFieldDisplay: React.FC<CommaFieldDisplayProps> = ({ value, emptyText = '—' }) => {
  if (Array.isArray(value) && value.length > 0) {
    return <>{value.join(', ')}</>;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    return <>{value}</>;
  }
  return <>{emptyText}</>;
};
