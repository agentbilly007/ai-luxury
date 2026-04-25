import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Luxury — Members Portal',
  description: 'Your AI. Your community. Always learning.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
