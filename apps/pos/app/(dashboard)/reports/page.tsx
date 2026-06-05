'use client';

import { useEffect, useState, useMemo } from 'react';
import { DollarSign, ShoppingCart, TrendingUp, Percent } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PageHeader } from '@/app/components/layout/PageHeader';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { useOrders } from '@/app/hooks/useOrders';
import { useOrderStore } from '@/app/stores/orderStore';
import { useAuthStore } from '@/app/stores/authStore';
import { formatPrice, formatPercent } from '@/app/lib/format';
import { cn } from '@/app/lib/utils';

type Period = 'today' | '7days' | '30days';

export default function ReportsPage() {
  const { user } = useAuthStore();
  const { orders } = useOrderStore();
  const { fetchOrders, loading } = useOrders();
  const [period, setPeriod] = useState<Period>('today');

  useEffect(() => {
    if (user?.store_id) fetchOrders(user.store_id);
  }, [user?.store_id, fetchOrders]);

  const stats = useMemo(() => {
    const cutoff = new Date();
    if (period === 'today') cutoff.setHours(0, 0, 0, 0);
    else if (period === '7days') cutoff.setDate(cutoff.getDate() - 7);
    else cutoff.setDate(cutoff.getDate() - 30);

    const filtered = orders.filter((o) => new Date(o.created_at) >= cutoff);
    const completed = filtered.filter((o) => o.order_status === 'COMPLETED');
    const totalRevenue = completed.reduce((sum, o) => sum + o.total_amount, 0);
    const totalOrders = filtered.length;
    const avgOrder = totalOrders > 0 ? totalRevenue / completed.length || 0 : 0;
    const completionRate = totalOrders > 0 ? (completed.length / totalOrders) * 100 : 0;

    return { totalRevenue, totalOrders, avgOrder, completionRate };
  }, [orders, period]);

  const chartData = useMemo(() => {
    const days = period === 'today' ? 1 : period === '7days' ? 7 : 30;
    const data: { name: string; revenue: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = `${date.getDate()}/${date.getMonth() + 1}`;
      const dayOrders = orders.filter((o) => {
        const d = new Date(o.created_at);
        return d.toDateString() === date.toDateString() && o.order_status === 'COMPLETED';
      });
      data.push({ name: dateStr, revenue: dayOrders.reduce((s, o) => s + o.total_amount, 0) });
    }
    return data;
  }, [orders, period]);

  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; count: number; revenue: number }> = {};
    orders
      .filter((o) => o.order_status === 'COMPLETED')
      .forEach((o) => {
        o.items?.forEach((item: any) => {
          const key = item.product_name;
          if (!map[key]) map[key] = { name: key, count: 0, revenue: 0 };
          map[key].count += item.quantity;
          map[key].revenue += item.subtotal;
        });
      });
    return Object.values(map)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders]);

  const statCards = [
    { icon: DollarSign, label: 'Doanh thu', value: formatPrice(stats.totalRevenue), color: 'text-success', bg: 'bg-success-bg' },
    { icon: ShoppingCart, label: 'Số đơn', value: stats.totalOrders.toString(), color: 'text-info', bg: 'bg-info-bg' },
    { icon: TrendingUp, label: 'TB/đơn', value: formatPrice(stats.avgOrder), color: 'text-brand-primary', bg: 'bg-bg-secondary' },
    { icon: Percent, label: 'Hoàn thành', value: formatPercent(stats.completionRate), color: 'text-warning', bg: 'bg-warning-bg' },
  ];

  return (
    <div>
      <PageHeader title="Báo cáo" subtitle="Thống kê doanh thu và hiệu suất">
        <div className="flex gap-2">
          {([['today', 'Hôm nay'], ['7days', '7 ngày'], ['30days', '30 ngày']] as const).map(([key, label]) => (
            <Button key={key} variant={period === key ? 'primary' : 'ghost'} size="sm" onClick={() => setPeriod(key)}>
              {label}
            </Button>
          ))}
        </div>
      </PageHeader>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Skeleton className="h-28 rounded-xl" count={4} />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Card key={i} padding="lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">{card.label}</p>
                    <p className="text-2xl font-bold text-text-primary">{card.value}</p>
                  </div>
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', card.bg)}>
                    <Icon className={cn('w-5 h-5', card.color)} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card padding="lg" className="lg:col-span-2">
          <h3 className="font-semibold mb-4">Doanh thu theo ngày</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" />
                <XAxis dataKey="name" fontSize={12} tick={{ fill: '#6B6B6B' }} />
                <YAxis fontSize={12} tick={{ fill: '#6B6B6B' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => [formatPrice(value), 'Doanh thu']} />
                <Bar dataKey="revenue" fill="#6F4E37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Products */}
        <Card padding="lg">
          <h3 className="font-semibold mb-4">Top sản phẩm</h3>
          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-8">Chưa có dữ liệu</p>
            ) : (
              topProducts.map((product, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-bg-secondary text-xs font-bold flex items-center justify-center text-text-secondary">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium truncate max-w-[140px]">{product.name}</p>
                      <p className="text-xs text-text-muted">{product.count} món</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-brand-primary">{formatPrice(product.revenue)}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
