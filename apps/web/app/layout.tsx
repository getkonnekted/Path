import type { Metadata } from "next";
import "@neondatabase/auth-ui/css";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "PATH — Know Scripture. Walk the path.",
  description:
    "Build lasting understanding of Scripture through guided journeys, memory, and connected biblical knowledge."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
