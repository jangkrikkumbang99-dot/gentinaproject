import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "GENTINA JAYA TEXTILE - Solusi tepat untuk kebutuhan kain dan konveksimu",
  description: "Distributor & retail kain berkualitas tinggi dan perlengkapan konveksi terlengkap. Katun combed, rayon twill, fleece, benang astra, gunting konveksi, jarum mesin, kancing, dan aksesoris jahit.",
  keywords: ["kain", "konveksi", "gentina jaya textile", "katun combed", "alat konveksi", "benang astra", "grosir kain", "kain roll"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased selection:bg-teal-500 selection:text-white">
        <ToastProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
