import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

// Enhanced SEO metadata
export const metadata = {
  title: {
    default: 'FinBoard - Real-time Finance Dashboard',
    template: '%s | FinBoard'
  },
  description: 'Create customizable real-time finance dashboards by connecting to various financial APIs. Monitor stocks, crypto, and market data with drag-and-drop widgets.',
  keywords: ['finance dashboard', 'real-time data', 'stock market', 'crypto', 'API integration', 'widgets', 'trading'],
  authors: [{ name: 'FinBoard Team' }],
  creator: 'FinBoard',
  publisher: 'FinBoard',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://finboard.vercel.app'), // Replace with your actual domain
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://finboard.vercel.app', // Replace with your actual domain
    title: 'FinBoard - Real-time Finance Dashboard',
    description: 'Create customizable real-time finance dashboards by connecting to various financial APIs. Monitor stocks, crypto, and market data with drag-and-drop widgets.',
    siteName: 'FinBoard',
    images: [
      {
        url: '/groww_img.png',
        width: 1200,
        height: 630,
        alt: 'FinBoard - Real-time Finance Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FinBoard - Real-time Finance Dashboard',
    description: 'Create customizable real-time finance dashboards by connecting to various financial APIs.',
    images: ['/groww_img.png'],
    creator: '@finboard', // Replace with your actual Twitter handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification code
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Theme color */}
        <meta name="theme-color" content="#10b981" />
        <meta name="msapplication-TileColor" content="#10b981" />
        
        {/* Additional SEO */}
        <meta name="application-name" content="FinBoard" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FinBoard" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
