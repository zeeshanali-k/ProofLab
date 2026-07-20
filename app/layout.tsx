import type { Metadata } from 'next';
import '@excalidraw/excalidraw/index.css';
import 'katex/dist/katex.min.css';
import '../src/index.css';

const themeInitializer = `(() => { try { const saved = localStorage.getItem('prooflab:theme'); const theme = saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); document.documentElement.dataset.theme = theme; } catch { document.documentElement.dataset.theme = 'light'; } })();`;

export const metadata: Metadata = {
  title: 'ProofLab',
  description: 'A visual algebra-reasoning debugger.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeInitializer }} /></head>
      <body>{children}</body>
    </html>
  );
}
