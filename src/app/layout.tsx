import './globals.css';

export const metadata = {
  title: 'AI Trade Guru - Advanced Behavioral Dashboard',
  description: 'SaaS Platform for Indian Retail F&O Traders',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
