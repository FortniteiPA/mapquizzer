import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "US States and Capitals Map Quiz",
  description: "Interactive US map quiz with states and capitals, ports from Tkinter app."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}