'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  X,
  ChevronRight,
} from 'lucide-react';
import { PageHeader } from '@/app/components/layout/PageHeader';
import { Tabs } from '@/app/components/ui/Tabs';
import { SearchInput } from '@/app/components/ui/SearchInput';
import { Badge } from '@/app/components/ui/Badge';
import { Button } from '@/app/components/ui/Button';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { ConfirmDialog } from '@/app/components/ui/ConfirmDialog';
import { useOrders } from '@/app/hooks/useOrders';
import { useSocket } from '@/app/hooks/useSocket';
import { useOrderStore } from '@/app/stores/orderStore';
import { useAuthStore } from '@/app/stores/authStore';
import { formatPrice, formatOrderNumber, getRelativeTime } from '@/app/lib/format';
import { cn } from '@/app/lib/utils';

const statusTabs = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ xử lý' },
  { key: 'CONFIRMED', label: 'Đã xác nhận' },
  { key: 'COMPLETED', label: 'Hoàn thành' },
];

const statusConfig: Record<string, { color: string; border: string; icon: React.ReactNode }> = {
  PENDING: { color: 'pending', border: 'border-l-warning', icon: <Clock className="w-4 h-4" /> },
  CONFIRMED: { color: 'confirmed', border: 'border-l-info', icon: <CheckCircle2 className="w-4 h-4" /> },
  COMPLETED: { color: 'completed', border: 'border-l-success', icon: <CheckCircle2 className="w-4 h-4" /> },
  REJECTED: { color: 'cancelled', border: 'border-l-error', icon: <XCircle className="w-4 h-4" /> },
};

