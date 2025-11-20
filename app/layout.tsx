import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CofiBlocks - Premium Costa Rican Coffee",
  description: "Purchase premium Caturra & Catuai coffee blends from Costa Rica",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
