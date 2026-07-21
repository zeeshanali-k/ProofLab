import type { Metadata } from 'next';
import '@excalidraw/excalidraw/index.css';
import 'katex/dist/katex.min.css';
import '../src/index.css';
import '../src/chemistry.css';
import '../src/physics.css';
import '../src/biology.css';
import { AuthProvider } from '../src/auth/AuthProvider';
import { ApplicationShell } from '../src/auth/ApplicationShell';

const themeInitializer = `(() => { try { const saved = localStorage.getItem('prooflab:theme'); const theme = saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); document.documentElement.dataset.theme = theme; } catch { document.documentElement.dataset.theme = 'light'; } })();`;

export const metadata: Metadata = {
  title: 'ProofLab | Interactive learning labs',
  description: 'Interactive Math, Chemistry, Physics, and Biology learning labs.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeInitializer }} /></head>
      <body>
        <AuthProvider><ApplicationShell>{children}</ApplicationShell></AuthProvider>
      </body>
    </html>
  );
}
