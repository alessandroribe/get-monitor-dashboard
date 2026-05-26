import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Get Monitor — Dashboard",
  description: "Monitoramento em tempo real e alertas inteligentes",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  )
}
