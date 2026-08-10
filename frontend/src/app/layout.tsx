import type { Metadata } from 'next';
import { Geist, Geist_Mono, Oswald } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/sonner';

const oswald = Oswald({
  variable: '--font-oswald',
  subsets: ['latin', 'vietnamese'],
});

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ClGV - Film Ticket Platform',
  description: 'Trải nghiệm điện ảnh đỉnh cao phong cách CGV',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} ${oswald.className} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col relative bg-black text-foreground">
        {/* Global Ambient Lights */}
        <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none z-0" />
        <div className="fixed bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none z-0" />
        <div className="fixed top-[40%] left-[30%] w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
        
        <div className="relative z-10 flex flex-col min-h-full">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
