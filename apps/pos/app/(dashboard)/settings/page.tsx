'use client';

import { useEffect, useState } from 'react';
import { Save, Store } from 'lucide-react';
import { PageHeader } from '@/app/components/layout/PageHeader';
import { Card } from '@/app/components/ui/Card';
import { Input } from '@/app/components/ui/Input';
import { Button } from '@/app/components/ui/Button';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { useAuthStore } from '@/app/stores/authStore';
import { getStore, updateStore } from '@/app/lib/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    opening_hours: '',
    logo_url: '',
  });

  useEffect(() => {
    async function load() {
      try {
        const data = await getStore();
        setForm({
          name: data.name || '',
          address: data.address || '',
          phone: data.phone || '',
          opening_hours: data.opening_hours || '',
          logo_url: data.logo_url || '',
        });
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateStore(user?.store_id || 1, form);
      toast.success('Đã lưu cài đặt');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi lưu cài đặt');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Cài đặt cửa hàng" subtitle="Thông tin và cấu hình cửa hàng" />

      {loading ? (
        <Card padding="lg">
          <Skeleton className="h-10 rounded-lg mb-4" count={5} />
        </Card>
      ) : (
        <Card padding="lg" className="max-w-2xl">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
            <div className="w-12 h-12 rounded-xl bg-bg-secondary flex items-center justify-center">
              <Store className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-text-primary">Thông tin cửa hàng</h2>
              <p className="text-sm text-text-muted">Cập nhật thông tin hiển thị</p>
            </div>
          </div>

          <div className="space-y-5">
            <Input
              label="Tên cửa hàng"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ví dụ: Smart Coffee"
            />
            <Input
              label="Địa chỉ"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="123 Nguyễn Huệ, Quận 1, TP.HCM"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Số điện thoại"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="0901 234 567"
              />
              <Input
                label="Giờ mở cửa"
                value={form.opening_hours}
                onChange={(e) => setForm({ ...form, opening_hours: e.target.value })}
                placeholder="07:00 - 22:00"
              />
            </div>
            <Input
              label="URL Logo"
              value={form.logo_url}
              onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div className="mt-8 pt-6 border-t border-border flex justify-end">
            <Button
              icon={<Save className="w-4 h-4" />}
              onClick={handleSave}
              loading={saving}
            >
              Lưu thay đổi
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
