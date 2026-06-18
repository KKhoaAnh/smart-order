'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users as UsersIcon,
  Plus,
  Shield,
  Pencil,
  Search,
  UserPlus,
  Eye,
  EyeOff,
} from 'lucide-react';
import { PageHeader } from '@/app/components/layout/PageHeader';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { Avatar } from '@/app/components/ui/Avatar';
import { Modal } from '@/app/components/ui/Modal';
import { Input } from '@/app/components/ui/Input';
import { Switch } from '@/app/components/ui/Switch';
import { useAuthStore } from '@/app/stores/authStore';
import { getRoleLabel, getRoleColor } from '@/app/lib/utils';
import { formatDate } from '@/app/lib/format';
import { usersApi } from '@/app/lib/api';
import toast from 'react-hot-toast';

// ── Types ──

interface StaffUser {
  id: number;
  username: string;
  full_name: string;
  phone?: string;
  is_active: boolean;
  store_id: number;
  roles: string[];
  created_at: string;
  updated_at: string;
}

const ALL_ROLES = ['Admin', 'Cashier', 'Kitchen', 'Waiter'] as const;

// ── Component ──

export default function UsersPage() {
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.roles?.includes('Admin' as any);

  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [form, setForm] = useState({
    username: '',
    password: '',
    full_name: '',
    phone: '',
    roles: ['Cashier'] as string[],
  });

  // ── Load users ──
  const loadUsers = useCallback(async () => {
    try {
      const data = await usersApi.getAll();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      if (currentUser) setUsers([{
        id: currentUser.id,
        username: currentUser.username,
        full_name: currentUser.full_name,
        phone: currentUser.phone || '',
        is_active: true,
        store_id: currentUser.store_id,
        roles: currentUser.roles as string[],
        created_at: '',
        updated_at: '',
      }]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // ── Filtered users ──
  const filteredUsers = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.full_name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.roles.some((r) => getRoleLabel(r).toLowerCase().includes(q))
    );
  });

  // ── Open modal for create ──
  const openCreate = () => {
    setEditingUser(null);
    setForm({ username: '', password: '', full_name: '', phone: '', roles: ['Cashier'] });
    setShowPassword(false);
    setModalOpen(true);
  };

  // ── Open modal for edit ──
  const openEdit = (u: StaffUser) => {
    setEditingUser(u);
    setForm({
      username: u.username,
      password: '',
      full_name: u.full_name,
      phone: u.phone || '',
      roles: [...u.roles],
    });
    setShowPassword(false);
    setModalOpen(true);
  };

  // ── Toggle role ──
  const toggleRole = (role: string) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  // ── Save (create/update) ──
  const handleSave = async () => {
    if (!form.full_name.trim()) {
      toast.error('Vui lòng nhập họ tên');
      return;
    }
    if (form.roles.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 vai trò');
      return;
    }

    setSaving(true);
    try {
      if (editingUser) {
        // Update
        const payload: any = {
          full_name: form.full_name.trim(),
          phone: form.phone.trim() || undefined,
          roles: form.roles,
        };
        if (form.password) payload.password = form.password;
        await usersApi.update(editingUser.id, payload);
        toast.success('Đã cập nhật nhân viên');
      } else {
        // Create
        if (!form.username.trim()) {
          toast.error('Vui lòng nhập tên đăng nhập');
          setSaving(false);
          return;
        }
        if (!form.password || form.password.length < 4) {
          toast.error('Mật khẩu phải có ít nhất 4 ký tự');
          setSaving(false);
          return;
        }
        await usersApi.create({
          username: form.username.trim(),
          password: form.password,
          full_name: form.full_name.trim(),
          phone: form.phone.trim() || undefined,
          roles: form.roles,
        });
        toast.success('Đã thêm nhân viên mới');
      }
      setModalOpen(false);
      loadUsers();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Có lỗi xảy ra';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle active ──
  const handleToggleActive = async (u: StaffUser) => {
    if (u.id === currentUser?.id) {
      toast.error('Không thể khoá chính tài khoản của bạn');
      return;
    }
    try {
      await usersApi.toggleActive(u.id);
      toast.success(u.is_active ? `Đã khoá ${u.full_name}` : `Đã mở khoá ${u.full_name}`);
      loadUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  // ── Render ──
  return (
    <div>
      <PageHeader title="Nhân viên" subtitle="Quản lý tài khoản nhân viên">
        {isAdmin && (
          <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>
            Thêm nhân viên
          </Button>
        )}
      </PageHeader>

      {/* Search bar */}
      <div className="mb-4 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Tìm nhân viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Card padding="none">
          <Skeleton className="h-16 rounded-none" count={5} />
        </Card>
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={<UsersIcon className="w-12 h-12" />}
          title={search ? 'Không tìm thấy nhân viên' : 'Chưa có nhân viên'}
          description={search ? 'Thử tìm kiếm với từ khoá khác' : 'Thêm nhân viên đầu tiên'}
        />
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nhân viên</th>
                  <th>Tên đăng nhập</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  {isAdmin && <th className="text-right">Thao tác</th>}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filteredUsers.map((u) => (
                    <motion.tr
                      key={u.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar name={u.full_name} size="sm" />
                          <div>
                            <span className="font-medium">{u.full_name}</span>
                            {u.phone && (
                              <p className="text-xs text-text-muted">{u.phone}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-text-secondary font-mono text-sm">{u.username}</td>
                      <td>
                        <div className="flex gap-1.5 flex-wrap">
                          {u.roles.map((role, i) => (
                            <span
                              key={i}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(role)}`}
                            >
                              <Shield className="w-3 h-3" />
                              {getRoleLabel(role)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        {isAdmin && u.id !== currentUser?.id ? (
                          <Switch
                            checked={u.is_active}
                            onChange={() => handleToggleActive(u)}
                            label={u.is_active ? 'Hoạt động' : 'Khoá'}
                          />
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-success' : 'bg-error'}`}
                            />
                            <span className="text-sm">
                              {u.is_active ? 'Hoạt động' : 'Khoá'}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="text-text-muted text-sm">
                        {u.created_at ? formatDate(u.created_at) : '—'}
                      </td>
                      {isAdmin && (
                        <td className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Pencil className="w-3.5 h-3.5" />}
                            onClick={() => openEdit(u)}
                          >
                            Sửa
                          </Button>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Stats footer */}
      <div className="mt-4 flex items-center gap-4 text-sm text-text-muted">
        <span>Tổng: {users.length} nhân viên</span>
        <span>•</span>
        <span className="text-success">
          {users.filter((u) => u.is_active).length} hoạt động
        </span>
        <span className="text-error">
          {users.filter((u) => !u.is_active).length} khoá
        </span>
      </div>

      {/* ── Create/Edit Modal ── */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? `Sửa nhân viên: ${editingUser.full_name}` : 'Thêm nhân viên mới'}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Huỷ
            </Button>
            <Button
              onClick={handleSave}
              loading={saving}
              icon={editingUser ? <Pencil className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            >
              {editingUser ? 'Cập nhật' : 'Thêm nhân viên'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Username — chỉ khi tạo mới */}
          {!editingUser && (
            <Input
              label="Tên đăng nhập"
              placeholder="vd: nhanvien01"
              value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              helperText="Chỉ chứa chữ, số, dấu chấm và gạch dưới"
            />
          )}

          {/* Full name */}
          <Input
            label="Họ và tên"
            placeholder="vd: Nguyễn Văn A"
            value={form.full_name}
            onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
          />

          {/* Phone */}
          <Input
            label="Số điện thoại"
            placeholder="vd: 0901234567"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          />

          {/* Password */}
          <div className="relative">
            <Input
              label={editingUser ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}
              type={showPassword ? 'text' : 'password'}
              placeholder={editingUser ? '••••••' : 'Nhập mật khẩu'}
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-text-muted hover:text-text-primary transition"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Roles */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Vai trò
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_ROLES.map((role) => {
                const selected = form.roles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={`
                      flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all
                      ${
                        selected
                          ? 'border-brand-primary bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/30'
                          : 'border-border bg-white text-text-secondary hover:border-brand-primary/40 hover:bg-bg-secondary'
                      }
                    `}
                  >
                    <Shield className="w-4 h-4" />
                    <span>{getRoleLabel(role)}</span>
                    {selected && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto text-brand-primary text-xs"
                      >
                        ✓
                      </motion.span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
