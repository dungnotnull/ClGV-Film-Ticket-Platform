import type { Metadata } from 'next';
import { Inter, Oswald, Instrument_Serif } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
});

const oswald = Oswald({
  variable: '--font-oswald',
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  variable: '--font-serif',
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ClGV - Film Ticket Platform',
  description: 'Trải nghiệm điện ảnh đỉnh cao phong cách CGV - Chuẩn mực điện ảnh thế hệ mới',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${oswald.variable} ${instrumentSerif.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col relative bg-[#1f1a18] text-[#faf8f5] selection:bg-[#ff4b72]/30 selection:text-white">
        {/* Figma Ambient Glows (ClGV Midnight Rose) */}
        <div className="fixed top-[-100px] left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-[#ff4b72]/15 rounded-full blur-[160px] pointer-events-none z-0" />
        <div className="fixed bottom-[-150px] right-[-100px] w-[600px] h-[600px] bg-[#ff4b72]/10 rounded-full blur-[180px] pointer-events-none z-0" />
        
        <div className="relative z-10 flex flex-col min-h-full">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
