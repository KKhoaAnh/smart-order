'use client';
import { useState, useEffect } from 'react';
import { ShieldAlert, Phone, Copy, CheckCircle2, ArrowLeft } from 'lucide-react';
import { storeApi } from '@/app/lib/api';
import { useRouter } from 'next/navigation';

interface AccessDeniedProps {
  title?: string;
  description?: string;
}

export default function AccessDenied({
  title = 'Không có quyền truy cập',
  description = 'Tính năng này chỉ dành cho Quản lý. Nếu bạn cần thực hiện thay đổi, vui lòng liên hệ quản lý cửa hàng.',
}: AccessDeniedProps) {
  const router = useRouter();
  const [storePhone, setStorePhone] = useState<string>('');
  const [storeName, setStoreName] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await storeApi.getInfo();
        const data = res.data || res;
        setStorePhone(data.phone || '');
        setStoreName(data.name || '');
      } catch {
        // silently fail
      }
    };
    fetchStore();
  }, []);

  const handleCopy = async () => {
    if (!storePhone) return;
    const cleanPhone = storePhone.replace(/\s/g, '');
    try {
      await navigator.clipboard.writeText(cleanPhone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = cleanPhone;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCall = () => {
    if (!storePhone) return;
    const cleanPhone = storePhone.replace(/\s/g, '');
    window.open(`tel:${cleanPhone}`, '_self');
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="animate-scale-in max-w-md w-full">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
              <ShieldAlert className="w-10 h-10 text-amber-700" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        </div>

        {/* Contact Card */}
        {storePhone && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Phone className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <p className="text-xs text-amber-600 font-medium">Liên hệ quản lý</p>
                <p className="text-sm font-semibold text-gray-900">{storeName || 'Quản lý cửa hàng'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 mb-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="flex-1 text-base font-mono font-semibold text-gray-800 tracking-wide">
                {storePhone}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-amber-200 rounded-xl text-sm font-medium text-amber-800 hover:bg-amber-50 transition-all duration-200 active:scale-95"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Đã sao chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Sao chép SĐT</span>
                  </>
                )}
              </button>
              <button
                onClick={handleCall}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-700 to-amber-800 rounded-xl text-sm font-medium text-white hover:from-amber-800 hover:to-amber-900 transition-all duration-200 active:scale-95 shadow-sm"
              >
                <Phone className="w-4 h-4" />
                <span>Gọi ngay</span>
              </button>
            </div>
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard/orders')}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại Đơn hàng
        </button>
      </div>
    </div>
  );
}
