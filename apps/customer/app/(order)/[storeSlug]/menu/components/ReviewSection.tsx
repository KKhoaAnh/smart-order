'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star } from 'lucide-react';
import {
  getProductReviews,
  getReviewSummary,
  type ReviewData,
  type ReviewSummary,
} from '../../../../lib/customer-api';
import { ReviewForm } from './ReviewForm';
import { formatDate } from '../../../../lib/format';

interface ReviewSectionProps {
  productId: number;
}

export function ReviewSection({ productId }: ReviewSectionProps) {
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const loadData = useCallback(async (p = 1, append = false) => {
    setLoading(true);
    try {
      const [sum, pageData] = await Promise.all([
        p === 1 ? getReviewSummary(productId) : Promise.resolve(summary),
        getProductReviews(productId, p),
      ]);
      if (p === 1 && sum) setSummary(sum);
      setReviews((prev) => (append ? [...prev, ...pageData.data] : pageData.data));
      setPage(pageData.page);
      setTotalPages(pageData.totalPages);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [productId, summary]);

  useEffect(() => {
    loadData(1);
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReviewSuccess = () => {
    setShowForm(false);
    loadData(1);
  };

  return (
    <div style={{ padding: '20px 20px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>Đánh giá</h4>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              fontSize: 13, fontWeight: 600, color: '#6F4E37',
              background: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            Viết đánh giá
          </button>
        )}
      </div>

      {showForm ? (
        <ReviewForm productId={productId} onSuccess={handleReviewSuccess} onCancel={() => setShowForm(false)} />
      ) : (
        <>
          {summary && summary.total_count > 0 && (
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ textAlign: 'center', minWidth: 56 }}>
                <p style={{ fontSize: 28, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
                  {summary.avg_rating}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={12} fill={n <= Math.round(summary.avg_rating) ? '#F59E0B' : 'transparent'} color="#F59E0B" />
                  ))}
                </div>
                <p style={{ fontSize: 11, color: '#9CA3AF', margin: '4px 0 0' }}>{summary.total_count} đánh giá</p>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'center' }}>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = summary.distribution[star] || 0;
                  const pct = summary.total_count ? (count / summary.total_count) * 100 : 0;
                  return (
                    <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, color: '#6B6B6B', width: 8 }}>{star}</span>
                      <div style={{ flex: 1, height: 6, backgroundColor: '#F5F0EB', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#F59E0B', borderRadius: 3 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {loading && reviews.length === 0 ? (
            <p style={{ fontSize: 13, color: '#9CA3AF' }}>Đang tải...</p>
          ) : reviews.length === 0 ? (
            <p style={{ fontSize: 13, color: '#9CA3AF' }}>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {reviews.map((r) => (
                <div key={r.id} style={{ padding: '12px 0', borderTop: '1px solid #F5F0EB' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 14, backgroundColor: '#6F4E37',
                      color: '#fff', fontSize: 12, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {r.customer?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>{r.customer?.name}</p>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} size={10} fill={n <= r.rating ? '#F59E0B' : 'transparent'} color="#F59E0B" />
                        ))}
                      </div>
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9CA3AF' }}>{formatDate(r.created_at)}</span>
                  </div>
                  {r.comment && <p style={{ fontSize: 13, color: '#6B6B6B', margin: '4px 0 0', lineHeight: 1.5 }}>{r.comment}</p>}
                </div>
              ))}
              {page < totalPages && (
                <button
                  onClick={() => loadData(page + 1, true)}
                  disabled={loading}
                  style={{
                    padding: '10px', borderRadius: 10, border: '1px solid #E8E0D8',
                    background: '#fff', fontSize: 13, color: '#6F4E37', cursor: 'pointer',
                  }}
                >
                  {loading ? 'Đang tải...' : 'Xem thêm'}
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
