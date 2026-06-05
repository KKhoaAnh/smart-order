import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

/* ============================================================
   Font Configuration
   ============================================================ */

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-sans',
});

const playfair = Playfair_Display({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
});

/* ============================================================
   Metadata & Viewport
   ============================================================ */

export const metadata: Metadata = {
  title: 'Smart Order | Đặt món thông minh',
  description:
    'Đặt món nhanh chóng và tiện lợi bằng cách quét mã QR tại bàn. Không cần tải app, không cần chờ đợi.',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FAFAF8',
};

/* ============================================================
   Root Layout
   ============================================================ */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        {children}

        <Toaster
          position="bottom-center"
          containerStyle={{
            bottom: 80,
          }}
          toastOptions={{
            duration: 3000,
            style: {
              background: '#3D2B1F',
              color: '#FFFFFF',
              fontSize: '0.875rem',
              fontWeight: 500,
              borderRadius: '0.75rem',
              padding: '0.75rem 1rem',
              maxWidth: '360px',
              boxShadow:
                '0 12px 32px rgba(111, 78, 55, 0.2), 0 4px 8px rgba(111, 78, 55, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#22C55E',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
