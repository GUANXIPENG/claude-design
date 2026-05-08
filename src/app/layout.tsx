import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Design Workspace",
  description: "Phase 1 scaffold for an AI design generation workspace."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
