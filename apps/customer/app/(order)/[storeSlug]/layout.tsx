'use client';

import { useSocket } from '../../hooks/useSocket';

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize WebSocket connection for real-time updates
  useSocket();

  return <>{children}</>;
}
