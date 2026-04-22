import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'College Decision Lab',
  description: 'Helping you make the best college choices.', // Change this to your tagline
  openGraph: {
    title: 'College Decision Lab',
    description: 'Data-driven insights for your college journey.',
    url: 'https://gidanatech.com',
    siteName: 'College Decision Lab',
    images: [
      {
        url: 'https://gidanatech.com', // Path to a preview image in your /public folder
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'College Decision Lab',
    description: 'Data-driven insights for your college journey.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
