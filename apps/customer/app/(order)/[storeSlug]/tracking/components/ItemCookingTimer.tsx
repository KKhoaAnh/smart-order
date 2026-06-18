'use client';

import { Timer } from 'lucide-react';
import { useElapsedSeconds, formatElapsedClock } from '../../../../hooks/useElapsedTimer';

interface ItemCookingTimerProps {
  cookingStartedAt?: string;
  itemStatus: string;
}

export function ItemCookingTimer({ cookingStartedAt, itemStatus }: ItemCookingTimerProps) {
  const isCooking = itemStatus === 'COOKING';
  const elapsed = useElapsedSeconds(cookingStartedAt, isCooking && !!cookingStartedAt);

  if (!isCooking || !cookingStartedAt) return null;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        marginTop: 6,
        marginLeft: 6,
        fontSize: 11,
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
        padding: '3px 10px',
        borderRadius: 20,
        backgroundColor: '#EFF6FF',
        color: '#1D4ED8',
        border: '1px solid #BFDBFE',
      }}
    >
      <Timer size={12} strokeWidth={2.5} />
      {formatElapsedClock(elapsed)}
    </span>
  );
}
