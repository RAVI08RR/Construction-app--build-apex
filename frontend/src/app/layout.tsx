import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ApexBuild | Enterprise Construction Project Management SaaS',
  description: 'Collaborate with Builders, Contractors, Architects, and Clients in real-time.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
