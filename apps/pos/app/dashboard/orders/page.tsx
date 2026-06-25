'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search, Filter, Check, X, CreditCard, Clock, ChefHat,
  CheckCircle2, AlertCircle, XCircle, Hash, Users,
  Wallet, Package, UtensilsCrossed, CalendarDays,
} from 'lucide-react';
import { ordersApi } from '@/app/lib/api';
import { useAuthStore } from '@/app/stores/authStore';
import { useOrderStore } from '@/app/stores/orderStore';
import { formatCurrency, formatTime, formatDate, getOrderAmounts } from '@/app/lib/format';
import {
  ORDER_TIME_SECTIONS,
  groupOrdersByTimeSection,
  type OrderTimeSection,
} from '@/app/lib/order-groups';
import { cn } from '@/app/lib/utils';
import Badge from '@/app/components/ui/Badge';
import Button from '@/app/components/ui/Button';
import Modal from '@/app/components/ui/Modal';
import toast from 'react-hot-toast';

// Tabs filter for order status
const statusTabs = [
  { key: 'all', label: 'Tất cả', icon: Filter },
  { key: 'PENDING', label: 'Chờ xử lý', icon: Clock },
  { key: 'CONFIRMED', label: 'Đã xác nhận', icon: ChefHat },
  { key: 'COMPLETED', label: 'Hoàn thành', icon: CheckCircle2 },
  { key: 'CANCELLED', label: 'Đã hủy', icon: XCircle },
];

// Status badge mapping
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'PENDING':
      return { variant: 'pending' as const, label: 'Chờ xử lý' };
    case 'CONFIRMED':
      return { variant: 'confirmed' as const, label: 'Đã xác nhận' };
    case 'COMPLETED':
      return { variant: 'completed' as const, label: 'Hoàn thành' };
    case 'CANCELLED':
      return { variant: 'cancelled' as const, label: 'Đã hủy' };
    default:
      return { variant: 'default' as const, label: status };
  }
};

// Payment status badge
const getPaymentBadge = (status: string) => {
  switch (status) {
    case 'PAID':
      return { variant: 'completed' as const, label: 'Đã thanh toán', icon: CheckCircle2 };
    case 'UNPAID':
      return { variant: 'pending' as const, label: 'Chưa thanh toán', icon: Wallet };
    default:
      return { variant: 'default' as const, label: status, icon: Wallet };
  }
};

// Status color strip for card left border
const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'border-l-warning';
    case 'CONFIRMED': return 'border-l-info';
    case 'COMPLETED': return 'border-l-success';
    case 'CANCELLED': return 'border-l-error';
    default: return 'border-l-border';
  }
};

function getItemNames(items: any[]): string {
  if (!items || items.length === 0) return 'Chưa có món';
  const names = items
    .slice(0, 3)
    .map((item: any) => item.product?.name || `Sản phẩm #${item.product_id}`)
    .join(', ');
  if (items.length > 3) {
    return `${names} +${items.length - 3} món khác`;
  }
  return names;
}

function OrderAmountDisplay({ order }: { order: { total_amount?: number; discount_amount?: number; final_amount?: number } }) {
  const { total, discount, final } = getOrderAmounts(order);

  if (discount > 0) {
    return (
      <div className="text-right">
        <p className="text-xs text-text-muted line-through">{formatCurrency(total)}</p>
        <p className="text-lg font-bold text-brand-primary">{formatCurrency(final)}</p>
        <p className="text-[10px] font-semibold text-success">Giảm {formatCurrency(discount)}</p>
      </div>
    );
  }

  return (
    <span className="text-lg font-bold text-brand-primary">
      {formatCurrency(total)}
    </span>
  );
}

