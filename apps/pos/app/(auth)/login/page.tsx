'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Coffee, User, Lock, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/app/components/ui/Input';
import { Button } from '@/app/components/ui/Button';
import { login } from '@/app/lib/api';
import { useAuthStore } from '@/app/stores/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      const data = await login(username, password);
      setAuth(data.user as any, data.access_token);
      toast.success('Đăng nhập thành công');
      router.replace('/dashboard/orders');
    } catch (err: any) {
      toast.error(err.message || 'Đăng nhập thất bại');
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
      className="w-full max-w-md"
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-border-light">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-dark flex items-center justify-center mb-4 shadow-lg">
            <Coffee className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-text-primary">
            Smart Order
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Đăng nhập hệ thống POS
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Tên đăng nhập"
            placeholder="Nhập tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
            autoComplete="username"
          />
          <Input
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            }
            autoComplete="current-password"
          />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            Đăng nhập
          </Button>
        </form>

        {/* Footer */}
        <p className="text-xs text-text-muted text-center mt-6">
          © 2026 Smart Order — Hệ thống đặt món thông minh
        </p>
      </div>
    </motion.div>
  );
}
