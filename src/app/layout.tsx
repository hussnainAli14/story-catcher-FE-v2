import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Story Catcher",
  description: "Bring your stories to life",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
