import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Asesoría en Línea",
  description: "Formulario de contacto y asesoría",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-gray-900 text-slate-100">
        {children}
      </body>
    </html>
  );
}
