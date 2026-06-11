'use client';

import { useEffect, useState, useMemo } from 'react';
import { Star, Eye, EyeOff } from 'lucide-react';
import { PageHeader } from '@/app/components/layout/PageHeader';
import { Card } from '@/app/components/ui/Card';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { useAuthStore } from '@/app/stores/authStore';
import { useAuth } from '@/app/hooks/useAuth';
import { getStoreReviews, toggleReviewVisibility } from '@/app/lib/api';
import AccessDenied from '@/app/components/ui/AccessDenied';
import { formatDate } from '@/app/lib/format';
import toast from 'react-hot-toast';

export default function ReviewsPage() {
  const { user } = useAuthStore();
  const { isAdmin } = useAuth();
  const storeId = user?.store_id;
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | number>('all');

  const load = async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const data = await getStoreReviews(storeId);
      setReviews(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Không tải được đánh giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [storeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const stats = useMemo(() => {
    const visible = reviews.filter((r) => r.is_visible);
    const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    visible.forEach((r) => { dist[r.rating] = (dist[r.rating] || 0) + 1; sum += r.rating; });
    return {
      avg: visible.length ? +(sum / visible.length).toFixed(1) : 0,
      total: visible.length,
      dist,
    };
  }, [reviews]);

  const filtered = filter === 'all' ? reviews : reviews.filter((r) => r.rating === filter);

  const handleToggle = async (id: number) => {
    try {
      await toggleReviewVisibility(id);
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, is_visible: !r.is_visible } : r)));
      toast.success('Đã cập nhật');
    } catch {
      toast.error('Cập nhật thất bại');
    }
  };

  if (!isAdmin) {
    return (
      <AccessDenied
        title="Đánh giá — Chỉ dành cho Quản lý"
        description="Chức năng quản lý đánh giá chỉ dành cho tài khoản Quản lý."
      />
    );
  }

  return (
    <div>
      <PageHeader title="Đánh giá" subtitle="Quản lý feedback từ khách hàng" />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <p className="text-sm text-text-secondary mb-1">Điểm trung bình</p>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-brand-primary">{stats.avg}</span>
            <Star className="w-6 h-6 text-warning fill-warning" />
          </div>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary mb-1">Tổng đánh giá</p>
          <span className="text-3xl font-bold text-text-primary">{stats.total}</span>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary mb-2">Phân bổ sao</p>
          <div className="space-y-1">
            {[5, 4, 3, 2, 1].map((s) => (
              <div key={s} className="flex items-center gap-2 text-xs">
                <span className="w-3">{s}⭐</span>
                <div className="flex-1 h-2 bg-bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-secondary rounded-full transition-all duration-500"
                    style={{ width: `${stats.total ? (stats.dist[s] / stats.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-6 text-right text-text-secondary">{stats.dist[s]}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(['all', 5, 4, 3, 2, 1] as const).map((f) => (
          <button
            key={String(f)}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? 'bg-brand-primary text-white' : 'bg-bg-secondary text-text-secondary hover:bg-border'
            }`}
          >
            {f === 'all' ? 'Tất cả' : `${f} sao`}
          </button>
        ))}
      </div>

      {loading ? (
        <Card padding="none"><Skeleton className="h-16 rounded-none" count={5} /></Card>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Star className="w-12 h-12" />} title="Chưa có đánh giá" />
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Món</th>
                  <th>Sao</th>
                  <th>Nội dung</th>
                  <th>Ngày</th>
                  <th>Hiển thị</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className={!r.is_visible ? 'opacity-50' : ''}>
                    <td className="font-medium">{r.customer?.name || '—'}</td>
                    <td>{r.product?.name || `#${r.product_id}`}</td>
                    <td>
                      <span className="inline-flex items-center gap-1 text-brand-primary font-semibold">
                        {r.rating} <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                      </span>
                    </td>
                    <td className="text-text-secondary max-w-xs truncate">{r.comment || '—'}</td>
                    <td className="text-text-secondary text-sm">{formatDate(r.created_at)}</td>
                    <td>
                      <button
                        onClick={() => handleToggle(r.id)}
                        className="p-1.5 rounded-lg hover:bg-bg-secondary transition-colors"
                        title={r.is_visible ? 'Ẩn đánh giá' : 'Hiện đánh giá'}
                      >
                        {r.is_visible
                          ? <Eye className="w-4 h-4 text-success" />
                          : <EyeOff className="w-4 h-4 text-text-muted" />
                        }
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
