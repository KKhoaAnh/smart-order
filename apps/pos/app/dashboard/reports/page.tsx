'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Award,
} from 'lucide-react';
import { ordersApi } from '@/app/lib/api';
import { useAuthStore } from '@/app/stores/authStore';
import { useAuth } from '@/app/hooks/useAuth';
import { formatCurrency, parseApiDate } from '@/app/lib/format';
import { cn } from '@/app/lib/utils';
import AccessDenied from '@/app/components/ui/AccessDenied';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const timeFilters = [
  { key: 'today', label: 'Hôm nay' },
  { key: '7days', label: '7 ngày' },
  { key: '30days', label: '30 ngày' },
];

export default function ReportsPage() {
  const { accessToken, user } = useAuthStore();
  const { canViewReports } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('today');

  useEffect(() => {
    if (!canViewReports) return;
    const fetchData = async () => {
      if (!accessToken || !user?.store_id) return;
      try {
        setLoading(true);
        const response = await ordersApi.getStoreOrders(user.store_id);
        const data = response.data || [];
        const normalized = data.map((o: any) => ({
          ...o,
          total_amount: Number(o.total_amount) || 0,
          items: (o.items || []).map((item: any) => ({
            ...item,
            price: Number(item.price) || 0,
            subtotal: Number(item.subtotal) || 0,
            quantity: Number(item.quantity) || 0,
          })),
        }));
        setOrders(normalized);
      } catch {
        toast.error('Không thể tải dữ liệu báo cáo');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [accessToken, user?.store_id, canViewReports]);

  const filteredOrders = useMemo(() => {
    const now = new Date();
    const startDate = new Date();
    switch (timeFilter) {
      case 'today': startDate.setHours(0, 0, 0, 0); break;
      case '7days': startDate.setDate(now.getDate() - 7); break;
      case '30days': startDate.setDate(now.getDate() - 30); break;
    }
    return orders.filter((o) => {
      const orderDate = parseApiDate(o.created_at);
      return orderDate >= startDate && o.order_status !== 'CANCELLED';
    });
  }, [orders, timeFilter]);

  const stats = useMemo(() => {
    const paidOrders = filteredOrders.filter(
      (o) => o.order_status === 'COMPLETED' && o.payment_status === 'PAID'
    );
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const totalOrders = filteredOrders.length;
    const avgOrder = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
    const completedOrders = filteredOrders.filter((o) => o.order_status === 'COMPLETED');
    const completionRate = totalOrders > 0 ? (completedOrders.length / totalOrders) * 100 : 0;
    return { totalRevenue, totalOrders, avgOrder, completionRate, paidCount: paidOrders.length };
  }, [filteredOrders]);

  const topProducts = useMemo(() => {
    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    const completedOrders = filteredOrders.filter((o) => o.order_status === 'COMPLETED');
    completedOrders.forEach((order) => {
      order.items?.forEach((item: any) => {
        const name = item.product?.name || `Product ${item.product_id}`;
        const existing = productMap.get(name) || { name, quantity: 0, revenue: 0 };
        existing.quantity += item.quantity;
        existing.revenue += item.subtotal || (item.price * item.quantity);
        productMap.set(name, existing);
      });
    });
    return Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [filteredOrders]);

  const chartData = useMemo(() => {
    const dataMap = new Map<string, number>();
    const paidOrders = filteredOrders.filter(
      (o) => o.order_status === 'COMPLETED' && o.payment_status === 'PAID'
    );
    paidOrders.forEach((order) => {
      const date = parseApiDate(order.created_at);
      let key: string;
      if (timeFilter === 'today') {
        key = `${date.getHours()}:00`;
      } else {
        key = `${date.getDate()}/${date.getMonth() + 1}`;
      }
      dataMap.set(key, (dataMap.get(key) || 0) + (order.total_amount || 0));
    });
    return Array.from(dataMap.entries()).map(([name, revenue]) => ({ name, revenue }));
  }, [filteredOrders, timeFilter]);

  if (!canViewReports) {
    return (
      <AccessDenied
        title="Báo cáo — Chỉ dành cho Quản lý"
        description="Chức năng báo cáo và thống kê chỉ dành cho tài khoản Quản lý. Nếu bạn cần xem báo cáo, vui lòng liên hệ quản lý cửa hàng."
      />
    );
  }

  const statCards = [
    {
      title: 'Tổng doanh thu',
      value: formatCurrency(stats.totalRevenue),
      subtitle: `${stats.paidCount} đơn đã thanh toán`,
      icon: DollarSign,
      color: 'text-success',
      bg: 'bg-success-bg',
    },
    {
      title: 'Đơn hàng',
      value: stats.totalOrders.toString(),
      subtitle: 'Tổng số đơn',
      icon: ShoppingBag,
      color: 'text-info',
      bg: 'bg-info-bg',
    },
    {
      title: 'TB/đơn',
      value: formatCurrency(stats.avgOrder),
      subtitle: 'Trung bình mỗi đơn',
      icon: TrendingUp,
      color: 'text-brand-primary',
      bg: 'bg-bg-secondary',
    },
    {
      title: 'Tỷ lệ hoàn thành',
      value: `${stats.completionRate.toFixed(1)}%`,
      subtitle: 'Đơn hoàn thành',
      icon: CheckCircle2,
      color: 'text-brand-secondary',
      bg: 'bg-brand-primary/5',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Báo cáo & Thống kê</h1>
          <p className="text-text-secondary mt-1">Phân tích doanh thu và hiệu suất bán hàng</p>
        </div>
        <div className="flex gap-2">
          {timeFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => setTimeFilter(f.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                timeFilter === f.key
                  ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                  : 'bg-bg-card text-text-secondary hover:bg-bg-secondary hover:text-brand-primary border border-border'
              )}
            >
              <Calendar className="w-4 h-4" />
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-bg-card rounded-2xl p-5 border border-border order-card animate-slide-in-up"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={cn('p-2.5 rounded-xl', card.bg)}>
                <card.icon className={cn('w-5 h-5', card.color)} />
              </div>
              <span className="text-sm text-text-secondary">{card.title}</span>
            </div>
            <p className="text-2xl font-bold text-text-primary">{card.value}</p>
            <p className="text-xs text-text-muted mt-1">{card.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-bg-card rounded-2xl p-6 border border-border animate-slide-in-up" style={{ animationDelay: '300ms' }}>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Doanh thu theo {timeFilter === 'today' ? 'giờ' : 'ngày'}
        </h3>
        <div className="h-80">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE4" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value) => {
                    const amount = Number(value ?? 0);
                    return [formatCurrency(amount), 'Doanh thu'];
                  }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #E8E0D8',
                    boxShadow: '0 4px 12px rgba(111,78,55,0.08)',
                  }}
                />
                <Bar dataKey="revenue" fill="#6F4E37" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-text-muted">
              Chưa có dữ liệu
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-bg-card rounded-2xl p-6 border border-border animate-slide-in-up" style={{ animationDelay: '400ms' }}>
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-brand-primary" />
          <h3 className="text-lg font-semibold text-text-primary">
            Top sản phẩm bán chạy
          </h3>
        </div>
        <div className="space-y-3">
          {topProducts.length > 0 ? (
            topProducts.map((product, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-bg-secondary rounded-xl hover:bg-border-light transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                      idx === 0
                        ? 'bg-warning-bg text-warning'
                        : idx === 1
                          ? 'bg-bg-secondary text-text-secondary border border-border'
                          : idx === 2
                            ? 'bg-brand-primary/10 text-brand-primary'
                            : 'bg-bg-secondary text-text-muted'
                    )}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-medium text-text-primary">{product.name}</p>
                    <p className="text-xs text-text-secondary">
                      {product.quantity} phần đã bán
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-brand-primary">
                  {formatCurrency(product.revenue)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-center text-text-muted py-4">Chưa có dữ liệu</p>
          )}
        </div>
      </div>
    </div>
  );
}
