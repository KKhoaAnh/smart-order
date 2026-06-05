'use client';

import React, { useCallback } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';

// ============================================================
// BottomSheet — Modal trượt từ dưới lên (dùng framer-motion)
// ============================================================

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: number[];
}

const DISMISS_THRESHOLD = 120;

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const sheetVariants = {
  hidden: { y: '100%' },
  visible: { y: 0 },
  exit: { y: '100%' },
};

const springTransition = {
  type: 'spring' as const,
  damping: 30,
  stiffness: 300,
  mass: 0.8,
};

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  snapPoints = [0.9],
}: BottomSheetProps) {
  const maxSnap = Math.max(...snapPoints);
  const sheetHeight = `${maxSnap * 100}vh`;

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      // Đóng nếu kéo xuống quá ngưỡng hoặc velocity đủ nhanh
      if (info.offset.y > DISMISS_THRESHOLD || info.velocity.y > 500) {
        onClose();
      }
    },
    [onClose],
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="bottomsheet-backdrop"
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            key="bottomsheet-content"
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-white rounded-t-3xl shadow-2xl"
            style={{ maxHeight: sheetHeight }}
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={springTransition}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Bottom sheet'}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* Title */}
            {title && (
              <div className="px-5 pb-3 border-b border-[#E8E0D8]">
                <h2 className="text-lg font-semibold text-[#1A1A1A]">
                  {title}
                </h2>
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
