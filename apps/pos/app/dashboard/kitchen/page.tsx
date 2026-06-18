'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Clock, CheckCircle } from 'lucide-react';
import { PageHeader } from '@/app/components/layout/PageHeader';

import { Button } from '@/app/components/ui/Button';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { useOrders } from '@/app/hooks/useOrders';
import { useMinuteTick } from '@/app/hooks/useMinuteTick';
import { useOrderStore } from '@/app/stores/orderStore';
import { useAuthStore } from '@/app/stores/authStore';
import { updateItemStatus } from '@/app/lib/api';
import { formatOrderNumber, parseApiDate } from '@/app/lib/format';
import { cn } from '@/app/lib/utils';
import toast from 'react-hot-toast';

function getWaitMinutes(createdAt: string) {
  return Math.floor((Date.now() - parseApiDate(createdAt).getTime()) / 60000);
}

function WaitBadge({ minutes }: { minutes: number }) {
  const color = minutes > 10 ? 'bg-error' : minutes > 5 ? 'bg-warning' : 'bg-success';
  return (
    <span className={cn('text-white text-xs font-bold px-2 py-0.5 rounded-full', color)}>
      {minutes} phút
    </span>
  );
}

function ItemStatusBtn({ item, onUpdate }: { item: any; onUpdate: () => void }) {
  const [loading, setLoading] = useState(false);
  const status = item.item_status;

  const handleClick = async () => {
    const nextStatus = status === 'PENDING' ? 'COOKING' : status === 'COOKING' ? 'SERVED' : null;
    if (!nextStatus) return;
    setLoading(true);
    try {
      await updateItemStatus(item.id, { item_status: nextStatus });
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi cập nhật');
    }
    setLoading(false);
  };

  if (status === 'SERVED') {
    return (
      <span className="flex items-center gap-1 text-xs text-success font-medium">
        <CheckCircle className="w-3.5 h-3.5" /> Đã xong
      </span>
    );
  }

  return (
    <Button
      size="sm"
      variant={status === 'PENDING' ? 'secondary' : 'primary'}
      loading={loading}
      onClick={handleClick}
    >
      {status === 'PENDING' ? 'Chế biến' : 'Xong'}
    </Button>
  );
}

export default function KitchenPage() {
  const { user } = useAuthStore();
  const { orders } = useOrderStore();
  const { fetchOrders, loading } = useOrders();

  useMinuteTick();

  useEffect(() => {
    if (user?.store_id) fetchOrders(user.store_id);
  }, [user?.store_id, fetchOrders]);

  const kitchenOrders = useMemo(() => {
    return orders
      .filter(
        (o) =>
          o.order_status === 'CONFIRMED' &&
          o.items?.some((it: any) => ['PENDING', 'COOKING'].includes(it.item_status))
      )
      .sort((a, b) => parseApiDate(a.created_at).getTime() - parseApiDate(b.created_at).getTime());
  }, [orders]);

  const handleRefresh = () => {
    if (user?.store_id) fetchOrders(user.store_id);
  };

  return (
    <div>
      <PageHeader title="Bếp — Chế biến" subtitle="Theo dõi và cập nhật trạng thái món" />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <Skeleton className="h-64 rounded-xl" count={4} />
        </div>
      ) : kitchenOrders.length === 0 ? (
        <EmptyState
          icon={<ChefHat className="w-12 h-12" />}
          title="Không có món cần chế biến 🎉"
          description="Tất cả đơn hàng đã được xử lý"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {kitchenOrders.map((order) => {
            const waitMin = getWaitMinutes(order.created_at);
            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'bg-white border rounded-xl overflow-hidden',
                  waitMin > 10
                    ? 'border-error'
                    : waitMin > 5
                    ? 'border-warning'
                    : 'border-border'
                )}
              >
                {/* Ticket Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-bg-secondary border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{order.order_number || formatOrderNumber(order.id)}</span>
                    <span className="text-sm text-text-secondary">
                      {order.table?.table_number || 'Bàn ?'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-text-muted" />
                    <WaitBadge minutes={waitMin} />
                  </div>
                </div>

                {/* Items */}
                <div className="px-4 py-3 space-y-2">
                  {order.items
                    ?.filter((it: any) => ['PENDING', 'COOKING'].includes(it.item_status))
                    .map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 py-2 border-b border-border-light last:border-0"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-brand-primary">
                              {item.quantity}x
                            </span>
                            <span className="text-sm font-medium truncate">
                              {item.product?.name || `Món #${item.product_id}`}
                            </span>
                          </div>
                          {item.variant?.variant_name && (
                            <p className="text-xs text-text-muted ml-6">{item.variant.variant_name}</p>
                          )}
                          {item.note && (
                            <p className="text-xs text-warning ml-6 italic">📝 {item.note}</p>
                          )}
                        </div>
                        <ItemStatusBtn item={item} onUpdate={handleRefresh} />
                      </div>
                    ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