function OrderCard({
  order,
  index,
  onViewDetail,
  onConfirm,
  onReject,
  onPayment,
}: {
  order: any;
  index: number;
  onViewDetail: (order: any) => void;
  onConfirm: (id: number) => void;
  onReject: (order: any) => void;
  onPayment: (id: number) => void;
}) {
  const orderStatus = order.order_status || 'PENDING';
  const paymentStatus = order.payment_status || 'UNPAID';
  const statusBadge = getStatusBadge(orderStatus);
  const payBadge = getPaymentBadge(paymentStatus);
  const PayIcon = payBadge.icon;

  return (
    <div
      className={cn(
        'order-card bg-bg-card rounded-2xl p-5 border border-border cursor-pointer',
        'border-l-4',
        getStatusColor(orderStatus),
        'animate-slide-in-up'
      )}
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={() => onViewDetail(order)}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-brand-primary" />
            <span className="font-bold text-text-primary text-base">
              {order.order_number || `#${order.id}`}
            </span>
          </div>
          <p className="text-xs text-text-muted mt-0.5 ml-6">
            {formatTime(order.created_at)}
          </p>
        </div>
        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <UtensilsCrossed className="w-3.5 h-3.5 text-text-muted" />
          <span className="truncate text-xs">{getItemNames(order.items)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Users className="w-3.5 h-3.5 text-text-muted" />
          <span>Bàn {order.table?.table_number || '—'}</span>
          <span className="text-border">•</span>
          <Package className="w-3.5 h-3.5 text-text-muted" />
          <span>{order.items?.length || 0} món</span>
        </div>
      </div>

      <div className="mb-3">
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold',
            paymentStatus === 'PAID'
              ? 'bg-success-bg text-success'
              : 'bg-warning-bg text-warning'
          )}
        >
          <PayIcon className="w-3 h-3" />
          {payBadge.label}
        </span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border-light">
        <OrderAmountDisplay order={order} />
        <div className="flex gap-2">
          {orderStatus === 'PENDING' && (
            <>
              <button
                className="p-1.5 rounded-lg bg-error-bg text-error hover:bg-error/10 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onReject(order);
                }}
              >
                <X className="w-4 h-4" />
              </button>
              <button
                className="p-1.5 rounded-lg bg-success-bg text-success hover:bg-success/10 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onConfirm(order.id);
                }}
              >
                <Check className="w-4 h-4" />
              </button>
            </>
          )}
          {orderStatus === 'COMPLETED' && paymentStatus !== 'PAID' && (
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary text-white text-xs font-medium hover:bg-brand-dark transition-all shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                onPayment(order.id);
              }}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Thanh toán
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { accessToken, user } = useAuthStore();
  const { orders, setOrders, updateOrder } = useOrderStore();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [orderToReject, setOrderToReject] = useState<any>(null);
  const [expandedArchiveSections, setExpandedArchiveSections] = useState<Set<OrderTimeSection>>(new Set());
  const [activeNavSection, setActiveNavSection] = useState<OrderTimeSection>('current');
  const sectionRefs = useRef<Partial<Record<OrderTimeSection, HTMLElement | null>>>({});

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!accessToken || !user?.store_id) return;
      try {
        setLoading(true);
        const response = await ordersApi.getStoreOrders(user.store_id);
        const data = response.data || [];
        const normalized = data.map((o: any) => ({
          ...o,
          total_amount: Number(o.total_amount) || 0,
          discount_amount: Number(o.discount_amount) || 0,
          final_amount: Number(o.final_amount) || Number(o.total_amount) || 0,
          items: (o.items || []).map((item: any) => ({
            ...item,
            price: Number(item.price) || 0,
            subtotal: Number(item.subtotal) || 0,
            quantity: Number(item.quantity) || 0,
          })),
        }));
        setOrders(normalized);
      } catch {
        toast.error('Không thể tải đơn hàng');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [accessToken, user?.store_id, setOrders]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    let result = orders;
    if (activeTab !== 'all') {
      result = result.filter((o: any) => o.order_status === activeTab);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o: any) =>
          o.order_number?.toLowerCase().includes(q) ||
          o.table?.table_number?.toString().toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, activeTab, searchQuery]);

  const groupedOrders = useMemo(
    () => groupOrdersByTimeSection(filteredOrders),
    [filteredOrders],
  );

  const sectionCounts = useMemo(() => {
    const counts = {} as Record<OrderTimeSection, number>;
    for (const section of ORDER_TIME_SECTIONS) {
      counts[section.key] = groupedOrders[section.key].length;
    }
    return counts;
  }, [groupedOrders]);

  const visibleSections = useMemo(() => {
    return ORDER_TIME_SECTIONS.filter(
      (section) => section.pinned || expandedArchiveSections.has(section.key),
    );
  }, [expandedArchiveSections]);

  const handleNavSectionClick = (key: OrderTimeSection) => {
    setActiveNavSection(key);

    const section = ORDER_TIME_SECTIONS.find((s) => s.key === key);
    if (section && !section.pinned) {
      setExpandedArchiveSections((prev) => {
        const next = new Set(prev);
        next.add(key);
        return next;
      });
    }

    requestAnimationFrame(() => {
      sectionRefs.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const toggleArchiveSection = (key: OrderTimeSection) => {
    setExpandedArchiveSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Count orders by status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    orders.forEach((o: any) => {
      const s = o.order_status || 'PENDING';
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [orders]);

  // Order actions
  const handleConfirm = async (orderId: number) => {
    try {
      await ordersApi.updateStatus(orderId, 'CONFIRMED');
      updateOrder({ id: orderId, order_status: 'CONFIRMED' } as any);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, order_status: 'CONFIRMED' });
      }
      toast.success('Đã xác nhận đơn hàng');
    } catch {
      toast.error('Không thể xác nhận đơn');
    }
  };

  const handleReject = async () => {
    if (!orderToReject) return;
    try {
      await ordersApi.updateStatus(orderToReject.id, 'CANCELLED', rejectReason);
      updateOrder({ id: orderToReject.id, order_status: 'CANCELLED' } as any);
      toast.success('Đã hủy đơn hàng');
    } catch {
      toast.error('Không thể hủy đơn');
    } finally {
      setShowRejectModal(false);
      setRejectReason('');
      setOrderToReject(null);
    }
  };

  const handlePayment = async (orderId: number) => {
    try {
      await ordersApi.processPayment(orderId);
      updateOrder({ id: orderId, payment_status: 'PAID', order_status: 'COMPLETED' } as any);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, payment_status: 'PAID', order_status: 'COMPLETED' });
      }
      toast.success('Thanh toán thành công');
    } catch {
      toast.error('Không thể thanh toán');
    }
  };

  const viewOrderDetail = async (order: any) => {
    try {
      const response = await ordersApi.getOrderDetail(order.id);
      const detail = response.data || response;
      setSelectedOrder({
        ...detail,
        total_amount: Number(detail.total_amount) || 0,
        discount_amount: Number(detail.discount_amount) || 0,
        final_amount: Number(detail.final_amount) || Number(detail.total_amount) || 0,
        items: (detail.items || []).map((item: any) => ({
          ...item,
          price: Number(item.price) || 0,
          subtotal: Number(item.subtotal) || 0,
          quantity: Number(item.quantity) || 0,
        })),
      });
      setShowDetail(true);
    } catch {
      toast.error('Không thể tải chi tiết đơn');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Quản lý đơn hàng</h1>
        <p className="text-text-secondary mt-1">Theo dõi và xử lý đơn hàng từ khách hàng</p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200',
              activeTab === tab.key
                ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                : 'bg-bg-card text-text-secondary hover:bg-bg-secondary hover:text-brand-primary border border-border'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-xs font-semibold',
                activeTab === tab.key
                  ? 'bg-white/20 text-white'
                  : 'bg-bg-secondary text-text-muted'
              )}
            >
              {statusCounts[tab.key] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input
          type="text"
          placeholder="Tìm theo mã đơn hoặc số bàn..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-bg-card border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-secondary/20 focus:border-brand-secondary transition-all"
        />
      </div>

      {/* Time sections layout */}
      <div className="flex gap-6 items-start">
        {/* Left nav — time groups */}
        <aside className="w-52 shrink-0 sticky top-20">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
            Theo thời gian
          </p>
          <nav className="space-y-1">
            {ORDER_TIME_SECTIONS.map((section) => {
              const isActive = activeNavSection === section.key;

              return (
                <button
                  key={section.key}
                  onClick={() => handleNavSectionClick(section.key)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left',
                    isActive
                      ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                      : 'text-text-secondary hover:bg-bg-secondary hover:text-brand-primary',
                  )}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <CalendarDays className="w-4 h-4 shrink-0" />
                    <span className="truncate">{section.label}</span>
                  </span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-semibold shrink-0',
                      isActive ? 'bg-white/20 text-white' : 'bg-bg-secondary text-text-muted',
                    )}
                  >
                    {sectionCounts[section.key]}
                  </span>
                </button>
              );
            })}
          </nav>

          {!expandedArchiveSections.size && (
            <p className="mt-4 px-3 text-[11px] text-text-muted leading-relaxed">
              Chọn Hôm qua, Hôm kia hoặc 7 ngày trước để xem đơn cũ hơn.
            </p>
          )}
        </aside>

        {/* Main scroll — order sections */}
        <div className="flex-1 min-w-0 space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-bg-card rounded-2xl p-5 border border-border animate-pulse">
                  <div className="h-4 bg-bg-secondary rounded w-1/3 mb-3" />
                  <div className="h-3 bg-bg-secondary rounded w-1/2 mb-2" />
                  <div className="h-3 bg-bg-secondary rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : visibleSections.every((s) => groupedOrders[s.key].length === 0) ? (
            <div className="text-center py-16 animate-fade-in bg-bg-card rounded-2xl border border-border">
              <AlertCircle className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-secondary">Không có đơn hàng nào</p>
            </div>
          ) : (
            visibleSections.map((section) => {
              const sectionOrders = groupedOrders[section.key];
              const isArchive = !section.pinned;

              return (
                <section
                  key={section.key}
                  ref={(el) => { sectionRefs.current[section.key] = el; }}
                  className="scroll-mt-24"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-bold text-text-primary">{section.label}</h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-bg-secondary text-text-muted">
                        {sectionOrders.length} đơn
                      </span>
                    </div>
                    {isArchive && (
                      <button
                        onClick={() => toggleArchiveSection(section.key)}
                        className="text-xs text-text-muted hover:text-error transition-colors"
                      >
                        Ẩn mục này
                      </button>
                    )}
                  </div>

                  {sectionOrders.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-bg-card/50 px-4 py-8 text-center">
                      <p className="text-sm text-text-muted">Không có đơn trong mục này</p>
                    </div>
                  ) : section.key === 'week' ? (
                    /* Section "7 ngày trước" — nhóm theo ngày */
                    (() => {
                      const byDate: Record<string, any[]> = {};
                      for (const order of sectionOrders) {
                        const dateKey = formatDate(order.created_at);
                        if (!byDate[dateKey]) byDate[dateKey] = [];
                        byDate[dateKey].push(order);
                      }
                      let globalIdx = 0;
                      return Object.entries(byDate).map(([dateKey, dateOrders]) => (
                        <div key={dateKey} className="space-y-3">
                          <div className="flex items-center gap-2 pt-2">
                            <CalendarDays className="w-4 h-4 text-brand-primary" />
                            <span className="text-sm font-semibold text-text-secondary">{dateKey}</span>
                            <span className="text-xs text-text-muted">({dateOrders.length} đơn)</span>
                            <div className="flex-1 h-px bg-border-light" />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {dateOrders.map((order: any) => {
                              const idx = globalIdx++;
                              return (
                                <OrderCard
                                  key={order.id ?? `fallback-${idx}`}
                                  order={order}
                                  index={idx}
                                  onViewDetail={viewOrderDetail}
                                  onConfirm={handleConfirm}
                                  onReject={(o) => {
                                    setOrderToReject(o);
                                    setShowRejectModal(true);
                                  }}
                                  onPayment={handlePayment}
                                />
                              );
                            })}
                          </div>
                        </div>
                      ));
                    })()
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {sectionOrders.map((order: any, index: number) => (
                        <OrderCard
                          key={order.id ?? `fallback-${index}`}
                          order={order}
                          index={index}
                          onViewDetail={viewOrderDetail}
                          onConfirm={handleConfirm}
                          onReject={(o) => {
                            setOrderToReject(o);
                            setShowRejectModal(true);
                          }}
                          onPayment={handlePayment}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })
          )}
        </div>
      </div>

      {/* Order Detail Slide-over */}
      {showDetail && selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowDetail(false)}
          />
          <div className="relative w-full max-w-lg bg-bg-card h-full shadow-2xl overflow-y-auto animate-slide-in-right">
            <div className="sticky top-0 bg-bg-card/95 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg font-bold text-text-primary">
                  Chi tiết đơn {selectedOrder.order_number || `#${selectedOrder.id}`}
                </h2>
                <p className="text-sm text-text-secondary">
                  {formatDate(selectedOrder.created_at)} • {formatTime(selectedOrder.created_at)}
                </p>
              </div>
              <button
                onClick={() => setShowDetail(false)}
                className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status & Table */}
              <div className="flex flex-wrap gap-2">
                <Badge variant={getStatusBadge(selectedOrder.order_status || 'PENDING').variant}>
                  {getStatusBadge(selectedOrder.order_status || 'PENDING').label}
                </Badge>
                <Badge variant={getPaymentBadge(selectedOrder.payment_status || 'UNPAID').variant}>
                  {getPaymentBadge(selectedOrder.payment_status || 'UNPAID').label}
                </Badge>
              </div>

              <div className="bg-bg-secondary rounded-xl p-4 border border-border-light">
                <p className="text-sm text-text-secondary">
                  <span className="font-medium text-text-primary">Bàn:</span>{' '}
                  {selectedOrder.table?.table_number || '—'} •{' '}
                  <span className="text-text-muted">{selectedOrder.table?.area || ''}</span>
                </p>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-text-primary mb-3">Danh sách món</h3>
                <div className="space-y-3">
                  {(() => {
                    const items = selectedOrder.items || [];
                    // Group by combo_group_id
                    const comboGroups = new Map<string, any[]>();
                    const regularItems: any[] = [];

                    items.forEach((item: any) => {
                      if (item.combo_group_id) {
                        const group = comboGroups.get(item.combo_group_id) || [];
                        group.push(item);
                        comboGroups.set(item.combo_group_id, group);
                      } else {
                        regularItems.push(item);
                      }
                    });

                    return (
                      <>
                        {/* Combo groups */}
                        {Array.from(comboGroups.entries()).map(([groupId, groupItems]) => (
                          <div key={groupId} className="border border-amber-200 bg-amber-50/30 rounded-xl p-3 space-y-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                                COMBO
                              </span>
                            </div>
                            {groupItems.map((item: any, idx: number) => (
                              <div key={item.id ?? `combo-${groupId}-${idx}`} className="flex items-start justify-between pl-2">
                                <div className="flex-1">
                                  <p className="font-medium text-sm text-text-primary">
                                    {item.product?.name || `Món #${item.product_id}`}
                                  </p>
                                  {item.variant && (
                                    <p className="text-xs text-text-secondary">Size: {item.variant.variant_name || item.variant.name}</p>
                                  )}
                                  {item.selected_options?.length > 0 && (
                                    <p className="text-xs text-text-secondary">
                                      {item.selected_options.map((o: any) => o.option?.option_name || o.option?.name || '').filter(Boolean).join(', ')}
                                    </p>
                                  )}
                                  {item.note && <p className="text-xs text-brand-secondary mt-1">📝 {item.note}</p>}
                                </div>
                                <div className="text-right ml-3">
                                  <p className="text-xs font-medium text-text-muted">x{item.quantity}</p>
                                  <p className="text-xs text-brand-primary font-semibold">
                                    {formatCurrency(item.subtotal || item.price * item.quantity)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}

                        {/* Regular items */}
                        {regularItems.map((item: any, idx: number) => (
                          <div
                            key={item.id ?? `item-${idx}`}
                            className="flex items-start justify-between p-3 bg-bg-secondary rounded-xl hover:bg-border-light transition-colors"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-text-primary">
                                {item.product?.name || `Món #${item.product_id}`}
                              </p>
                              {item.variant && (
                                <p className="text-xs text-text-secondary">Size: {item.variant.variant_name || item.variant.name}</p>
                              )}
                              {item.selected_options?.length > 0 && (
                                <p className="text-xs text-text-secondary">
                                  {item.selected_options.map((o: any) => o.option?.option_name || o.option?.name || '').filter(Boolean).join(', ')}
                                </p>
                              )}
                              {item.note && (
                                <p className="text-xs text-brand-secondary mt-1">📝 {item.note}</p>
                              )}
                              {item.order_round > 1 && (
                                <span className="text-[10px] bg-info-bg text-info px-1.5 py-0.5 rounded font-medium mt-1 inline-block">
                                  Lượt {item.order_round}
                                </span>
                              )}
                            </div>
                            <div className="text-right ml-3">
                              <p className="text-sm font-medium text-text-muted">x{item.quantity}</p>
                              <p className="text-sm text-brand-primary font-semibold">
                                {formatCurrency(item.subtotal || item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-border pt-4 space-y-2">
                {(() => {
                  const { total, discount, final } = getOrderAmounts(selectedOrder);
                  if (discount > 0) {
                    return (
                      <>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-text-secondary">Tạm tính</span>
                          <span className="text-text-secondary">{formatCurrency(total)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-success">Giảm giá</span>
                          <span className="font-semibold text-success">-{formatCurrency(discount)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-border-light">
                          <span className="text-lg font-bold text-text-primary">Tổng thanh toán</span>
                          <span className="text-xl font-bold text-brand-primary">{formatCurrency(final)}</span>
                        </div>
                      </>
                    );
                  }
                  return (
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-text-primary">Tổng cộng</span>
                      <span className="text-xl font-bold text-brand-primary">{formatCurrency(total)}</span>
                    </div>
                  );
                })()}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {(selectedOrder.order_status || 'PENDING') === 'PENDING' && (
                  <>
                    <Button
                      variant="danger"
                      className="flex-1"
                      onClick={() => {
                        setOrderToReject(selectedOrder);
                        setShowRejectModal(true);
                      }}
                    >
                      Từ chối đơn
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => handleConfirm(selectedOrder.id)}
                    >
                      Xác nhận đơn
                    </Button>
                  </>
                )}
                {(selectedOrder.order_status === 'COMPLETED') &&
                  selectedOrder.payment_status !== 'PAID' && (
                    <Button
                      className="w-full flex items-center justify-center gap-2 whitespace-nowrap"
                      onClick={() => handlePayment(selectedOrder.id)}
                    >
                      <span>Thanh toán tiền mặt</span>
                    </Button>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason('');
          setOrderToReject(null);
        }}
        title="Từ chối đơn hàng"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Vui lòng nhập lý do từ chối đơn hàng {orderToReject?.order_number || `#${orderToReject?.id}`}
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Lý do từ chối..."
            className="w-full p-3 border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted resize-none h-24 focus:outline-none focus:ring-2 focus:ring-brand-secondary/20 focus:border-brand-secondary"
          />
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason('');
              }}
            >
              Hủy
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleReject}>
              Xác nhận từ chối
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
