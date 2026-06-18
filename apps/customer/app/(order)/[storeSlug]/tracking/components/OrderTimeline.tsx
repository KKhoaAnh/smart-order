'use client';

import { motion } from 'framer-motion';
import { Clock, CheckCircle2, ChefHat, UtensilsCrossed, XCircle } from 'lucide-react';

interface OrderTimelineProps {
  status: string;
  rejectReason?: string;
}

const STEPS = [
  {
    key: 'PENDING',
    label: 'Chờ xác nhận',
    sublabel: 'Đơn hàng đang chờ thu ngân duyệt',
    icon: Clock,
    color: '#F59E0B',
  },
  {
    key: 'CONFIRMED',
    label: 'Đã xác nhận',
    sublabel: 'Bếp đang chuẩn bị món cho bạn',
    icon: CheckCircle2,
    color: '#6F4E37',
  },
  {
    key: 'COOKING',
    label: 'Đang chế biến',
    sublabel: 'Đầu bếp đang nấu nướng...',
    icon: ChefHat,
    color: '#3B82F6',
  },
  {
    key: 'COMPLETED',
    label: 'Hoàn thành',
    sublabel: 'Tất cả món đã được phục vụ',
    icon: UtensilsCrossed,
    color: '#22C55E',
  },
];

export function OrderTimeline({ status, rejectReason }: OrderTimelineProps) {
  // Cancelled state
  if (status === 'CANCELLED') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: '#FEE2E2',
          borderRadius: 16,
          padding: 20,
          textAlign: 'center',
        }}
      >
        <XCircle size={40} color="#EF4444" style={{ margin: '0 auto 12px' }} />
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#991B1B', margin: 0, marginBottom: 6 }}>
          Đơn hàng đã bị hủy
        </h3>
        {rejectReason && (
          <p style={{ fontSize: 13, color: '#B91C1C', margin: 0 }}>
            Lý do: {rejectReason}
          </p>
        )}
        <p style={{ fontSize: 13, color: '#991B1B', margin: 0, marginTop: 8 }}>
          Bạn có thể đặt lại đơn hàng mới.
        </p>
      </motion.div>
    );
  }

  // Determine which step is active
  // Map: CONFIRMED can also mean items are cooking (we handle at order level)
  const getStepIndex = () => {
    switch (status) {
      case 'PENDING': return 0;
      case 'CONFIRMED': return 1;
      case 'COOKING': return 2;
      case 'COMPLETED': return 3;
      default: return 0;
    }
  };

  const currentStep = getStepIndex();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {STEPS.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isPending = index > currentStep;
        const IconComponent = step.icon;

        return (
          <motion.div
            key={step.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
              display: 'flex',
              gap: 14,
              position: 'relative',
            }}
          >
            {/* Timeline line + dot */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: 36,
                flexShrink: 0,
              }}
            >
              {/* Dot / Icon */}
              <motion.div
                animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                transition={isActive ? { duration: 1.5, repeat: Infinity } : {}}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: isCompleted || isActive ? step.color : '#E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isActive ? `0 0 0 4px ${step.color}22` : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                <IconComponent
                  size={18}
                  color={isCompleted || isActive ? '#FFFFFF' : '#9CA3AF'}
                  strokeWidth={2}
                />
              </motion.div>

              {/* Connecting line */}
              {index < STEPS.length - 1 && (
                <div
                  style={{
                    width: 2,
                    flex: 1,
                    minHeight: 24,
                    backgroundColor: isCompleted ? step.color : '#E5E7EB',
                    transition: 'background-color 0.3s ease',
                  }}
                />
              )}
            </div>

            {/* Content */}
            <div style={{ paddingBottom: index < STEPS.length - 1 ? 20 : 0, paddingTop: 4 }}>
              <h4
                style={{
                  fontSize: 14,
                  fontWeight: isActive ? 700 : 600,
                  color: isPending ? '#9CA3AF' : '#1A1A1A',
                  margin: 0,
                  marginBottom: 2,
                  transition: 'color 0.3s ease',
                }}
              >
                {step.label}
              </h4>
              {(isActive || isCompleted) && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ fontSize: 12, color: '#6B6B6B', margin: 0 }}
                >
                  {step.sublabel}
                </motion.p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
