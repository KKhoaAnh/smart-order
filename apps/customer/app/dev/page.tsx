'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Coffee, Monitor, ExternalLink, Wifi, WifiOff, Database, RefreshCw, Copy, Check, Info } from 'lucide-react';

/* ============================================================
   DEV HELPER PAGE — Chỉ hiện khi NODE_ENV = development
   Dùng để test flow QR → Menu → Cart → Order → Tracking
   ============================================================ */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface StoreInfo {
  id: number;
  name: string;
  address: string;
  phone: string;
  opening_hours: string;
  status: string;
}

interface TableInfo {
  id: number;
  table_number: string;
  qr_code_token: string;
  capacity: number;
  area: string;
  status: string;
}

// Helper: slugify store name
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function DevHelperPage() {
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Check if we're in production — block access
  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (!isDev) return;
    fetchDevData();
  }, [isDev]);

  const fetchDevData = async () => {
    setLoading(true);
    setError(null);

    // 1. Check API health
    try {
      const healthRes = await fetch(`${API_BASE}/api`);
      setApiOnline(healthRes.ok);
    } catch {
      setApiOnline(false);
      setError('API server không hoạt động. Hãy chạy: npm run dev --workspace=api');
      setLoading(false);
      return;
    }

    // 2. Login as admin to get JWT
    try {
      const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin123' }),
      });

      if (!loginRes.ok) {
        throw new Error('Login failed. Seed data chưa chạy?');
      }

      const loginData = await loginRes.json();
      const token = loginData.data?.access_token || loginData.access_token;

      if (!token) {
        throw new Error('Không nhận được JWT token');
      }

      // 3. Fetch store info
      const storeRes = await fetch(`${API_BASE}/api/store`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const storeData = await storeRes.json();
      setStore(storeData.data);

      // 4. Fetch tables
      const tablesRes = await fetch(`${API_BASE}/api/tables`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tablesData = await tablesRes.json();
      setTables(tablesData.data || []);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const storeSlug = store ? slugify(store.name) : 'store';

  const getTableUrl = (token: string) => {
    return `/${storeSlug}?table=${token}`;
  };

  const copyToClipboard = (text: string, token: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const getAreaColor = (area: string) => {
    switch (area) {
      case 'Trong nhà': return { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' };
      case 'Ngoài trời': return { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' };
      case 'VIP': return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
      default: return { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return { bg: '#DCFCE7', text: '#15803D' };
      case 'OCCUPIED': return { bg: '#FEE2E2', text: '#DC2626' };
      case 'RESERVED': return { bg: '#FEF3C7', text: '#B45309' };
      default: return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  // Block production access
  if (!isDev) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', backgroundColor: '#FAFAF8',
        fontFamily: "'Inter', sans-serif",
      }}>
        <p style={{ color: '#DC2626', fontSize: 16, fontWeight: 600 }}>
          ⛔ Trang này chỉ khả dụng trong môi trường Development.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
        padding: '28px 20px 24px',
        color: '#FFFFFF',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Monitor size={20} color="#FFFFFF" />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
                🛠️ Dev Helper
              </h1>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                Smart Order QR — Testing Dashboard
              </p>
            </div>
          </div>

          {/* Status indicators */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <StatusPill
              icon={apiOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              label={apiOnline === null ? 'Checking...' : apiOnline ? 'API Online' : 'API Offline'}
              color={apiOnline === null ? '#94A3B8' : apiOnline ? '#22C55E' : '#EF4444'}
            />
            <StatusPill
              icon={<Database size={12} />}
              label={store ? store.name : 'Loading...'}
              color={store ? '#3B82F6' : '#94A3B8'}
            />
            <StatusPill
              icon={<Coffee size={12} />}
              label={`${tables.length} bàn`}
              color="#A0785D"
            />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 16px 40px' }}>
        {/* Error state */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '14px 18px',
              borderRadius: 12,
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#991B1B',
              fontSize: 13,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 18 }}>⚠️</span>
            <div>
              <strong>Lỗi kết nối</strong>
              <p style={{ margin: '4px 0 0', opacity: 0.8 }}>{error}</p>
            </div>
          </motion.div>
        )}

        {/* Info banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '14px 18px',
            borderRadius: 12,
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            marginBottom: 24,
            fontSize: 13,
            color: '#1E40AF',
            display: 'flex',
            gap: 10,
          }}
        >
          <Info size={18} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ lineHeight: 1.6 }}>
            <strong>Cách sử dụng:</strong> Click vào bàn bất kỳ bên dưới để mô phỏng khách quét QR.
            Bạn sẽ được chuyển đến Landing Page → Menu → Đặt món như khách hàng thật.
          </div>
        </motion.div>

        {/* Refresh button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', margin: 0 }}>
            📋 Danh sách bàn
          </h2>
          <button
            onClick={fetchDevData}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 8,
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              color: '#475569',
              fontSize: 12, fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Đang tải...' : 'Refresh'}
          </button>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={{
                height: 140, borderRadius: 14,
                background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 37%, #F1F5F9 63%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s ease-in-out infinite',
              }} />
            ))}
          </div>
        )}

        {/* Tables grid */}
        {!loading && tables.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {tables.map((table, index) => {
              const areaColor = getAreaColor(table.area);
              const statusColor = getStatusColor(table.status);
              const fullUrl = `${window.location.origin}${getTableUrl(table.qr_code_token)}`;

              return (
                <motion.div
                  key={table.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 14,
                    border: '1px solid #E2E8F0',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                  whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                >
                  {/* Card header */}
                  <div style={{
                    padding: '14px 16px 10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        backgroundColor: '#F5F0EB',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, fontWeight: 700, color: '#6F4E37',
                      }}>
                        {table.table_number.replace(/\D/g, '')}
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#1E293B', margin: 0 }}>
                          {table.table_number}
                        </p>
                        <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>
                          {table.capacity} chỗ ngồi
                        </p>
                      </div>
                    </div>

                    {/* Status badge */}
                    <span style={{
                      fontSize: 10, fontWeight: 600,
                      padding: '3px 8px', borderRadius: 20,
                      backgroundColor: statusColor.bg,
                      color: statusColor.text,
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                    }}>
                      {table.status === 'AVAILABLE' ? 'Trống' : table.status === 'OCCUPIED' ? 'Có khách' : table.status}
                    </span>
                  </div>

                  {/* Area tag */}
                  <div style={{ padding: '0 16px 10px' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 500,
                      padding: '2px 8px', borderRadius: 6,
                      backgroundColor: areaColor.bg,
                      color: areaColor.text,
                      border: `1px solid ${areaColor.border}`,
                    }}>
                      {table.area}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{
                    display: 'flex',
                    borderTop: '1px solid #F1F5F9',
                  }}>
                    {/* Open link */}
                    <a
                      href={getTableUrl(table.qr_code_token)}
                      style={{
                        flex: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '10px 0',
                        fontSize: 12, fontWeight: 600,
                        color: '#6F4E37',
                        textDecoration: 'none',
                        transition: 'background-color 0.15s',
                        backgroundColor: 'transparent',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FAF5F0')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <ExternalLink size={13} />
                      Vào bàn
                    </a>

                    {/* Copy URL */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(fullUrl, table.qr_code_token);
                      }}
                      style={{
                        flex: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '10px 0',
                        fontSize: 12, fontWeight: 500,
                        color: '#64748B',
                        border: 'none',
                        borderLeft: '1px solid #F1F5F9',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'background-color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {copiedToken === table.qr_code_token ? (
                        <><Check size={13} color="#22C55E" /> Đã copy</>
                      ) : (
                        <><Copy size={13} /> Copy URL</>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Quick Reference */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            marginTop: 32,
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
          }}
        >
          <div style={{
            padding: '14px 18px',
            backgroundColor: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1E293B', margin: 0 }}>
              📖 Quick Reference
            </h3>
          </div>

          <div style={{ padding: '16px 18px', fontSize: 13, color: '#475569', lineHeight: 1.8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', margin: '0 0 6px' }}>
                  API Server
                </p>
                <code style={{
                  padding: '3px 8px', borderRadius: 6,
                  backgroundColor: '#F1F5F9', fontSize: 12,
                  color: '#334155',
                }}>{API_BASE}/api</code>
              </div>

              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', margin: '0 0 6px' }}>
                  Customer App
                </p>
                <code style={{
                  padding: '3px 8px', borderRadius: 6,
                  backgroundColor: '#F1F5F9', fontSize: 12,
                  color: '#334155',
                }}>localhost:3000</code>
              </div>

              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', margin: '0 0 6px' }}>
                  Test Accounts
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <code style={{ padding: '2px 8px', borderRadius: 6, backgroundColor: '#F1F5F9', fontSize: 11, color: '#334155' }}>
                    admin / admin123
                  </code>
                  <code style={{ padding: '2px 8px', borderRadius: 6, backgroundColor: '#F1F5F9', fontSize: 11, color: '#334155' }}>
                    kitchen / kitchen123
                  </code>
                  <code style={{ padding: '2px 8px', borderRadius: 6, backgroundColor: '#F1F5F9', fontSize: 11, color: '#334155' }}>
                    cashier / cashier123
                  </code>
                </div>
              </div>

              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', margin: '0 0 6px' }}>
                  Database Reset
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <code style={{ padding: '2px 8px', borderRadius: 6, backgroundColor: '#FFF7ED', fontSize: 11, color: '#9A3412' }}>
                    docker-compose down -v
                  </code>
                  <code style={{ padding: '2px 8px', borderRadius: 6, backgroundColor: '#FFF7ED', fontSize: 11, color: '#9A3412' }}>
                    docker-compose up -d
                  </code>
                  <code style={{ padding: '2px 8px', borderRadius: 6, backgroundColor: '#FFF7ED', fontSize: 11, color: '#9A3412' }}>
                    npm run seed --workspace=api
                  </code>
                </div>
              </div>
            </div>

            {/* URL format */}
            <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 10, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', margin: '0 0 6px' }}>
                URL Format (mô phỏng QR scan)
              </p>
              <code style={{ fontSize: 12, color: '#6F4E37', wordBreak: 'break-all' }}>
                http://localhost:3000/<span style={{ color: '#2563EB' }}>{'{storeSlug}'}</span>?table=<span style={{ color: '#DC2626' }}>{'{qr_code_token}'}</span>
              </code>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          fontSize: 11,
          color: '#94A3B8',
          marginTop: 32,
        }}>
          🔒 Trang này chỉ hiện trong môi trường Development (NODE_ENV=development)
        </p>
      </div>

      {/* Shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

// ── Sub-components ──

function StatusPill({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 10px',
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.1)',
      fontSize: 11,
      fontWeight: 500,
      color: 'rgba(255,255,255,0.8)',
    }}>
      <span style={{ color }}>{icon}</span>
      <span>{label}</span>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        backgroundColor: color,
      }} />
    </div>
  );
}