export default function OrdersPage() {
  const { user } = useAuthStore();
  const { orders } = useOrderStore();
  const { fetchOrders, confirmOrder, rejectOrder, payOrder, loading } = useOrders();
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; orderId: number | null }>({
    open: false,
    orderId: null,
  });
  const [rejectReason, setRejectReason] = useState('');

  useSocket(user?.store_id);

  useEffect(() => {
    if (user?.store_id) fetchOrders(user.store_id);
  }, [user?.store_id, fetchOrders]);

  const filteredOrders = useMemo(() => {
    let filtered = orders;
    if (activeTab !== 'ALL') {
      filtered = filtered.filter((o) => o.order_status === activeTab);
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          String(o.order_number).includes(s) ||
          o.table_number?.toLowerCase().includes(s)
      );
    }
    return filtered;
  }, [orders, activeTab, search]);

  const counts = useMemo(
    () => ({
      PENDING: orders.filter((o) => o.order_status === 'PENDING').length,
      CONFIRMED: orders.filter((o) => o.order_status === 'CONFIRMED').length,
      COMPLETED: orders.filter((o) => ['COMPLETED', 'REJECTED'].includes(o.order_status)).length,
    }),
    [orders]
  );

  const tabsWithCount = statusTabs.map((t) => ({
    ...t,
    count: t.key === 'ALL' ? orders.length : (counts as any)[t.key] ?? 0,
  }));

  const handleReject = async () => {
    if (rejectDialog.orderId) {
      await rejectOrder(rejectDialog.orderId, rejectReason);
      setRejectDialog({ open: false, orderId: null });
      setRejectReason('');
      if (user?.store_id) fetchOrders(user.store_id);
    }
  };

  return (
    <div>
      <PageHeader title="Đơn hàng" subtitle="Quản lý và xử lý đơn hàng">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Tìm đơn hàng..."
          className="w-64"
        />
      </PageHeader>

      <Tabs tabs={tabsWithCount} activeKey={activeTab} onChange={setActiveTab} className="mb-6" />

      {/* Order Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <Skeleton className="h-48 rounded-xl" count={6} />
        </div>
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="w-12 h-12" />}
          title="Chưa có đơn hàng"
          description="Đơn hàng mới sẽ hiển thị ở đây khi khách đặt món"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredOrders.map((order) => {
              const config = statusConfig[order.order_status] || statusConfig.PENDING;
              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setSelectedOrder(order)}
                  className={cn(
                    'bg-white border rounded-xl p-4 cursor-pointer hover:shadow-card-hover transition-all border-l-4',
                    config.border
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text-primary">
                        {formatOrderNumber(order.order_number)}
                      </span>
                      <Badge variant={config.color as any}>
                        {order.order_status === 'PENDING' && 'Chờ'}
                        {order.order_status === 'CONFIRMED' && 'Đã xác nhận'}
                        {order.order_status === 'COMPLETED' && 'Hoàn thành'}
                        {order.order_status === 'REJECTED' && 'Từ chối'}
                      </Badge>
                    </div>
                    <span className="text-xs text-text-muted">
                      {getRelativeTime(order.created_at)}
                    </span>
                  </div>

                  <div className="text-sm text-text-secondary mb-3">
                    Bàn {order.table_number || '?'}
                    {order.table_area && (
                      <span className="ml-2 text-xs px-1.5 py-0.5 bg-bg-secondary rounded">
                        {order.table_area}
                      </span>
                    )}
                  </div>

                  {/* Items preview */}
                  <div className="space-y-1 mb-3">
                    {order.items?.slice(0, 3).map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-text-primary truncate">
                          {item.quantity}x {item.product_name}
                        </span>
                        <span className="text-text-secondary shrink-0">
                          {formatPrice(item.subtotal)}
                        </span>
                      </div>
                    ))}
                    {(order.items?.length || 0) > 3 && (
                      <p className="text-xs text-text-muted">
                        + {order.items.length - 3} món khác
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border-light">
                    <span className="font-bold text-brand-primary text-lg">
                      {formatPrice(order.total_amount)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-text-muted" />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Order Detail Panel */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setSelectedOrder(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold">
                    {formatOrderNumber(selectedOrder.order_number)}
                  </span>
                  <Badge variant={(statusConfig[selectedOrder.order_status]?.color || 'default') as any}>
                    {selectedOrder.order_status}
                  </Badge>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 rounded-lg hover:bg-bg-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Panel Body */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Bàn</span>
                    <span className="font-medium">
                      Bàn {selectedOrder.table_number || '?'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Thời gian</span>
                    <span>{getRelativeTime(selectedOrder.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Thanh toán</span>
                    <Badge variant={selectedOrder.payment_status === 'PAID' ? 'completed' : 'pending'}>
                      {selectedOrder.payment_status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </Badge>
                  </div>
                </div>

                {/* Items */}
                <h3 className="font-semibold mb-3">Danh sách món</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-start p-3 bg-bg-secondary rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product_name}</p>
                        {item.variant_name && (
                          <p className="text-xs text-text-muted">{item.variant_name}</p>
                        )}
                        {item.options?.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {item.options.map((opt: any, j: number) => (
                              <span key={j} className="text-[10px] px-1.5 py-0.5 bg-brand-light/30 text-brand-primary rounded">
                                {opt.option_name}
                              </span>
                            ))}
                          </div>
                        )}
                        {item.note && (
                          <p className="text-xs text-text-muted mt-1 italic">📝 {item.note}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-sm font-medium">{item.quantity} x {formatPrice(item.price)}</p>
                        <p className="text-xs text-text-secondary">{formatPrice(item.subtotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
                  <span className="text-lg font-semibold">Tổng cộng</span>
                  <span className="text-2xl font-bold text-brand-primary">
                    {formatPrice(selectedOrder.total_amount)}
                  </span>
                </div>
              </div>

              {/* Panel Actions */}
              <div className="px-6 py-4 border-t border-border space-y-2">
                {selectedOrder.order_status === 'PENDING' && (
                  <div className="flex gap-3">
                    <Button
                      variant="danger"
                      fullWidth
                      onClick={() =>
                        setRejectDialog({ open: true, orderId: selectedOrder.id })
                      }
                    >
                      Từ chối
                    </Button>
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={async () => {
                        await confirmOrder(selectedOrder.id);
                        if (user?.store_id) fetchOrders(user.store_id);
                        setSelectedOrder(null);
                      }}
                    >
                      Xác nhận
                    </Button>
                  </div>
                )}
                {selectedOrder.order_status === 'CONFIRMED' &&
                  selectedOrder.payment_status !== 'PAID' && (
                    <Button
                      variant="primary"
                      fullWidth
                      icon={<CreditCard className="w-4 h-4" />}
                      onClick={async () => {
                        await payOrder(selectedOrder.id);
                        if (user?.store_id) fetchOrders(user.store_id);
                        setSelectedOrder(null);
                      }}
                    >
                      Thanh toán
                    </Button>
                  )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Reject Dialog */}
      <ConfirmDialog
        isOpen={rejectDialog.open}
        onClose={() => setRejectDialog({ open: false, orderId: null })}
        onConfirm={handleReject}
        title="Từ chối đơn hàng"
        message="Bạn có chắc muốn từ chối đơn hàng này?"
        variant="danger"
        confirmLabel="Từ chối"
      />
    </div>
  );
}
