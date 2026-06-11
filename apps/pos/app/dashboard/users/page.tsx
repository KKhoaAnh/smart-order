'use client';

import { useEffect, useState } from 'react';
import { Users as UsersIcon, Plus, Shield } from 'lucide-react';
import { PageHeader } from '@/app/components/layout/PageHeader';
import { Card } from '@/app/components/ui/Card';

import { Button } from '@/app/components/ui/Button';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { Avatar } from '@/app/components/ui/Avatar';
import { useAuthStore } from '@/app/stores/authStore';
import { getRoleLabel, getRoleColor } from '@/app/lib/utils';
import { formatDate } from '@/app/lib/format';
import { apiFetch } from '@/app/lib/api';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data: any[] = await apiFetch('users');
        setUsers(data);
      } catch {
        // Fallback: show current user if API not available
        if (user) setUsers([user]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  return (
    <div>
      <PageHeader title="Nhân viên" subtitle="Quản lý tài khoản nhân viên">
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => toast('Tính năng đang phát triển', { icon: '🚧' })}>
          Thêm nhân viên
        </Button>
      </PageHeader>

      {loading ? (
        <Card padding="none">
          <Skeleton className="h-16 rounded-none" count={5} />
        </Card>
      ) : users.length === 0 ? (
        <EmptyState icon={<UsersIcon className="w-12 h-12" />} title="Chưa có nhân viên" />
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
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={u.full_name} size="sm" />
                        <span className="font-medium">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="text-text-secondary">{u.username}</td>
                    <td>
                      <div className="flex gap-1.5 flex-wrap">
                        {(u.roles || []).map((role: string, i: number) => (
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
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${u.is_active !== false ? 'bg-success' : 'bg-error'}`} />
                        <span className="text-sm">{u.is_active !== false ? 'Hoạt động' : 'Khoá'}</span>
                      </div>
                    </td>
                    <td className="text-text-muted text-sm">
                      {u.created_at ? formatDate(u.created_at) : '—'}
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
