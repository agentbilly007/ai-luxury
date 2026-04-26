import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Luxury Network',
  description: 'The exclusive AI-powered community for luxury professionals.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
