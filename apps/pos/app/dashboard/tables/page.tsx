'use client';

import { useEffect, useState, useMemo } from 'react';
import { Plus, QrCode, Edit2, Trash2, Users, ShieldAlert, Eye } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { PageHeader } from '@/app/components/layout/PageHeader';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';

import { Modal } from '@/app/components/ui/Modal';
import { Input } from '@/app/components/ui/Input';
import { Select } from '@/app/components/ui/Select';
import { Tabs } from '@/app/components/ui/Tabs';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { ConfirmDialog } from '@/app/components/ui/ConfirmDialog';
import { useTables } from '@/app/hooks/useTables';
import { useAuth } from '@/app/hooks/useAuth';
import { connectSocket, onTableStatusChanged, getSocket } from '@/app/lib/socket';
import { SocketEvents } from 'shared-types';
import { cn } from '@/app/lib/utils';
import toast from 'react-hot-toast';

const statusStyles: Record<string, { dot: string; border: string; label: string }> = {
  AVAILABLE: { dot: 'bg-success', border: 'border-success', label: 'Trống' },
  OCCUPIED: { dot: 'bg-error', border: 'border-error', label: 'Có khách' },
  RESERVED: { dot: 'bg-warning', border: 'border-warning', label: 'Đã đặt' },
  CLEANING: { dot: 'bg-info', border: 'border-info', label: 'Dọn dẹp' },
};

const areaOptions = [
  { value: 'Trong nhà', label: 'Trong nhà' },
  { value: 'Ngoài trời', label: 'Ngoài trời' },
  { value: 'VIP', label: 'VIP' },
];

