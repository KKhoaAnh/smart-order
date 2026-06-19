'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { PageHeader } from '@/app/components/layout/PageHeader';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { Modal } from '@/app/components/ui/Modal';
import { Input } from '@/app/components/ui/Input';
import { Select } from '@/app/components/ui/Select';
import { Switch } from '@/app/components/ui/Switch';
import { Badge } from '@/app/components/ui/Badge';
import { ConfirmDialog } from '@/app/components/ui/ConfirmDialog';
import AccessDenied from '@/app/components/ui/AccessDenied';
import { useAuthStore } from '@/app/stores/authStore';
import { useAuth } from '@/app/hooks/useAuth';
import { promotionsApi, getMenu } from '@/app/lib/api';
import { formatPrice, formatDate } from '@/app/lib/format';
import {
  connectSocket,
  onPromotionUsageUpdated,
  offPromotionUsageUpdated,
} from '@/app/lib/socket';
import toast from 'react-hot-toast';

interface Promotion {
  id: number;
  name: string;
  description?: string;
  type: 'PERCENT' | 'FIXED' | 'FREE_ITEM';
  value: number;
  code?: string;
  min_order_amount: number;
  max_discount?: number | null;
  usage_limit?: number | null;
  usage_count: number;
  per_customer_limit: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  free_product_id?: number | null;
}

type PromoStatus = 'active' | 'expired' | 'upcoming' | 'inactive';

const TYPE_OPTIONS = [
  { value: 'PERCENT', label: 'Giảm theo %' },
  { value: 'FIXED', label: 'Giảm cố định' },
  { value: 'FREE_ITEM', label: 'Tặng sản phẩm' },
];

const defaultForm = () => {
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + 30);
  return {
    name: '',
    description: '',
    type: 'PERCENT',
    value: 10,
    code: '',
    min_order_amount: 0,
    max_discount: '',
    usage_limit: '',
    per_customer_limit: 1,
    start_date: now.toISOString().slice(0, 16),
    end_date: end.toISOString().slice(0, 16),
    is_active: true,
    free_product_id: '',
  };
};

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'PROMO';
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function getPromoStatus(p: Promotion): PromoStatus {
  if (!p.is_active) return 'inactive';
  const now = Date.now();
  const start = new Date(p.start_date).getTime();
  const end = new Date(p.end_date).getTime();
  if (now < start) return 'upcoming';
  if (now > end) return 'expired';
  return 'active';
}

function statusLabel(status: PromoStatus): string {
  switch (status) {
    case 'active':
      return 'Đang chạy';
    case 'expired':
      return 'Hết hạn';
    case 'upcoming':
      return 'Sắp diễn ra';
    default:
      return 'Tắt';
  }
}

function statusVariant(status: PromoStatus): 'completed' | 'cancelled' | 'pending' | 'default' {
  switch (status) {
    case 'active':
      return 'completed';
    case 'expired':
      return 'cancelled';
    case 'upcoming':
      return 'pending';
    default:
      return 'default';
  }
}

function formatValue(p: Promotion): string {
  if (p.type === 'PERCENT') return `${p.value}%`;
  return formatPrice(p.value);
}

