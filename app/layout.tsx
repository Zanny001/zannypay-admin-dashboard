import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
<<<<<<< HEAD
=======
import { ThemeProvider } from '@/components/theme-provider';
>>>>>>> cc343e15 (Upgrade to v8 commit)

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' });

export const metadata: Metadata = {
  title: 'ZannyPay Admin Console',
  description: 'Internal admin dashboard for ZannyPay.',
};

<<<<<<< HEAD
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>{children}</body>
=======
// Inline, blocking script — runs before React hydrates, so the correct
// theme class is on <html> for the very first paint. Without this, a
// dark-mode admin would see a flash of the light theme on every full page
// load before ThemeProvider's effect ran. try/catch guards the rare case
// localStorage is unavailable (privacy mode, some embedded webviews).
const noFlashThemeScript = `
(function() {
  try {
    var stored = localStorage.getItem('zannypay-admin-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (!stored && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashThemeScript }} />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
>>>>>>> cc343e15 (Upgrade to v8 commit)
    </html>
  );
}
