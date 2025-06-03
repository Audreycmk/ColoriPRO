import './globals.css';
import { Quicksand } from 'next/font/google';
import PageWrapper from '@/components/PageWrapper';

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-quicksand',
});

export const metadata = {
  title: 'Colori PRO',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={quicksand.variable}>
      <body>
        <PageWrapper>{children}</PageWrapper>
      </body>
    </html>
  );
}
