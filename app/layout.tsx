import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Barrio MAX TV",
  description: "Pantalla digital de promociones y servicios de Barrio MAX.",
  applicationName: "Barrio MAX TV",
  icons: {
    icon: "/assets/logo-mark.svg",
    apple: "/assets/logo-mark.svg"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#d80712",
  colorScheme: "dark"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
