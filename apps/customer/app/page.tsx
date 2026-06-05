'use client';

import { motion } from 'framer-motion';
import { Coffee, ScanLine } from 'lucide-react';

/* ============================================================
   Root Page — No QR Context
   Hiển thị khi khách truy cập trực tiếp (không qua quét QR)
   ============================================================ */

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-bg-primary px-6">
      <motion.div
        className="flex max-w-sm flex-col items-center text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Coffee Icon */}
        <motion.div
          className="relative mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-bg-secondary">
            <Coffee
              className="h-11 w-11 text-brand-primary"
              strokeWidth={1.5}
            />
          </div>

          {/* Decorative ring */}
          <motion.div
            className="absolute -inset-3 rounded-full border border-brand-light/40"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          />
          <motion.div
            className="absolute -inset-6 rounded-full border border-brand-light/20"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.55 }}
          />
        </motion.div>

        {/* Brand Name */}
        <motion.h1
          className="heading-display mb-3 text-2xl text-brand-primary"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          Smart Order
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="mb-8 text-sm leading-relaxed text-text-secondary"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          Đặt món nhanh chóng, tiện lợi.
          <br />
          Không cần tải app, không cần chờ đợi.
        </motion.p>

        {/* Divider */}
        <motion.div
          className="divider mb-8 max-w-[120px]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.4, delay: 0.45 }}
        />

        {/* QR Instruction */}
        <motion.div
          className="card flex items-center gap-3 px-5 py-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10">
            <ScanLine className="h-5 w-5 text-brand-primary" strokeWidth={1.8} />
          </div>
          <p className="text-left text-sm leading-snug text-text-primary">
            Vui lòng quét mã QR tại bàn
            <br />
            <span className="text-text-muted">để bắt đầu đặt món</span>
          </p>
        </motion.div>

        {/* Footer hint */}
        <motion.p
          className="mt-10 text-xs text-text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          Powered by Smart Order QR
        </motion.p>
      </motion.div>
    </main>
  );
}