export default function TablesPage() {
  const { tables, loading, fetchTables, createTbl, updateTbl, deleteTbl, regenQR, updateStatus } = useTables();
  const { canManage, canUpdateTableStatus, user } = useAuth();
  const [areaFilter, setAreaFilter] = useState('ALL');
  const [formModal, setFormModal] = useState<{ open: boolean; data?: any }>({ open: false });
  const [qrModal, setQrModal] = useState<{ open: boolean; table?: any }>({ open: false });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id?: number }>({ open: false });
  const [form, setForm] = useState({ table_number: '', area: 'Trong nhà', capacity: 4 });

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // Realtime: bàn trống sau thanh toán
  useEffect(() => {
    if (!user?.store_id) return;
    connectSocket();
    const handler = () => fetchTables();
    onTableStatusChanged(handler);
    return () => {
      getSocket()?.off(SocketEvents.TABLE_STATUS_CHANGED, handler);
    };
  }, [user?.store_id, fetchTables]);

  const areas = useMemo(() => {
    const set = new Set(tables.map((t: any) => t.area));
    return ['ALL', ...Array.from(set)];
  }, [tables]);

  const filteredTables = useMemo(() => {
    if (areaFilter === 'ALL') return tables;
    return tables.filter((t: any) => t.area === areaFilter);
  }, [tables, areaFilter]);

  const areaTabs = areas.map((a) => ({
    key: a,
    label: a === 'ALL' ? 'Tất cả' : a,
    count: a === 'ALL' ? tables.length : tables.filter((t: any) => t.area === a).length,
  }));

  const handleSave = async () => {
    try {
      const data = { ...form, capacity: Number(form.capacity) };
      if (formModal.data?.id) {
        await updateTbl(formModal.data.id, data);
      } else {
        await createTbl(data);
      }
      setFormModal({ open: false });
    } catch (err: any) {
      toast.error(err.message || 'Lỗi lưu bàn');
    }
  };

  return (
    <div>
      <PageHeader title="Bàn & QR Code" subtitle={canManage ? 'Quản lý bàn và mã QR đặt món' : 'Xem danh sách bàn và mã QR'}>
        {canManage && (
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => {
            setForm({ table_number: '', area: 'Trong nhà', capacity: 4 });
            setFormModal({ open: true });
          }}>
            Thêm bàn
          </Button>
        )}
      </PageHeader>

      {/* Read-only banner */}
      {!canManage && (
        <div className="mb-4 flex items-center gap-3 bg-warning-bg border border-warning/20 rounded-xl px-4 py-3 animate-fade-in">
          <ShieldAlert className="w-5 h-5 text-warning flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-text-primary">Chế độ xem</p>
            <p className="text-xs text-text-secondary">Bạn chỉ có thể xem danh sách bàn. Liên hệ quản lý để thay đổi.</p>
          </div>
        </div>
      )}

      <Tabs tabs={areaTabs} activeKey={areaFilter} onChange={setAreaFilter} className="mb-6" />

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <Skeleton className="h-44 rounded-xl" count={10} />
        </div>
      ) : filteredTables.length === 0 ? (
        <EmptyState icon={<QrCode className="w-12 h-12" />} title="Chưa có bàn" description="Thêm bàn mới để bắt đầu" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredTables.map((table: any) => {
            const status = statusStyles[table.status] || statusStyles.AVAILABLE;
            return (
              <Card key={table.id} padding="none" className={cn('overflow-hidden border-t-4 group', status.border)}>
                <div className="p-4 text-center">
                  <p className="text-3xl font-bold text-text-primary mb-1">{table.table_number}</p>
                  <p className="text-xs text-text-muted mb-3">{table.area}</p>
                  <div className="flex items-center justify-center gap-1.5 mb-3">
                    <span className={cn('w-2 h-2 rounded-full', status.dot)} />
                    <span className="text-sm font-medium">{status.label}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 text-xs text-text-muted">
                    <Users className="w-3 h-3" /> {table.capacity} chỗ
                  </div>
                  {canUpdateTableStatus && table.status !== 'AVAILABLE' && (
                    <div className="mt-2 flex flex-col items-center gap-1">
                      <button
                        onClick={() => updateStatus(table.id, 'AVAILABLE')}
                        className="text-xs text-success hover:underline"
                      >
                        Đánh dấu trống
                      </button>
                      {table.status === 'OCCUPIED' && (
                        <button
                          onClick={() => updateStatus(table.id, 'CLEANING')}
                          className="text-xs text-info hover:underline"
                        >
                          Đang dọn
                        </button>
                      )}
                    </div>
                  )}
                  {canUpdateTableStatus && table.status === 'AVAILABLE' && (
                    <button
                      onClick={() => updateStatus(table.id, 'CLEANING')}
                      className="mt-2 text-xs text-info hover:underline"
                    >
                      Đang dọn
                    </button>
                  )}
                  {canUpdateTableStatus && table.status === 'CLEANING' && (
                    <button
                      onClick={() => updateStatus(table.id, 'AVAILABLE')}
                      className="mt-2 text-xs text-success hover:underline"
                    >
                      Dọn xong — Trống
                    </button>
                  )}
                </div>
                {/* Hover Actions — full for admin, view-only QR for others */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex border-t border-border">
                  {canManage ? (
                    <>
                      <button onClick={() => { setForm({ table_number: table.table_number, area: table.area, capacity: table.capacity }); setFormModal({ open: true, data: table }); }}
                        className="flex-1 py-2 text-xs text-text-secondary hover:bg-bg-secondary flex items-center justify-center gap-1 transition-colors">
                        <Edit2 className="w-3 h-3" /> Sửa
                      </button>
                      <button onClick={() => setQrModal({ open: true, table })}
                        className="flex-1 py-2 text-xs text-brand-primary hover:bg-bg-secondary flex items-center justify-center gap-1 transition-colors border-x border-border">
                        <QrCode className="w-3 h-3" /> QR
                      </button>
                      <button onClick={() => setDeleteDialog({ open: true, id: table.id })}
                        className="flex-1 py-2 text-xs text-error hover:bg-error-bg flex items-center justify-center gap-1 transition-colors">
                        <Trash2 className="w-3 h-3" /> Xoá
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setQrModal({ open: true, table })}
                      className="flex-1 py-2 text-xs text-brand-primary hover:bg-bg-secondary flex items-center justify-center gap-1 transition-colors">
                      <Eye className="w-3 h-3" /> Xem QR
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Table Form Modal — only for admin */}
      {canManage && (
        <Modal isOpen={formModal.open} onClose={() => setFormModal({ open: false })} title={formModal.data ? 'Sửa bàn' : 'Thêm bàn'} size="sm"
          footer={<Button onClick={handleSave}>Lưu</Button>}>
          <div className="space-y-4">
            <Input label="Số bàn" value={form.table_number} onChange={e => setForm({ ...form, table_number: e.target.value })} />
            <Select label="Khu vực" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} options={areaOptions} />
            <Input label="Số chỗ ngồi" type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} />
          </div>
        </Modal>
      )}

      {/* QR Modal — viewable by all */}
      <Modal isOpen={qrModal.open} onClose={() => setQrModal({ open: false })} title={`QR Code — ${qrModal.table?.table_number}`} size="sm">
        <div className="flex flex-col items-center py-4">
          <div className="bg-white p-4 rounded-xl border border-border mb-4">
            <QRCodeSVG
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/order?token=${qrModal.table?.qr_code_token || qrModal.table?.qr_token || ''}`}
              size={200}
              level="H"
            />
          </div>
          <p className="text-sm text-text-secondary mb-4">
            {qrModal.table?.area} — {qrModal.table?.capacity} chỗ
          </p>
          {canManage && (
            <div className="flex gap-3 w-full">
              <Button variant="secondary" fullWidth onClick={() => {
                regenQR(qrModal.table?.id);
                setQrModal({ open: false });
              }}>
                Tạo lại QR
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirm — only for admin */}
      {canManage && (
        <ConfirmDialog
          isOpen={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false })}
          onConfirm={async () => {
            if (deleteDialog.id) await deleteTbl(deleteDialog.id);
            setDeleteDialog({ open: false });
          }}
          title="Xoá bàn"
          message="Bàn sẽ bị xoá vĩnh viễn. Bạn chắc chắn?"
          variant="danger"
          confirmLabel="Xoá"
        />
      )}
    </div>
  );
}