export default function PromotionsPage() {
  const { user } = useAuthStore();
  const { isAdmin } = useAuth();
  const storeId = user?.store_id;

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const load = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const data = await promotionsApi.getAll(storeId);
      setPromotions(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Không tải được danh sách khuyến mãi');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  const loadProducts = useCallback(async () => {
    if (!storeId) return;
    try {
      const menu = await getMenu(storeId);
      const list = (Array.isArray(menu) ? menu : [])
        .flatMap((cat: { products?: { id: number; name: string }[] }) => cat.products || [])
        .map((p: { id: number; name: string }) => ({ id: p.id, name: p.name }));
      setProducts(list);
    } catch {
      setProducts([]);
    }
  }, [storeId]);

  useEffect(() => {
    load();
    loadProducts();
  }, [load, loadProducts]);

  // Realtime: cập nhật usage_count khi khách áp dụng mã
  useEffect(() => {
    if (!storeId) return;

    connectSocket();

    const handler = (payload: { data?: { promotion_id?: number; usage_count?: number } }) => {
      const data = (payload as { data?: { promotion_id?: number; usage_count?: number } })?.data ?? payload;
      const promotionId = (data as { promotion_id?: number }).promotion_id;
      const usageCount = (data as { usage_count?: number }).usage_count;
      if (!promotionId || usageCount == null) return;

      setPromotions((prev) =>
        prev.map((p) =>
          p.id === promotionId ? { ...p, usage_count: usageCount } : p,
        ),
      );
    };

    onPromotionUsageUpdated(handler);
    return () => offPromotionUsageUpdated(handler);
  }, [storeId]);

  const stats = useMemo(() => {
    const now = Date.now();
    const active = promotions.filter((p) => {
      if (!p.is_active) return false;
      return (
        now >= new Date(p.start_date).getTime() &&
        now <= new Date(p.end_date).getTime()
      );
    });
    const totalUsage = promotions.reduce((sum, p) => sum + (p.usage_count || 0), 0);
    return {
      activeCount: active.length,
      totalUsage,
      totalCount: promotions.length,
    };
  }, [promotions]);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm());
    setModalOpen(true);
  };

  const openEdit = (p: Promotion) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description || '',
      type: p.type,
      value: p.value,
      code: p.code || '',
      min_order_amount: p.min_order_amount || 0,
      max_discount: p.max_discount != null ? String(p.max_discount) : '',
      usage_limit: p.usage_limit != null ? String(p.usage_limit) : '',
      per_customer_limit: p.per_customer_limit ?? 1,
      start_date: p.start_date.slice(0, 16),
      end_date: p.end_date.slice(0, 16),
      is_active: p.is_active,
      free_product_id: p.free_product_id != null ? String(p.free_product_id) : '',
    });
    setModalOpen(true);
  };

  const buildPayload = () => {
    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      type: form.type,
      value: Number(form.value),
      code: form.code.trim().toUpperCase() || undefined,
      min_order_amount: Number(form.min_order_amount) || 0,
      per_customer_limit: Number(form.per_customer_limit) || 1,
      start_date: new Date(form.start_date).toISOString(),
      end_date: new Date(form.end_date).toISOString(),
      is_active: form.is_active,
    };

    if (form.max_discount !== '') {
      payload.max_discount = Number(form.max_discount);
    }
    if (form.usage_limit !== '') {
      payload.usage_limit = Number(form.usage_limit);
    }
    if (form.type === 'FREE_ITEM' && form.free_product_id) {
      payload.free_product_id = Number(form.free_product_id);
    }

    return payload;
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Vui lòng nhập tên chương trình');
      return;
    }
    if (Number(form.value) < 0) {
      toast.error('Giá trị không hợp lệ');
      return;
    }
    if (new Date(form.end_date) <= new Date(form.start_date)) {
      toast.error('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload();
      if (editing) {
        await promotionsApi.update(editing.id, payload);
        toast.success('Đã cập nhật khuyến mãi');
      } else if (storeId) {
        await promotionsApi.create(storeId, payload);
        toast.success('Đã tạo khuyến mãi mới');
      }
      setModalOpen(false);
      load();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string | string[] } } })?.response?.data
          ?.message || 'Có lỗi xảy ra';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (p: Promotion) => {
    try {
      await promotionsApi.update(p.id, { is_active: !p.is_active });
      setPromotions((prev) =>
        prev.map((item) =>
          item.id === p.id ? { ...item, is_active: !item.is_active } : item,
        ),
      );
      toast.success(p.is_active ? 'Đã tắt khuyến mãi' : 'Đã bật khuyến mãi');
    } catch {
      toast.error('Cập nhật thất bại');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await promotionsApi.delete(deleteTarget.id);
      toast.success('Đã xóa khuyến mãi');
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('Xóa thất bại');
    } finally {
      setDeleting(false);
    }
  };

  if (!isAdmin) {
    return (
      <AccessDenied
        title="Khuyến mãi — Chỉ dành cho Quản lý"
        description="Chức năng quản lý khuyến mãi chỉ dành cho tài khoản Quản lý."
      />
    );
  }

  return (
    <div>
      <PageHeader title="Khuyến mãi" subtitle="Quản lý mã giảm giá & chương trình khuyến mãi">
        <Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>
          Tạo khuyến mãi
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <p className="text-sm text-text-secondary mb-1">KM đang chạy</p>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-brand-primary">{stats.activeCount}</span>
            <Sparkles className="w-5 h-5 text-warning" />
          </div>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary mb-1">Tổng lượt sử dụng</p>
          <span className="text-3xl font-bold text-text-primary">{stats.totalUsage}</span>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary mb-1">Tổng chương trình</p>
          <span className="text-3xl font-bold text-text-primary">{stats.totalCount}</span>
        </Card>
      </div>

      {loading ? (
        <Card padding="none">
          <Skeleton className="h-16 rounded-none" count={5} />
        </Card>
      ) : promotions.length === 0 ? (
        <EmptyState
          icon={<Tag className="w-12 h-12" />}
          title="Chưa có khuyến mãi"
          description="Tạo mã giảm giá để khách hàng sử dụng khi đặt món"
          action={{ label: 'Tạo khuyến mãi đầu tiên', onClick: openCreate }}
        />
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Mã</th>
                  <th>Loại</th>
                  <th>Giá trị</th>
                  <th>Đã dùng / Giới hạn</th>
                  <th>Thời hạn</th>
                  <th>Trạng thái</th>
                  <th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((p) => {
                  const status = getPromoStatus(p);
                  return (
                    <tr key={p.id}>
                      <td>
                        <div>
                          <p className="font-medium text-text-primary">{p.name}</p>
                          {p.description && (
                            <p className="text-xs text-text-muted truncate max-w-[200px]">
                              {p.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td>
                        {p.code ? (
                          <code className="text-xs font-bold bg-bg-secondary px-2 py-1 rounded">
                            {p.code}
                          </code>
                        ) : (
                          <span className="text-text-muted text-xs">—</span>
                        )}
                      </td>
                      <td>
                        <Badge variant="default">
                          {TYPE_OPTIONS.find((t) => t.value === p.type)?.label || p.type}
                        </Badge>
                      </td>
                      <td className="font-medium">{formatValue(p)}</td>
                      <td>
                        {p.usage_count}
                        {p.usage_limit != null ? ` / ${p.usage_limit}` : ' / ∞'}
                      </td>
                      <td className="text-xs text-text-secondary whitespace-nowrap">
                        {formatDate(p.start_date)}
                        <br />→ {formatDate(p.end_date)}
                      </td>
                      <td>
                        <Badge variant={statusVariant(status)} dot>
                          {statusLabel(status)}
                        </Badge>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted hover:text-brand-primary transition-colors"
                            title="Sửa"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(p)}
                            className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted hover:text-brand-primary transition-colors"
                            title={p.is_active ? 'Tắt' : 'Bật'}
                          >
                            {p.is_active ? (
                              <ToggleRight className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <ToggleLeft className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="p-2 rounded-lg hover:bg-error-bg text-text-muted hover:text-error transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Sửa khuyến mãi' : 'Tạo khuyến mãi mới'}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Tên chương trình *"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="VD: Giảm 20% đơn đầu tiên"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#4A4A4A]">Mã giảm giá</label>
            <div className="flex gap-2">
              <Input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="WELCOME20"
                wrapperClassName="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => setForm((f) => ({ ...f, code: generateCode() }))}
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Tạo mã
              </Button>
            </div>
          </div>

          <div className="md:col-span-2">
            <Input
              label="Mô tả"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Mô tả chi tiết (tuỳ chọn)"
            />
          </div>

          <Select
            label="Loại giảm giá *"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            options={TYPE_OPTIONS}
          />

          <Input
            label={form.type === 'PERCENT' ? 'Phần trăm giảm (%) *' : 'Giá trị giảm (đ) *'}
            type="number"
            min={0}
            max={form.type === 'PERCENT' ? 100 : undefined}
            value={String(form.value)}
            onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))}
          />

          {form.type === 'PERCENT' && (
            <Input
              label="Giảm tối đa (đ)"
              type="number"
              min={0}
              value={form.max_discount}
              onChange={(e) => setForm((f) => ({ ...f, max_discount: e.target.value }))}
              placeholder="Không giới hạn"
            />
          )}

          {form.type === 'FREE_ITEM' && (
            <Select
              label="Sản phẩm tặng"
              value={form.free_product_id}
              onChange={(e) => setForm((f) => ({ ...f, free_product_id: e.target.value }))}
              options={products.map((p) => ({ value: String(p.id), label: p.name }))}
              placeholder="Chọn sản phẩm..."
            />
          )}

          <Input
            label="Đơn tối thiểu (đ)"
            type="number"
            min={0}
            value={String(form.min_order_amount)}
            onChange={(e) =>
              setForm((f) => ({ ...f, min_order_amount: Number(e.target.value) }))
            }
          />

          <Input
            label="Giới hạn sử dụng"
            type="number"
            min={1}
            value={form.usage_limit}
            onChange={(e) => setForm((f) => ({ ...f, usage_limit: e.target.value }))}
            placeholder="Không giới hạn"
          />

          <Input
            label="Giới hạn / khách"
            type="number"
            min={1}
            value={String(form.per_customer_limit)}
            onChange={(e) =>
              setForm((f) => ({ ...f, per_customer_limit: Number(e.target.value) }))
            }
          />

          <Input
            label="Ngày bắt đầu *"
            type="datetime-local"
            value={form.start_date}
            onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
          />

          <Input
            label="Ngày kết thúc *"
            type="datetime-local"
            value={form.end_date}
            onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
          />

          <div className="md:col-span-2 flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-text-primary">Kích hoạt ngay</p>
              <p className="text-xs text-text-muted">Khách có thể sử dụng mã khi bật</p>
            </div>
            <Switch
              checked={form.is_active}
              onChange={(checked) => setForm((f) => ({ ...f, is_active: checked }))}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-border">
          <Button variant="ghost" onClick={() => setModalOpen(false)} fullWidth>
            Huỷ
          </Button>
          <Button onClick={handleSave} loading={saving} fullWidth>
            {editing ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xóa khuyến mãi"
        message={`Bạn có chắc muốn xóa "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
