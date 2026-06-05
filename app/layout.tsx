import type { Metadata } from "next";
import { Inter, Pacifico, Amaranth, Courgette } from "next/font/google";
import { SocketProvider } from '@/lib/socket-context';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// Fuentes estilo hippie
const pacifico = Pacifico({ 
  weight: '400',
  subsets: ["latin"],
  variable: '--font-pacifico',
})

const amaranth = Amaranth({ 
  weight: ['400', '700'],
  subsets: ["latin"],
  variable: '--font-amaranth',
})

const courgette = Courgette({ 
  weight: '400',
  subsets: ["latin"],
  variable: '--font-courgette',
})

export const metadata: Metadata = {
  title: "ONE TO ONE - Delivery",
  description: "rapi / servi / delivery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${pacifico.variable} ${amaranth.variable} ${courgette.variable}`}>
      <body className={inter.className}>
        <SocketProvider>
          {children}
        </SocketProvider>
      </body>
    </html>
  );
}
