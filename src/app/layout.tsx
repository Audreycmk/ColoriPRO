import './globals.css';
import PageWrapper from '@/components/PageWrapper';

export const metadata = {
  title: 'Colori PRO',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PageWrapper>{children}</PageWrapper>
      </body>
    </html>
  );
}
