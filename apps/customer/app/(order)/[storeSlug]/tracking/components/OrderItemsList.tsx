'use client';

import { motion } from 'framer-motion';
import { formatPrice } from '../../../../lib/format';
import { ItemCookingTimer } from './ItemCookingTimer';

interface OrderItemsListProps {
  items: {
    id: number;
    productName: string;
    variantName?: string;
    quantity: number;
    price: number;
    subtotal: number;
    note?: string;
    orderRound: number;
    itemStatus: string;
    cookingStartedAt?: string;
    options: { name: string; price: number }[];
  }[];
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  PENDING: { label: 'Chờ chế biến', bg: '#FEF3C7', color: '#92400E' },
  COOKING: { label: 'Đang chế biến', bg: '#DBEAFE', color: '#1E40AF' },
  SERVED: { label: 'Đã phục vụ', bg: '#DCFCE7', color: '#166534' },
};

export function OrderItemsList({ items }: OrderItemsListProps) {
  // Group items by order_round
  const rounds = new Map<number, typeof items>();
  items.forEach((item) => {
    const round = item.orderRound || 1;
    if (!rounds.has(round)) rounds.set(round, []);
    rounds.get(round)!.push(item);
  });

  const sortedRounds = Array.from(rounds.entries()).sort(([a], [b]) => a - b);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {sortedRounds.map(([round, roundItems]) => (
        <div key={round}>
          {/* Round header */}
          {sortedRounds.length > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  height: 1,
                  flex: 1,
                  backgroundColor: '#E8E0D8',
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#A0785D',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                }}
              >
                {round === 1 ? 'Lượt gọi 1' : `Gọi thêm (Lượt ${round})`}
              </span>
              <div
                style={{
                  height: 1,
                  flex: 1,
                  backgroundColor: '#E8E0D8',
                }}
              />
            </div>
          )}

          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {roundItems.map((item, index) => {
              const statusConfig = STATUS_CONFIG[item.itemStatus] || STATUS_CONFIG.PENDING;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 10,
                    padding: '12px 14px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 14,
                    border: '1px solid #E8E0D8',
                  }}
                >
                  {/* Left: Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>
                        {item.quantity}x
                      </span>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#1A1A1A',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.productName}
                      </span>
                    </div>

                    {/* Variant + Options */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
                      {item.variantName && (
                        <span
                          style={{
                            fontSize: 11,
                            color: '#A0785D',
                            backgroundColor: '#FAF5F0',
                            padding: '1px 6px',
                            borderRadius: 4,
                          }}
                        >
                          {item.variantName}
                        </span>
                      )}
                      {item.options.map((opt) => (
                        <span
                          key={opt.name}
                          style={{
                            fontSize: 11,
                            color: '#6B6B6B',
                            backgroundColor: '#F3F4F6',
                            padding: '1px 6px',
                            borderRadius: 4,
                          }}
                        >
                          {opt.name}
                        </span>
                      ))}
                    </div>

                    {item.note && (
                      <p style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic', margin: 0 }}>
                        📝 {item.note}
                      </p>
                    )}

                    {/* Status badge + cooking timer */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', marginTop: 6 }}>
                      <motion.span
                        key={item.itemStatus}
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        style={{
                          display: 'inline-block',
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '3px 10px',
                          borderRadius: 20,
                          backgroundColor: statusConfig.bg,
                          color: statusConfig.color,
                        }}
                      >
                        {statusConfig.label}
                      </motion.span>
                      <ItemCookingTimer
                        itemStatus={item.itemStatus}
                        cookingStartedAt={item.cookingStartedAt}
                      />
                    </div>
                  </div>

                  {/* Right: Price */}
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#6F4E37',
                      flexShrink: 0,
                    }}
                  >
                    {formatPrice(item.subtotal)}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
