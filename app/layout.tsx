import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FusoCenter",
  description: "Platform digital marketing dan penjualan Mitsubishi Fuso.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
