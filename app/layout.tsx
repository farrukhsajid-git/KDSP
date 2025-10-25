import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KDSP Event RSVP",
  description: "RSVP for our special event",
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
