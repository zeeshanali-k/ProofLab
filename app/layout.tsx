import type { Metadata } from 'next';
import 'katex/dist/katex.min.css';
import '../src/index.css';
import '../src/chemistry.css';
import '../src/physics.css';
import '../src/biology.css';
import { Navigation } from '../src/components/Navigation';

export const metadata: Metadata = {
  title: 'ProofLab',
  description: 'A visual algebra-reasoning debugger.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
