import type { Metadata } from 'next';
import 'katex/dist/katex.min.css';
import '../src/index.css';

export const metadata: Metadata = {
  title: 'ProofLab',
  description: 'A visual algebra-reasoning debugger.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
