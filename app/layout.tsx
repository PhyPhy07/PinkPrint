import type { Metadata, Viewport } from "next";
import { Gloock } from "next/font/google";
import "./globals.css";

const gloock = Gloock({
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Pink Print | DIY Project Planner",
  description: "A DIY project cost planner for painting, flooring, and fence projects",
  icons: {
    icon: "/logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="w-full overflow-x-hidden">
      <body className={`${gloock.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
